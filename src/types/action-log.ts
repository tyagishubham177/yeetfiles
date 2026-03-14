export type ReviewAction = 'keep' | 'delete' | 'skip' | 'move' | 'open' | 'rescan' | 'undo';
export type ActionResult = 'success' | 'failed' | 'cancelled';

export type ActionLog = {
  id: string;
  fileId: string;
  action: ReviewAction;
  result: ActionResult;
  timestamp: string;
  sessionId: string | null;
  bytesDelta: number;
  errorCode?: string;
  errorMessage?: string;
};

export type AnalyticsEventName = 'session_start' | 'first_swipe' | 'milestone_hit';

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  sessionId: string;
  timestamp: string;
};
