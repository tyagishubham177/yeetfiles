import type { ActionLog, AnalyticsEvent } from './action-log';
import type { FileItem, PermissionState, SessionMode } from './file-item';

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
  settings: SettingsState;
};
