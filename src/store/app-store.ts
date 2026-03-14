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
import type {
  LowStorageWarning,
  MilestoneEvent,
  MoveTarget,
  NightModePreference,
  NotificationPermissionState,
  PersistedAppState,
  RescanSummary,
  SessionStats,
  SettingsState,
  UndoEntry,
} from '../types/app-state';
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

type BooleanSettingKey = {
  [Key in keyof SettingsState]: SettingsState[Key] extends boolean ? Key : never;
}[keyof SettingsState];

type AppStore = PersistedAppState & {
  hasHydrated: boolean;
  scanNonce: number;
  setHasHydrated: (value: boolean) => void;
  setPermissionState: (value: PermissionState) => void;
  setNotificationPermissionState: (value: NotificationPermissionState) => void;
  beginQuickSession: (targetCount?: QuickSessionTarget, resetProgress?: boolean) => void;
  setActiveFilter: (value: FilterType) => void;
  setSortMode: (value: SortMode) => void;
  setNightModePreference: (value: NightModePreference) => void;
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
  requestRescan: (options?: { resetSession?: boolean }) => void;
  toggleSetting: (key: BooleanSettingKey) => void;
  markGestureTutorialSeen: () => void;
  setStorageWarning: (warning: LowStorageWarning | null) => void;
  recordLowStorageNotificationSent: () => void;
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
  nightModePreference: 'off',
  showGestureHints: true,
  hasCompletedOnboarding: false,
  hasSeenGestureTutorial: false,
  weeklySummaryNotificationsEnabled: false,
  storageAlertsEnabled: false,
  debugLoggingEnabled: true,
};

