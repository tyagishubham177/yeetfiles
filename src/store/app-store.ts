import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  createEmptySessionStats,
  applySuccessfulAction,
  buildSessionSummary,
  getRemainingForTarget,
} from '../features/rewards/session-stats';
import { nowIso } from '../lib/time';
import { asyncStorage } from '../persistence/async-storage';
import { APP_STORAGE_KEY } from '../persistence/storage-adapter';
import type { ActionLog, AnalyticsEvent, ReviewAction } from '../types/action-log';
import type { PersistedAppState, SessionStats, SettingsState } from '../types/app-state';
import type { FileItem, FileStatus, PermissionState } from '../types/file-item';

type ScanProgress = {
  loaded: number;
  total: number | null;
};

type AppStore = PersistedAppState & {
  hasHydrated: boolean;
  scanNonce: number;
  setHasHydrated: (value: boolean) => void;
  setPermissionState: (value: PermissionState) => void;
  beginQuickSession: (resetProgress?: boolean) => void;
  beginScan: () => void;
  receiveScanChunk: (items: FileItem[], progress: ScanProgress) => void;
  completeScan: () => void;
  failScan: (message: string) => void;
  keepCurrentFile: () => void;
  skipCurrentFile: () => void;
  commitDeleteSuccess: (fileId: string, bytesDelta: number) => void;
  recordDeleteFailure: (fileId: string, errorCode: string, message: string) => void;
  recordPreviewOpen: (fileId: string) => void;
  requestRescan: () => void;
  toggleSetting: (key: keyof SettingsState) => void;
  resetApp: () => Promise<void>;
  dismissSummary: () => void;
};

const INITIAL_SETTINGS: SettingsState = {
  hapticsEnabled: true,
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
  settings: INITIAL_SETTINGS,
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isActionableStatus(status: FileStatus): boolean {
  return status === 'pending' || status === 'skipped';
}

function resolveCurrentFileId(queueOrder: string[], filesById: Record<string, FileItem>): string | null {
  for (const fileId of queueOrder) {
    const file = filesById[fileId];

    if (file && isActionableStatus(file.status)) {
      return fileId;
    }
  }

  return null;
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
  ].slice(0, 50);
}

function maybeCaptureSummary(state: PersistedAppState, stats: SessionStats) {
  if (!state.sessionId) {
    return null;
  }

  return getRemainingForTarget(stats, state.targetCount) === 0 ? buildSessionSummary(state.sessionId, stats) : null;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...INITIAL_PERSISTED_STATE,
      hasHydrated: false,
      scanNonce: 0,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPermissionState: (value) => set({ permissionState: value }),
      beginQuickSession: (resetProgress = true) =>
        set((state) => {
          const sessionId = resetProgress || !state.sessionId ? createId('session') : state.sessionId;
          const sessionStats = resetProgress ? createEmptySessionStats() : state.sessionStats;
          const analyticsEvents =
            sessionId && (resetProgress || !state.sessionId)
              ? appendAnalyticsEvent(state.analyticsEvents, 'session_start', sessionId)
              : state.analyticsEvents;

          return {
            sessionMode: 'quick10',
            targetCount: 10,
            sessionId,
            sessionStats,
            sessionSummary: null,
            analyticsEvents,
            currentFileId: resolveCurrentFileId(state.queueOrder, state.filesById),
            settings: {
              ...state.settings,
              hasCompletedOnboarding: true,
            },
          };
        }),
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
            currentFileId: state.currentFileId ?? resolveCurrentFileId(nextQueueOrder, nextFiles),
            scanState: 'scanning' as const,
            scanProgressLoaded: progress.loaded,
            scanProgressTotal: progress.total,
          };
        }),
      completeScan: () =>
        set((state) => ({
          scanState: 'ready',
          lastCompletedScanAt: nowIso(),
          currentFileId: state.currentFileId ?? resolveCurrentFileId(state.queueOrder, state.filesById),
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
          const analyticsEvents =
            state.sessionId && state.sessionStats.reviewedCount === 0
              ? appendAnalyticsEvent(state.analyticsEvents, 'first_swipe', state.sessionId)
              : state.analyticsEvents;

          return {
            filesById: nextFiles,
            currentFileId: resolveCurrentFileId(state.queueOrder, nextFiles),
            sessionStats,
            sessionSummary: maybeCaptureSummary(state, sessionStats),
            analyticsEvents,
            actionLogs: appendActionLog(state.actionLogs, 'keep', active.id, state.sessionId, 'success'),
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
          const analyticsEvents =
            state.sessionId && state.sessionStats.reviewedCount === 0
              ? appendAnalyticsEvent(state.analyticsEvents, 'first_swipe', state.sessionId)
              : state.analyticsEvents;

          return {
            filesById: nextFiles,
            queueOrder: nextQueueOrder,
            currentFileId: resolveCurrentFileId(nextQueueOrder, nextFiles),
            sessionStats,
            sessionSummary: maybeCaptureSummary(state, sessionStats),
            analyticsEvents,
            actionLogs: appendActionLog(state.actionLogs, 'skip', active.id, state.sessionId, 'success'),
          };
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
          const analyticsEvents =
            state.sessionId && state.sessionStats.reviewedCount === 0
              ? appendAnalyticsEvent(state.analyticsEvents, 'first_swipe', state.sessionId)
              : state.analyticsEvents;

          return {
            filesById: nextFiles,
            currentFileId: resolveCurrentFileId(state.queueOrder, nextFiles),
            sessionStats,
            sessionSummary: maybeCaptureSummary(state, sessionStats),
            analyticsEvents,
            actionLogs: appendActionLog(state.actionLogs, 'delete', fileId, state.sessionId, 'success', bytesDelta),
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
            actionLogs: appendActionLog(state.actionLogs, 'delete', fileId, state.sessionId, 'failed', 0, errorCode, message),
          };
        }),
      recordPreviewOpen: (fileId) =>
        set((state) => ({
          actionLogs: appendActionLog(state.actionLogs, 'open', fileId, state.sessionId, 'success'),
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
          scanNonce: state.scanNonce + 1,
        })),
      toggleSetting: (key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: !state.settings[key],
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
      partialize: (state) => ({
        permissionState: state.permissionState,
        sessionMode: state.sessionMode,
        targetCount: state.targetCount,
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
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function selectCurrentFile(state: AppStore): FileItem | null {
  return state.currentFileId ? state.filesById[state.currentFileId] ?? null : null;
}

export function selectNextStackItems(state: AppStore): FileItem[] {
  const currentId = state.currentFileId;
  const nextIds = state.queueOrder.filter((fileId) => fileId !== currentId);

  return nextIds
    .map((fileId) => state.filesById[fileId])
    .filter((file): file is FileItem => Boolean(file) && isActionableStatus(file.status))
    .slice(0, 2);
}

export function selectPendingQueueCount(state: AppStore): number {
  return state.queueOrder.reduce((count, fileId) => {
    const file = state.filesById[fileId];
    return file && isActionableStatus(file.status) ? count + 1 : count;
  }, 0);
}

export function selectResumeAvailable(state: AppStore): boolean {
  return Boolean(state.sessionId && state.currentFileId && !state.sessionSummary);
}
