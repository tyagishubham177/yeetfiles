import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  applySuccessfulAction,
  buildSessionSummary,
  createEmptySessionStats,
  getRemainingForTarget,
} from '../features/rewards/session-stats';
import { nowIso } from '../lib/time';
import { asyncStorage } from '../persistence/async-storage';
import { APP_STORAGE_KEY } from '../persistence/storage-adapter';
import type { ActionLog, AnalyticsEvent, ReviewAction } from '../types/action-log';
import type { MilestoneEvent, MoveTarget, PersistedAppState, SessionStats, SettingsState, UndoEntry } from '../types/app-state';
import type {
  BucketType,
  FilterChip,
  FileItem,
  FileStatus,
  FilterType,
  FolderFilterType,
  PermissionState,
  QuickSessionTarget,
  SessionMode,
  SortMode,
} from '../types/file-item';

type ScanProgress = {
  loaded: number;
  total: number | null;
};

type AppStore = PersistedAppState & {
  hasHydrated: boolean;
  scanNonce: number;
  setHasHydrated: (value: boolean) => void;
  setPermissionState: (value: PermissionState) => void;
  beginQuickSession: (targetCount?: QuickSessionTarget, resetProgress?: boolean) => void;
  setActiveFilter: (value: FilterType) => void;
  setSortMode: (value: SortMode) => void;
  beginScan: () => void;
  receiveScanChunk: (items: FileItem[], progress: ScanProgress) => void;
  completeScan: () => void;
  failScan: (message: string) => void;
  keepCurrentFile: () => void;
  skipCurrentFile: () => void;
  undoLastAction: () => void;
  pruneExpiredUndoEntries: () => void;
  dismissMilestone: () => void;
  commitDeleteSuccess: (fileId: string, bytesDelta: number) => void;
  recordDeleteFailure: (fileId: string, errorCode: string, message: string) => void;
  recordPreviewOpen: (fileId: string) => void;
  requestRescan: () => void;
  toggleSetting: (key: keyof SettingsState) => void;
  resetOnboarding: () => void;
  commitMoveSuccess: (fileId: string, target: MoveTarget) => void;
  recordMoveFailure: (fileId: string, errorCode: string, message: string) => void;
  resetApp: () => Promise<void>;
  dismissSummary: () => void;
};

const INITIAL_SETTINGS: SettingsState = {
  hapticsEnabled: true,
  soundEnabled: false,
  animationsEnabled: true,
  followSystemTheme: true,
  showGestureHints: true,
  hasCompletedOnboarding: false,
  debugLoggingEnabled: true,
};

const INITIAL_PERSISTED_STATE: PersistedAppState = {
  permissionState: 'unknown',
  sessionMode: 'quick10',
  targetCount: 10,
  activeFilter: 'all',
  sortMode: 'oldest_first',
  currentFileId: null,
  queueOrder: [],
  filesById: {},
  actionLogs: [],
  analyticsEvents: [],
  lastCompletedScanAt: null,
  scanState: 'idle',
  scanProgressLoaded: 0,
  scanProgressTotal: null,
  scanError: null,
  sessionId: null,
  sessionStats: createEmptySessionStats(),
  sessionSummary: null,
  undoEntries: [],
  activeMilestone: null,
  recentMoveTargets: [],
  settings: INITIAL_SETTINGS,
};

const UNDO_WINDOW_MS = 5000;
const UNDO_BUFFER_LIMIT = 10;
const MILESTONE_COUNTS = [5, 25, 50, 100];
const BASE_FILTER_ORDER: FilterType[] = ['all', 'screenshots', 'camera', 'downloads'];
let cachedFilterChipQueueOrder: string[] | null = null;
let cachedFilterChipFilesById: Record<string, FileItem> | null = null;
let cachedFilterChips: FilterChip[] = [];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSessionModeForTarget(targetCount: QuickSessionTarget): SessionMode {
  if (targetCount === 25) {
    return 'quick25';
  }

  if (targetCount === 50) {
    return 'quick50';
  }

  return 'quick10';
}

