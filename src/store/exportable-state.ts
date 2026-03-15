import type { PersistedAppState } from '../types/app-state';

type PersistedStateSource = PersistedAppState & Record<string, unknown>;

export function getPersistedAppStateSnapshot(state: PersistedStateSource): PersistedAppState {
  return {
    permissionState: state.permissionState,
    notificationPermissionState: state.notificationPermissionState,
    sessionMode: state.sessionMode,
    targetCount: state.targetCount,
    activeFilter: state.activeFilter,
    sortMode: state.sortMode,
    currentFileId: state.currentFileId,
    queueOrder: state.queueOrder,
    randomQueueOrder: state.randomQueueOrder,
    filesById: state.filesById,
    actionLogs: state.actionLogs,
    analyticsEvents: state.analyticsEvents,
    historyByDay: state.historyByDay,
    recentSessionSummaries: state.recentSessionSummaries,
    lastCompletedScanAt: state.lastCompletedScanAt,
    activeScanStartedAt: state.activeScanStartedAt,
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
    lastCleanRebuildAt: state.lastCleanRebuildAt,
    sessionId: state.sessionId,
    sessionStats: state.sessionStats,
    sessionSummary: state.sessionSummary,
    undoEntries: state.undoEntries,
    activeMilestone: state.activeMilestone,
    recentMoveTargets: state.recentMoveTargets,
    settings: state.settings,
  };
}
