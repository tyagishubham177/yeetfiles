import type { ActionLog, AnalyticsEvent } from './action-log';
import type { FileItem, FileStatus, FilterType, PermissionState, QuickSessionTarget, SessionMode, SortMode } from './file-item';

export type NotificationPermissionState = 'unknown' | 'granted' | 'denied' | 'blocked';
export type NightModePreference = 'off' | 'on' | 'auto';

export type SessionStats = {
  reviewedCount: number;
  keptCount: number;
  deletedCount: number;
  skippedCount: number;
  movedCount: number;
  storageFreedBytes: number;
  startedAt: string | null;
  lastUpdatedAt: string | null;
};

export type SessionSummary = {
  sessionId: string;
  reviewedCount: number;
  keptCount: number;
  deletedCount: number;
  skippedCount: number;
  movedCount: number;
  storageFreedBytes: number;
  durationMs: number;
  targetCount: QuickSessionTarget | null;
};

export type RescanSummary = {
  completedAt: string;
  newFileCount: number;
  matchedFileCount: number;
  protectedReviewedCount: number;
};

export type MoveTarget = {
  albumId?: string | null;
  albumName: string;
  label: string;
  assetCount?: number;
  isNew?: boolean;
  lastUsedAt?: string;
};

export type UndoableAction = 'keep' | 'skip';

export type UndoEntry = {
  id: string;
  fileId: string;
  fileName: string;
  action: UndoableAction;
  previousStatus: FileStatus;
  previousIsNewSinceLastScan: boolean;
  previousQueueOrder: string[];
  previousCurrentFileId: string | null;
  previousSessionStats: SessionStats;
  previousSessionSummary: SessionSummary | null;
  previousActiveMilestone: MilestoneEvent | null;
  createdAt: string;
  expiresAt: string;
};

export type MilestoneEvent = {
  id: string;
  count: number;
  title: string;
  body: string;
};

export type SettingsState = {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  followSystemTheme: boolean;
  nightModePreference: NightModePreference;
  showGestureHints: boolean;
  hasCompletedOnboarding: boolean;
  hasSeenGestureTutorial: boolean;
  weeklySummaryNotificationsEnabled: boolean;
  storageAlertsEnabled: boolean;
  debugLoggingEnabled: boolean;
};

export type ScanState = 'idle' | 'scanning' | 'ready' | 'error';
export type ScanMode = 'initial' | 'rescan';

export type LowStorageWarning = {
  freeBytes: number;
  totalBytes: number;
  thresholdBytes: number;
  detectedAt: string;
};

export type PersistedAppState = {
  permissionState: PermissionState;
  notificationPermissionState: NotificationPermissionState;
  sessionMode: SessionMode;
  targetCount: number | null;
  activeFilter: FilterType;
  sortMode: SortMode;
  currentFileId: string | null;
  queueOrder: string[];
  filesById: Record<string, FileItem>;
  actionLogs: ActionLog[];
  analyticsEvents: AnalyticsEvent[];
  lastCompletedScanAt: string | null;
  scanState: ScanState;
  scanMode: ScanMode;
  scanProgressLoaded: number;
  scanProgressTotal: number | null;
  currentScanNewFileCount: number;
  currentScanMatchedFileCount: number;
  currentScanProtectedReviewedCount: number;
  scanError: string | null;
  lastRescanSummary: RescanSummary | null;
  lowStorageWarning: LowStorageWarning | null;
  lastStorageCheckAt: string | null;
  lastLowStorageNotificationAt: string | null;
  sessionId: string | null;
  sessionStats: SessionStats;
  sessionSummary: SessionSummary | null;
  undoEntries: UndoEntry[];
  activeMilestone: MilestoneEvent | null;
  recentMoveTargets: MoveTarget[];
  settings: SettingsState;
};