function isActionableStatus(status: FileStatus): boolean {
  return status === 'pending' || status === 'skipped';
}

function slugifyFolderKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getFolderFilterId(file: Pick<FileItem, 'albumId' | 'albumTitle'>): FolderFilterType | null {
  if (file.albumId) {
    return `folder:${file.albumId}`;
  }

  if (!file.albumTitle) {
    return null;
  }

  const slug = slugifyFolderKey(file.albumTitle);
  return slug ? (`folder:title:${slug}` as FolderFilterType) : null;
}

function isFolderFilter(filter: FilterType): filter is FolderFilterType {
  return filter.startsWith('folder:');
}

function matchesFilter(file: FileItem, activeFilter: FilterType): boolean {
  if (activeFilter === 'all') {
    return true;
  }

  if (isFolderFilter(activeFilter)) {
    return file.bucketType === 'other' && getFolderFilterId(file) === activeFilter;
  }

  if (activeFilter === 'other') {
    return file.bucketType === 'other' && !file.albumTitle;
  }

  return file.bucketType === activeFilter;
}

function parseDateValue(value: string | null): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function randomizeDeterministically(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function compareFiles(left: FileItem, right: FileItem, sortMode: SortMode, queueIndex: Map<string, number>): number {
  if (sortMode === 'largest_first') {
    const sizeDelta = right.sizeBytes - left.sizeBytes;
    if (sizeDelta !== 0) {
      return sizeDelta;
    }
  }

  if (sortMode === 'newest_first') {
    const dateDelta = parseDateValue(right.createdAt) - parseDateValue(left.createdAt);
    if (dateDelta !== 0) {
      return dateDelta;
    }
  }

  if (sortMode === 'oldest_first') {
    const dateDelta = parseDateValue(left.createdAt) - parseDateValue(right.createdAt);
    if (dateDelta !== 0) {
      return dateDelta;
    }
  }

  if (sortMode === 'random') {
    const randomDelta = randomizeDeterministically(left.id) - randomizeDeterministically(right.id);
    if (randomDelta !== 0) {
      return randomDelta;
    }
  }

  return (queueIndex.get(left.id) ?? 0) - (queueIndex.get(right.id) ?? 0);
}

function getVisibleQueueIds(state: Pick<PersistedAppState, 'queueOrder' | 'filesById' | 'activeFilter' | 'sortMode'>): string[] {
  const queueIndex = new Map(state.queueOrder.map((fileId, index) => [fileId, index]));

  return state.queueOrder
    .map((fileId) => state.filesById[fileId])
    .filter((file): file is FileItem => Boolean(file) && isActionableStatus(file.status) && matchesFilter(file, state.activeFilter))
    .sort((left, right) => compareFiles(left, right, state.sortMode, queueIndex))
    .map((file) => file.id);
}

function resolveCurrentFileId(
  queueOrder: string[],
  filesById: Record<string, FileItem>,
  activeFilter: FilterType,
  sortMode: SortMode
): string | null {
  const visibleIds = getVisibleQueueIds({ queueOrder, filesById, activeFilter, sortMode });
  return visibleIds[0] ?? null;
}

function appendActionLog(
  logs: ActionLog[],
  action: ReviewAction,
  fileId: string,
  sessionId: string | null,
  result: ActionLog['result'],
  bytesDelta: number = 0,
  errorCode?: string,
  errorMessage?: string
): ActionLog[] {
  return [
    {
      id: createId('action'),
      fileId,
      action,
      result,
      timestamp: nowIso(),
      sessionId,
      bytesDelta,
      errorCode,
      errorMessage,
    },
    ...logs,
  ].slice(0, 200);
}

function appendAnalyticsEvent(events: AnalyticsEvent[], name: AnalyticsEvent['name'], sessionId: string): AnalyticsEvent[] {
  return [
    {
      id: createId('analytics'),
      name,
      sessionId,
      timestamp: nowIso(),
    },
    ...events,
  ].slice(0, 80);
}

function appendActionLogIfEnabled(
  state: PersistedAppState,
  action: ReviewAction,
  fileId: string,
  result: ActionLog['result'],
  bytesDelta: number = 0,
  errorCode?: string,
  errorMessage?: string
): ActionLog[] {
  if (!state.settings.debugLoggingEnabled) {
    return state.actionLogs;
  }

  return appendActionLog(state.actionLogs, action, fileId, state.sessionId, result, bytesDelta, errorCode, errorMessage);
}

function appendAnalyticsEventIfEnabled(
  state: PersistedAppState,
  events: AnalyticsEvent[],
  name: AnalyticsEvent['name'],
  sessionId: string
): AnalyticsEvent[] {
  if (!state.settings.debugLoggingEnabled) {
    return events;
  }

  return appendAnalyticsEvent(events, name, sessionId);
}

function maybeCaptureSummary(state: PersistedAppState, stats: SessionStats) {
  if (!state.sessionId) {
    return null;
  }

  return getRemainingForTarget(stats, state.targetCount) === 0
    ? buildSessionSummary(state.sessionId, stats, state.targetCount as QuickSessionTarget | null)
    : null;
}

function buildMilestoneEvent(reviewedCount: number): MilestoneEvent | null {
  if (!MILESTONE_COUNTS.includes(reviewedCount)) {
    return null;
  }

  const title =
    reviewedCount === 5
      ? 'First burst cleared'
      : reviewedCount === 25
        ? 'Quick streak locked in'
        : reviewedCount === 50
          ? 'Momentum still rising'
          : 'Century sweep';

  const body =
    reviewedCount === 5
      ? 'You are already past the hardest part: starting.'
      : reviewedCount === 25
        ? 'The queue now feels like flow instead of cleanup admin.'
        : reviewedCount === 50
          ? 'You are turning real storage recovery into a repeatable rhythm.'
          : 'That is a full-on cleanup run, not a dabble.';

  return {
    id: createId('milestone'),
    count: reviewedCount,
    title,
    body,
  };
}

function isUndoEntryActive(entry: UndoEntry): boolean {
  return Date.parse(entry.expiresAt) > Date.now();
}

function createUndoEntry(
  action: UndoEntry['action'],
  active: FileItem,
  state: PersistedAppState
): UndoEntry {
  const now = Date.now();

  return {
    id: createId('undo'),
    fileId: active.id,
    fileName: active.name,
    action,
    previousStatus: active.status,
    previousQueueOrder: [...state.queueOrder],
    previousCurrentFileId: state.currentFileId,
    previousSessionStats: { ...state.sessionStats },
    previousSessionSummary: state.sessionSummary,
    previousActiveMilestone: state.activeMilestone,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + UNDO_WINDOW_MS).toISOString(),
  };
}