const INITIAL_PERSISTED_STATE: PersistedAppState = {
  permissionState: 'unknown',
  notificationPermissionState: 'unknown',
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
  scanMode: 'initial',
  scanProgressLoaded: 0,
  scanProgressTotal: null,
  currentScanNewFileCount: 0,
  currentScanMatchedFileCount: 0,
  currentScanProtectedReviewedCount: 0,
  scanError: null,
  lastRescanSummary: null,
  lowStorageWarning: null,
  lastStorageCheckAt: null,
  lastLowStorageNotificationAt: null,
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
let cachedVisibleQueueOrder: string[] | null = null;
let cachedVisibleFilesById: Record<string, FileItem> | null = null;
let cachedVisibleFilter: FilterType | null = null;
let cachedVisibleSortMode: SortMode | null = null;
let cachedVisibleQueueIds: string[] = [];
let cachedPendingQueueOrder: string[] | null = null;
let cachedPendingFilesById: Record<string, FileItem> | null = null;
let cachedPendingQueueCount = 0;
let cachedNewQueueOrder: string[] | null = null;
let cachedNewFilesById: Record<string, FileItem> | null = null;
let cachedNewSinceLastScanCount = 0;

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

function mergeScannedFile(existing: FileItem, incoming: FileItem, seenAt: string): FileItem {
  return {
    ...existing,
    nativeAssetId: incoming.nativeAssetId,
    albumId: incoming.albumId ?? existing.albumId ?? null,
    albumTitle: incoming.albumTitle ?? existing.albumTitle ?? null,
    uri: incoming.uri,
    previewUri: incoming.previewUri,
    name: incoming.name,
    mimeType: incoming.mimeType,
    sizeBytes: incoming.sizeBytes,
    width: incoming.width,
    height: incoming.height,
    createdAt: incoming.createdAt,
    modifiedAt: incoming.modifiedAt,
    bucketType: incoming.bucketType,
    sortKey: incoming.sortKey,
    scanFingerprint: incoming.scanFingerprint,
    firstSeenAt: existing.firstSeenAt ?? seenAt,
    lastSeenAt: seenAt,
    isNewSinceLastScan: false,
  };
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

function getSmartSortScore(file: FileItem): number {
  let score = 0;

  if (file.bucketType === 'screenshots') {
    score += 40;
  } else if (file.bucketType === 'downloads') {
    score += 28;
  } else if (file.bucketType === 'other') {
    score += 12;
  }

  if (file.sizeBytes >= 15 * 1024 * 1024) {
    score += 28;
  } else if (file.sizeBytes >= 8 * 1024 * 1024) {
    score += 18;
  } else if (file.sizeBytes >= 4 * 1024 * 1024) {
    score += 10;
  }

  if (file.isNewSinceLastScan) {
    score -= 8;
  }

  const dateValue = parseDateValue(file.createdAt);
  if (dateValue > 0) {
    const ageInDays = Math.max(Math.floor((Date.now() - dateValue) / (1000 * 60 * 60 * 24)), 0);
    score += Math.min(ageInDays, 365) / 18;
  }

  return score;
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

  if (sortMode === 'smart') {
    const smartDelta = getSmartSortScore(right) - getSmartSortScore(left);
    if (smartDelta !== 0) {
      return smartDelta;
    }

    const sizeDelta = right.sizeBytes - left.sizeBytes;
    if (sizeDelta !== 0) {
      return sizeDelta;
    }

    const dateDelta = parseDateValue(right.createdAt) - parseDateValue(left.createdAt);
    if (dateDelta !== 0) {
      return dateDelta;
    }
  }

  return (queueIndex.get(left.id) ?? 0) - (queueIndex.get(right.id) ?? 0);
}

function getVisibleQueueIds(state: Pick<PersistedAppState, 'queueOrder' | 'filesById' | 'activeFilter' | 'sortMode'>): string[] {
  if (
    cachedVisibleQueueOrder === state.queueOrder &&
    cachedVisibleFilesById === state.filesById &&
    cachedVisibleFilter === state.activeFilter &&
    cachedVisibleSortMode === state.sortMode
  ) {
    return cachedVisibleQueueIds;
  }

  const queueIndex = new Map(state.queueOrder.map((fileId, index) => [fileId, index]));

  const visibleQueueIds = state.queueOrder
    .map((fileId) => state.filesById[fileId])
    .filter((file): file is FileItem => Boolean(file) && isActionableStatus(file.status) && matchesFilter(file, state.activeFilter))
    .sort((left, right) => compareFiles(left, right, state.sortMode, queueIndex))
    .map((file) => file.id);

  cachedVisibleQueueOrder = state.queueOrder;
  cachedVisibleFilesById = state.filesById;
  cachedVisibleFilter = state.activeFilter;
  cachedVisibleSortMode = state.sortMode;
  cachedVisibleQueueIds = visibleQueueIds;

  return visibleQueueIds;
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
    previousIsNewSinceLastScan: active.isNewSinceLastScan,
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

function buildRescanSummary(state: PersistedAppState, completedAt: string): RescanSummary | null {
  if (state.scanMode !== 'rescan') {
    return null;
  }

  return {
    completedAt,
    newFileCount: state.currentScanNewFileCount,
    matchedFileCount: state.currentScanMatchedFileCount,
    protectedReviewedCount: state.currentScanProtectedReviewedCount,
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...INITIAL_PERSISTED_STATE,
      hasHydrated: false,
      scanNonce: 0,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPermissionState: (value) => set({ permissionState: value }),
      setNotificationPermissionState: (value) => set({ notificationPermissionState: value }),
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
      setNightModePreference: (value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            nightModePreference: value,
          },
        })),
      beginScan: () =>
        set((state) => {
          const nextFiles =
            state.scanMode === 'rescan'
              ? Object.fromEntries(
                  Object.entries(state.filesById).map(([fileId, file]) => [
                    fileId,
                    {
                      ...file,
                      isNewSinceLastScan: false,
                    },
                  ])
                )
              : state.filesById;

          return {
            filesById: nextFiles,
            scanState: 'scanning' as const,
            scanError: null,
            scanProgressLoaded: 0,
            scanProgressTotal: null,
            currentScanNewFileCount: 0,
            currentScanMatchedFileCount: 0,
            currentScanProtectedReviewedCount: 0,
          };
        }),
      receiveScanChunk: (items, progress) =>
        set((state) => {
          const nextFiles: Record<string, FileItem> = { ...state.filesById };
          const nextQueueOrder = [...state.queueOrder];
          const existingByAssetId = new Map<string, string>();
          const existingByFingerprint = new Map<string, string>();
          let newFileCount = 0;
          let matchedFileCount = 0;
          let protectedReviewedCount = 0;
          const seenAt = nowIso();

          for (const [fileId, file] of Object.entries(nextFiles)) {
            existingByAssetId.set(file.nativeAssetId, fileId);
            existingByFingerprint.set(file.scanFingerprint, fileId);
          }

          for (const item of items) {
            const existingFileId = existingByAssetId.get(item.nativeAssetId) ?? existingByFingerprint.get(item.scanFingerprint);

            if (existingFileId) {
              const existing = nextFiles[existingFileId];

              if (!existing) {
                continue;
              }

              if (!isActionableStatus(existing.status)) {
                protectedReviewedCount += 1;
              }

              nextFiles[existingFileId] = mergeScannedFile(existing, item, seenAt);
              existingByAssetId.set(item.nativeAssetId, existingFileId);
              existingByFingerprint.set(item.scanFingerprint, existingFileId);
              matchedFileCount += 1;
              continue;
            }

            const nextItem: FileItem = {
              ...item,
              firstSeenAt: seenAt,
              lastSeenAt: seenAt,
              isNewSinceLastScan: state.scanMode === 'rescan' && Boolean(state.lastCompletedScanAt),
            };

            nextFiles[nextItem.id] = nextItem;
            nextQueueOrder.push(nextItem.id);
            existingByAssetId.set(nextItem.nativeAssetId, nextItem.id);
            existingByFingerprint.set(nextItem.scanFingerprint, nextItem.id);
            newFileCount += 1;
          }

          return {
            filesById: nextFiles,
            queueOrder: nextQueueOrder,
            currentFileId: state.currentFileId ?? resolveCurrentFileId(nextQueueOrder, nextFiles, state.activeFilter, state.sortMode),
            scanState: 'scanning' as const,
            scanProgressLoaded: progress.loaded,
            scanProgressTotal: progress.total,
            currentScanNewFileCount: state.currentScanNewFileCount + newFileCount,
            currentScanMatchedFileCount: state.currentScanMatchedFileCount + matchedFileCount,
            currentScanProtectedReviewedCount: state.currentScanProtectedReviewedCount + protectedReviewedCount,
          };
        }),
      completeScan: () =>
        set((state) => {
          const completedAt = nowIso();

          return {
            scanState: 'ready' as const,
            lastCompletedScanAt: completedAt,
            lastRescanSummary: buildRescanSummary(state, completedAt) ?? state.lastRescanSummary,
            currentFileId: state.currentFileId ?? resolveCurrentFileId(state.queueOrder, state.filesById, state.activeFilter, state.sortMode),
          };
        }),
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
            isNewSinceLastScan: false,
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
            isNewSinceLastScan: false,
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
            isNewSinceLastScan: undoEntry.previousIsNewSinceLastScan,
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
            isNewSinceLastScan: false,
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
            isNewSinceLastScan: false,
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
      requestRescan: ({ resetSession = false } = {}) =>
        set((state) => ({
          currentFileId: state.currentFileId ?? resolveCurrentFileId(state.queueOrder, state.filesById, state.activeFilter, state.sortMode),
          scanState: 'idle',
          scanMode: 'rescan' as const,
          scanError: null,
          scanProgressLoaded: 0,
          scanProgressTotal: null,
          currentScanNewFileCount: 0,
          currentScanMatchedFileCount: 0,
          currentScanProtectedReviewedCount: 0,
          sessionSummary: resetSession ? null : state.sessionSummary,
          sessionStats: resetSession ? createEmptySessionStats() : state.sessionStats,
          sessionId: resetSession ? createId('session') : state.sessionId,
          undoEntries: resetSession ? [] : pruneExpiredUndoEntries(state.undoEntries),
          activeMilestone: resetSession ? null : state.activeMilestone,
          activeFilter: resetSession ? 'all' : state.activeFilter,
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
      markGestureTutorialSeen: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            hasSeenGestureTutorial: true,
          },
        })),
      setStorageWarning: (warning) =>
        set({
          lowStorageWarning: warning,
          lastStorageCheckAt: nowIso(),
        }),
      recordLowStorageNotificationSent: () =>
        set({
          lastLowStorageNotificationAt: nowIso(),
        }),
      resetOnboarding: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            hasCompletedOnboarding: false,
            hasSeenGestureTutorial: false,
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
        notificationPermissionState: state.notificationPermissionState,
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
        scanMode: state.scanMode,
        scanProgressLoaded: state.scanProgressLoaded,
        scanProgressTotal: state.scanProgressTotal,
        currentScanNewFileCount: state.currentScanNewFileCount,
        currentScanMatchedFileCount: state.currentScanMatchedFileCount,
        currentScanProtectedReviewedCount: state.currentScanProtectedReviewedCount,
        scanError: state.scanError,
        lastRescanSummary: state.lastRescanSummary,
        lowStorageWarning: state.lowStorageWarning,
        lastStorageCheckAt: state.lastStorageCheckAt,
        lastLowStorageNotificationAt: state.lastLowStorageNotificationAt,
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
  if (cachedPendingQueueOrder === state.queueOrder && cachedPendingFilesById === state.filesById) {
    return cachedPendingQueueCount;
  }

  const pendingQueueCount = state.queueOrder.reduce((count, fileId) => {
    const file = state.filesById[fileId];
    return file && isActionableStatus(file.status) ? count + 1 : count;
  }, 0);

  cachedPendingQueueOrder = state.queueOrder;
  cachedPendingFilesById = state.filesById;
  cachedPendingQueueCount = pendingQueueCount;

  return pendingQueueCount;
}

export function selectVisibleQueueCount(state: AppStore): number {
  return getVisibleQueueIds(state).length;
}

export function selectNewSinceLastScanCount(state: AppStore): number {
  if (cachedNewQueueOrder === state.queueOrder && cachedNewFilesById === state.filesById) {
    return cachedNewSinceLastScanCount;
  }

  const newSinceLastScanCount = state.queueOrder.reduce((count, fileId) => {
    const file = state.filesById[fileId];
    return file && isActionableStatus(file.status) && file.isNewSinceLastScan ? count + 1 : count;
  }, 0);

  cachedNewQueueOrder = state.queueOrder;
  cachedNewFilesById = state.filesById;
  cachedNewSinceLastScanCount = newSinceLastScanCount;

  return newSinceLastScanCount;
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
  if (sortMode === 'smart') {
    return 'Smart';
  }

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
