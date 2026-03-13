import type { ActionLog, AnalyticsEvent } from './action-log';
import type { FileItem, FileStatus, FilterType, PermissionState, QuickSessionTarget, SessionMode, SortMode } from './file-item';

export type SessionStats = {
  reviewedCount: number;
  keptCount: number;
  deletedCount: number;
  skippedCount: number;
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
  storageFreedBytes: number;
  durationMs: number;
  targetCount: QuickSessionTarget | null;
};

export type UndoableAction = 'keep' | 'skip';

export type UndoEntry = {
  id: string;
  fileId: string;
  fileName: string;
  action: UndoableAction;
  previousStatus: FileStatus;
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
  animationsEnabled: boolean;
  followSystemTheme: boolean;
  showGestureHints: boolean;
  hasCompletedOnboarding: boolean;
  debugLoggingEnabled: boolean;
};

export type ScanState = 'idle' | 'scanning' | 'ready' | 'error';

export type PersistedAppState = {
  permissionState: PermissionState;
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
  scanProgressLoaded: number;
  scanProgressTotal: number | null;
  scanError: string | null;
  sessionId: string | null;
  sessionStats: SessionStats;
  sessionSummary: SessionSummary | null;
  undoEntries: UndoEntry[];
  activeMilestone: MilestoneEvent | null;
  settings: SettingsState;
};