function pruneExpiredUndoEntries(entries: UndoEntry[]): UndoEntry[] {
  return entries.filter(isUndoEntryActive).slice(0, UNDO_BUFFER_LIMIT);
}

function appendUndoEntry(entries: UndoEntry[], entry: UndoEntry): UndoEntry[] {
  return [entry, ...pruneExpiredUndoEntries(entries)].slice(0, UNDO_BUFFER_LIMIT);
}

function appendRecentMoveTarget(targets: MoveTarget[], target: MoveTarget): MoveTarget[] {
  const targetKey = target.albumId ?? target.albumName;

  return [
    {
      ...target,
      lastUsedAt: nowIso(),
    },
    ...targets.filter((existing) => (existing.albumId ?? existing.albumName) !== targetKey),
  ].slice(0, 5);
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...INITIAL_PERSISTED_STATE,
      hasHydrated: false,
      scanNonce: 0,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPermissionState: (value) => set({ permissionState: value }),
      beginQuickSession: (targetCount = 10, resetProgress = true) =>
        set((state) => {
          const resolvedTarget = resetProgress ? targetCount : ((state.targetCount as QuickSessionTarget | null) ?? targetCount);
          const sessionId = resetProgress || !state.sessionId ? createId('session') : state.sessionId;
          const sessionStats = resetProgress ? createEmptySessionStats() : state.sessionStats;
          const analyticsEvents =
            sessionId && (resetProgress || !state.sessionId)
              ? appendAnalyticsEventIfEnabled(state, state.analyticsEvents, 'session_start', sessionId)
              : state.analyticsEvents;

          return {
            sessionMode: getSessionModeForTarget(resolvedTarget),
            targetCount: resolvedTarget,
            sessionId,
            sessionStats,
            sessionSummary: null,
            activeMilestone: null,
            undoEntries: resetProgress ? [] : pruneExpiredUndoEntries(state.undoEntries),
            analyticsEvents,
            currentFileId: resolveCurrentFileId(state.queueOrder, state.filesById, state.activeFilter, state.sortMode),
            settings: {
              ...state.settings,
              hasCompletedOnboarding: true,
            },
          };
        }),
      setActiveFilter: (value) =>
        set((state) => ({
          activeFilter: value,
          currentFileId: resolveCurrentFileId(state.queueOrder, state.filesById, value, state.sortMode),
        })),
      setSortMode: (value) =>
        set((state) => ({
          sortMode: value,
          currentFileId: resolveCurrentFileId(state.queueOrder, state.filesById, state.activeFilter, value),
        })),
      beginScan: () =>
        set({
          scanState: 'scanning',
          scanError: null,
          scanProgressLoaded: 0,
          scanProgressTotal: null,
        }),
      receiveScanChunk: (items, progress) =>
        set((state) => {
          const nextFiles: Record<string, FileItem> = { ...state.filesById };
          const nextQueueOrder = [...state.queueOrder];
          const seenAssetIds = new Set(Object.values(nextFiles).map((file) => file.nativeAssetId));

          for (const item of items) {
            if (seenAssetIds.has(item.nativeAssetId)) {
              continue;
            }

            nextFiles[item.id] = item;
            nextQueueOrder.push(item.id);
            seenAssetIds.add(item.nativeAssetId);
          }

          return {
            filesById: nextFiles,
            queueOrder: nextQueueOrder,
            currentFileId: state.currentFileId ?? resolveCurrentFileId(nextQueueOrder, nextFiles, state.activeFilter, state.sortMode),
            scanState: 'scanning' as const,
            scanProgressLoaded: progress.loaded,
            scanProgressTotal: progress.total,
          };
        }),
      completeScan: () =>
        set((state) => ({
          scanState: 'ready',
          lastCompletedScanAt: nowIso(),
          currentFileId: state.currentFileId ?? resolveCurrentFileId(state.queueOrder, state.filesById, state.activeFilter, state.sortMode),
        })),
      failScan: (message) =>
        set({
          scanState: 'error',
          scanError: message,
        }),
      keepCurrentFile: () =>
        set((state) => {
          if (!state.currentFileId) {
            return {};
          }

          const active = state.filesById[state.currentFileId];
          if (!active) {
            return {};
          }

          const updatedFile: FileItem = {
            ...active,
            status: 'kept',
            lastActionAt: nowIso(),
          };
          const nextFiles: Record<string, FileItem> = {
            ...state.filesById,
            [active.id]: updatedFile,
          };
          const sessionStats = applySuccessfulAction(state.sessionStats, 'keep');
          const milestone = buildMilestoneEvent(sessionStats.reviewedCount);
          const analyticsEvents = state.sessionId
            ? [
                ...(state.sessionStats.reviewedCount === 0
                  ? [appendAnalyticsEventIfEnabled(state, [], 'first_swipe', state.sessionId)[0]].filter(Boolean)
                  : []),
                ...(milestone ? [appendAnalyticsEventIfEnabled(state, [], 'milestone_hit', state.sessionId)[0]].filter(Boolean) : []),
                ...state.analyticsEvents,
              ].slice(0, 80)
            : state.analyticsEvents;

          return {
            filesById: nextFiles,
            currentFileId: resolveCurrentFileId(state.queueOrder, nextFiles, state.activeFilter, state.sortMode),
            sessionStats,
            sessionSummary: maybeCaptureSummary(state, sessionStats),
            activeMilestone: milestone ?? state.activeMilestone,
            analyticsEvents,
            undoEntries: appendUndoEntry(state.undoEntries, createUndoEntry('keep', active, state)),
            actionLogs: appendActionLogIfEnabled(state, 'keep', active.id, 'success'),
          };
        }),
      skipCurrentFile: () =>
        set((state) => {
          if (!state.currentFileId) {
            return {};
          }

          const active = state.filesById[state.currentFileId];
          if (!active) {
            return {};
          }

          const updatedFile: FileItem = {
            ...active,
            status: 'skipped',
            lastActionAt: nowIso(),
          };
          const nextFiles: Record<string, FileItem> = {
            ...state.filesById,
            [active.id]: updatedFile,
          };
          const nextQueueOrder = [...state.queueOrder.filter((fileId) => fileId !== active.id), active.id];
          const sessionStats = applySuccessfulAction(state.sessionStats, 'skip');
          const milestone = buildMilestoneEvent(sessionStats.reviewedCount);
          const analyticsEvents = state.sessionId
            ? [
                ...(state.sessionStats.reviewedCount === 0
                  ? [appendAnalyticsEventIfEnabled(state, [], 'first_swipe', state.sessionId)[0]].filter(Boolean)
                  : []),
                ...(milestone ? [appendAnalyticsEventIfEnabled(state, [], 'milestone_hit', state.sessionId)[0]].filter(Boolean) : []),
                ...state.analyticsEvents,
              ].slice(0, 80)
            : state.analyticsEvents;

          return {
            filesById: nextFiles,
            queueOrder: nextQueueOrder,
            currentFileId: resolveCurrentFileId(nextQueueOrder, nextFiles, state.activeFilter, state.sortMode),
            sessionStats,
            sessionSummary: maybeCaptureSummary(state, sessionStats),
            activeMilestone: milestone ?? state.activeMilestone,
            analyticsEvents,
            undoEntries: appendUndoEntry(state.undoEntries, createUndoEntry('skip', active, state)),
            actionLogs: appendActionLogIfEnabled(state, 'skip', active.id, 'success'),
          };
        }),
      undoLastAction: () =>
        set((state) => {
          const undoEntry = pruneExpiredUndoEntries(state.undoEntries)[0];
          if (!undoEntry) {
            return {
              undoEntries: [],
            };
          }

          const active = state.filesById[undoEntry.fileId];
          if (!active) {
            return {
              undoEntries: state.undoEntries.filter((entry) => entry.id !== undoEntry.id),
            };
          }

          const restoredFile: FileItem = {
            ...active,
            status: undoEntry.previousStatus,
            lastActionAt: nowIso(),
            lastErrorCode: undefined,
          };
          const nextFiles = {
            ...state.filesById,
            [undoEntry.fileId]: restoredFile,
          };
          const nextQueueOrder = [...undoEntry.previousQueueOrder];

          return {
            filesById: nextFiles,
            queueOrder: nextQueueOrder,
            currentFileId: resolveCurrentFileId(nextQueueOrder, nextFiles, state.activeFilter, state.sortMode),
            sessionStats: undoEntry.previousSessionStats,
            sessionSummary: undoEntry.previousSessionSummary,
            activeMilestone: undoEntry.previousActiveMilestone,
            undoEntries: state.undoEntries.filter((entry) => entry.id !== undoEntry.id && isUndoEntryActive(entry)),
            actionLogs: appendActionLogIfEnabled(state, 'undo', undoEntry.fileId, 'success'),
          };
        }),
      pruneExpiredUndoEntries: () =>
        set((state) => ({
          undoEntries: pruneExpiredUndoEntries(state.undoEntries),
        })),
      dismissMilestone: () =>
        set({
          activeMilestone: null,
        }),
      commitDeleteSuccess: (fileId, bytesDelta) =>
        set((state) => {
          const active = state.filesById[fileId];
          if (!active) {
            return {};
          }

          const updatedFile: FileItem = {
            ...active,
            status: 'deleted',
            lastActionAt: nowIso(),
            lastErrorCode: undefined,
          };
          const nextFiles: Record<string, FileItem> = {
            ...state.filesById,
            [fileId]: updatedFile,
          };
          const sessionStats = applySuccessfulAction(state.sessionStats, 'delete', bytesDelta);
          const milestone = buildMilestoneEvent(sessionStats.reviewedCount);
          const analyticsEvents = state.sessionId
            ? [
                ...(state.sessionStats.reviewedCount === 0
                  ? [appendAnalyticsEventIfEnabled(state, [], 'first_swipe', state.sessionId)[0]].filter(Boolean)
                  : []),
                ...(milestone ? [appendAnalyticsEventIfEnabled(state, [], 'milestone_hit', state.sessionId)[0]].filter(Boolean) : []),
                ...state.analyticsEvents,
              ].slice(0, 80)
            : state.analyticsEvents;

          return {
            filesById: nextFiles,
            currentFileId: resolveCurrentFileId(state.queueOrder, nextFiles, state.activeFilter, state.sortMode),
            sessionStats,
            sessionSummary: maybeCaptureSummary(state, sessionStats),
            activeMilestone: milestone ?? state.activeMilestone,
            analyticsEvents,
            actionLogs: appendActionLogIfEnabled(state, 'delete', fileId, 'success', bytesDelta),
          };
        }),
      commitMoveSuccess: (fileId, target) =>
        set((state) => {
          const active = state.filesById[fileId];
          if (!active) {
            return {};
          }

          const updatedFile: FileItem = {
            ...active,
            status: 'moved',
            albumId: target.albumId ?? active.albumId ?? null,
            albumTitle: target.albumName,
            lastActionAt: nowIso(),
            lastErrorCode: undefined,
          };
          const nextFiles: Record<string, FileItem> = {
            ...state.filesById,
            [fileId]: updatedFile,
          };
          const sessionStats = applySuccessfulAction(state.sessionStats, 'move');
          const milestone = buildMilestoneEvent(sessionStats.reviewedCount);
          const analyticsEvents = state.sessionId
            ? [
                ...(state.sessionStats.reviewedCount === 0
                  ? [appendAnalyticsEventIfEnabled(state, [], 'first_swipe', state.sessionId)[0]].filter(Boolean)
                  : []),
                ...(milestone ? [appendAnalyticsEventIfEnabled(state, [], 'milestone_hit', state.sessionId)[0]].filter(Boolean) : []),
                ...state.analyticsEvents,
              ].slice(0, 80)
            : state.analyticsEvents;

          return {
            filesById: nextFiles,
            currentFileId: resolveCurrentFileId(state.queueOrder, nextFiles, state.activeFilter, state.sortMode),
            sessionStats,
            sessionSummary: maybeCaptureSummary(state, sessionStats),
            activeMilestone: milestone ?? state.activeMilestone,
            analyticsEvents,
            recentMoveTargets: appendRecentMoveTarget(state.recentMoveTargets, target),
            actionLogs: appendActionLogIfEnabled(state, 'move', fileId, 'success'),
          };
        }),
      recordMoveFailure: (fileId, errorCode, message) =>
        set((state) => {
          const active = state.filesById[fileId];
          if (!active) {
            return {};
          }

          const updatedFile: FileItem = {
            ...active,
            lastErrorCode: errorCode,
          };

          return {
            filesById: {
              ...state.filesById,
              [fileId]: updatedFile,
            },
            actionLogs: appendActionLogIfEnabled(state, 'move', fileId, 'failed', 0, errorCode, message),
          };
        }),
      recordDeleteFailure: (fileId, errorCode, message) =>
        set((state) => {
          const active = state.filesById[fileId];
          if (!active) {
            return {};
          }

          const updatedFile: FileItem = {
            ...active,
            lastErrorCode: errorCode,
          };

          return {
            filesById: {
              ...state.filesById,
              [fileId]: updatedFile,
            },
            actionLogs: appendActionLogIfEnabled(state, 'delete', fileId, 'failed', 0, errorCode, message),
          };
        }),
      recordPreviewOpen: (fileId) =>
        set((state) => ({
          actionLogs: appendActionLogIfEnabled(state, 'open', fileId, 'success'),
        })),
      requestRescan: () =>
        set((state) => ({
          filesById: {},
          queueOrder: [],
          currentFileId: null,
          scanState: 'idle',
          scanError: null,
          scanProgressLoaded: 0,
          scanProgressTotal: null,
          sessionSummary: null,
          sessionStats: createEmptySessionStats(),
          sessionId: createId('session'),
          undoEntries: [],
          activeMilestone: null,
          activeFilter: 'all',
          scanNonce: state.scanNonce + 1,
        })),
      toggleSetting: (key) =>
        set((state) => {
          const nextValue = !state.settings[key];

          return {
            settings: {
              ...state.settings,
              [key]: nextValue,
            },
            actionLogs: key === 'debugLoggingEnabled' && !nextValue ? [] : state.actionLogs,
            analyticsEvents: key === 'debugLoggingEnabled' && !nextValue ? [] : state.analyticsEvents,
          };
        }),
      resetOnboarding: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            hasCompletedOnboarding: false,
          },
        })),
      resetApp: async () => {
        await asyncStorage.removeItem(APP_STORAGE_KEY);
        set({
          ...INITIAL_PERSISTED_STATE,
          hasHydrated: true,
          scanNonce: 0,
        });
      },
      dismissSummary: () =>
        set({
          sessionSummary: null,
        }),
    }),
    {
      name: APP_STORAGE_KEY,
      storage: createJSONStorage(() => asyncStorage),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<PersistedAppState> | undefined;

        return {
          ...currentState,
          ...typedPersisted,
          recentMoveTargets: typedPersisted?.recentMoveTargets ?? currentState.recentMoveTargets,
          settings: {
            ...INITIAL_SETTINGS,
            ...(typedPersisted?.settings ?? {}),
          },
        };
      },
      partialize: (state) => ({
        permissionState: state.permissionState,
        sessionMode: state.sessionMode,
        targetCount: state.targetCount,
        activeFilter: state.activeFilter,
        sortMode: state.sortMode,
        currentFileId: state.currentFileId,
        queueOrder: state.queueOrder,
        filesById: state.filesById,
        actionLogs: state.actionLogs,
        analyticsEvents: state.analyticsEvents,
        lastCompletedScanAt: state.lastCompletedScanAt,
        scanState: state.scanState,
        scanProgressLoaded: state.scanProgressLoaded,
        scanProgressTotal: state.scanProgressTotal,
        scanError: state.scanError,
        sessionId: state.sessionId,
        sessionStats: state.sessionStats,
        sessionSummary: state.sessionSummary,
        recentMoveTargets: state.recentMoveTargets,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function selectVisibleQueueIds(state: AppStore): string[] {
  return getVisibleQueueIds(state);
}

export function selectCurrentFile(state: AppStore): FileItem | null {
  return state.currentFileId ? state.filesById[state.currentFileId] ?? null : null;
}

export function selectNextStackItems(state: AppStore): FileItem[] {
  const currentId = state.currentFileId;
  const visibleIds = getVisibleQueueIds(state).filter((fileId) => fileId !== currentId);

  return visibleIds.map((fileId) => state.filesById[fileId]).filter((file): file is FileItem => Boolean(file)).slice(0, 2);
}

export function selectPendingQueueCount(state: AppStore): number {
  return state.queueOrder.reduce((count, fileId) => {
    const file = state.filesById[fileId];
    return file && isActionableStatus(file.status) ? count + 1 : count;
  }, 0);
}

export function selectVisibleQueueCount(state: AppStore): number {
  return getVisibleQueueIds(state).length;
}

export function selectFilterCounts(state: AppStore): Record<string, number> {
  return selectFilterChips(state).reduce<Record<string, number>>((counts, chip) => {
    counts[chip.id] = chip.count;
    return counts;
  }, {});
}

export function selectTopUndoEntry(state: AppStore): UndoEntry | null {
  return pruneExpiredUndoEntries(state.undoEntries)[0] ?? null;
}

export function selectResumeAvailable(state: AppStore): boolean {
  return Boolean(state.sessionId && getVisibleQueueIds(state).length > 0 && !state.sessionSummary);
}

export function getFilterLabel(filter: FilterType): string {
  if (isFolderFilter(filter)) {
    return 'Folder';
  }

  if (filter === 'all') {
    return 'All images';
  }

  if (filter === 'camera') {
    return 'Camera';
  }

  if (filter === 'downloads') {
    return 'Downloads';
  }

  if (filter === 'other') {
    return 'Other';
  }

  return 'Screenshots';
}

export function selectFilterChips(state: AppStore): FilterChip[] {
  if (cachedFilterChipQueueOrder === state.queueOrder && cachedFilterChipFilesById === state.filesById) {
    return cachedFilterChips;
  }

  const baseCounts: Record<'all' | BucketType, number> = {
    all: 0,
    screenshots: 0,
    camera: 0,
    downloads: 0,
    other: 0,
  };
  const folderCounts = new Map<FolderFilterType, { label: string; count: number }>();

  for (const fileId of state.queueOrder) {
    const file = state.filesById[fileId];
    if (!file || !isActionableStatus(file.status)) {
      continue;
    }

    baseCounts.all += 1;

    if (file.bucketType === 'screenshots' || file.bucketType === 'camera' || file.bucketType === 'downloads') {
      baseCounts[file.bucketType] += 1;
      continue;
    }

    const folderFilterId = getFolderFilterId(file);
    if (!folderFilterId || !file.albumTitle) {
      baseCounts.other += 1;
      continue;
    }

    const existing = folderCounts.get(folderFilterId);
    folderCounts.set(folderFilterId, {
      label: file.albumTitle,
      count: (existing?.count ?? 0) + 1,
    });
  }

  const chips: FilterChip[] = BASE_FILTER_ORDER.map((filterId) => {
    const count =
      filterId === 'all'
        ? baseCounts.all
        : filterId === 'screenshots'
          ? baseCounts.screenshots
          : filterId === 'camera'
            ? baseCounts.camera
            : baseCounts.downloads;

    return {
      id: filterId,
      label: getFilterLabel(filterId),
      count,
    };
  });

  const folderChips: FilterChip[] = [...folderCounts.entries()]
    .sort((left, right) => left[1].label.localeCompare(right[1].label))
    .map(([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
    }));

  if (baseCounts.other > 0) {
    folderChips.push({
      id: 'other',
      label: getFilterLabel('other'),
      count: baseCounts.other,
    });
  }

  cachedFilterChipQueueOrder = state.queueOrder;
  cachedFilterChipFilesById = state.filesById;
  cachedFilterChips = [...chips, ...folderChips];

  return cachedFilterChips;
}

export function getActiveFilterLabel(state: Pick<AppStore, 'activeFilter' | 'filesById' | 'queueOrder'>): string {
  if (!isFolderFilter(state.activeFilter)) {
    return getFilterLabel(state.activeFilter);
  }

  for (const fileId of state.queueOrder) {
    const file = state.filesById[fileId];
    if (file && getFolderFilterId(file) === state.activeFilter && file.albumTitle) {
      return file.albumTitle;
    }
  }

  return 'Folder';
}

export function getSortLabel(sortMode: SortMode): string {
  if (sortMode === 'newest_first') {
    return 'Newest';
  }

  if (sortMode === 'largest_first') {
    return 'Largest';
  }

  if (sortMode === 'random') {
    return 'Random';
  }

  return 'Oldest';
}

export function getQuickSessionLabel(targetCount: QuickSessionTarget | null): string {
  if (targetCount === 25) {
    return 'Quick 25';
  }

  if (targetCount === 50) {
    return 'Quick 50';
  }

  return 'Quick 10';
}
