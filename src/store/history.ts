import { isWithinRecentDays, nowIso, toLocalDateKey } from '../lib/time';
import type { ReviewAction } from '../types/action-log';
import type { DailyHistoryEntry, SessionSummary } from '../types/app-state';

export const HISTORY_RETENTION_DAYS = 90;
const RECENT_SESSION_LIMIT = 12;

function createEmptyDayEntry(dateKey: string): DailyHistoryEntry {
  return {
    dateKey,
    reviewedCount: 0,
    keptCount: 0,
    deletedCount: 0,
    skippedCount: 0,
    movedCount: 0,
    storageRecoveredBytes: 0,
    sessionsCompleted: 0,
    firstActionAt: null,
    lastActionAt: null,
  };
}

export function pruneHistoryByDay(historyByDay: Record<string, DailyHistoryEntry>): Record<string, DailyHistoryEntry> {
  return Object.fromEntries(
    Object.entries(historyByDay).filter(([, entry]) => isWithinRecentDays(entry.lastActionAt ?? entry.dateKey, HISTORY_RETENTION_DAYS))
  );
}

export function recordHistoryAction(
  historyByDay: Record<string, DailyHistoryEntry>,
  action: ReviewAction,
  timestamp: string = nowIso(),
  bytesDelta: number = 0
): Record<string, DailyHistoryEntry> {
  if (!(action === 'keep' || action === 'delete' || action === 'skip' || action === 'move')) {
    return historyByDay;
  }

  const dateKey = toLocalDateKey(timestamp);
  const currentEntry = historyByDay[dateKey] ?? createEmptyDayEntry(dateKey);
  const nextEntry: DailyHistoryEntry = {
    ...currentEntry,
    reviewedCount: currentEntry.reviewedCount + 1,
    keptCount: currentEntry.keptCount + (action === 'keep' ? 1 : 0),
    deletedCount: currentEntry.deletedCount + (action === 'delete' ? 1 : 0),
    skippedCount: currentEntry.skippedCount + (action === 'skip' ? 1 : 0),
    movedCount: currentEntry.movedCount + (action === 'move' ? 1 : 0),
    storageRecoveredBytes: currentEntry.storageRecoveredBytes + (action === 'delete' ? Math.max(bytesDelta, 0) : 0),
    firstActionAt: currentEntry.firstActionAt ?? timestamp,
    lastActionAt: timestamp,
  };

  return pruneHistoryByDay({
    ...historyByDay,
    [dateKey]: nextEntry,
  });
}

export function recordCompletedSession(
  historyByDay: Record<string, DailyHistoryEntry>,
  summary: SessionSummary
): Record<string, DailyHistoryEntry> {
  const dateKey = toLocalDateKey(summary.completedAt);
  const currentEntry = historyByDay[dateKey] ?? createEmptyDayEntry(dateKey);

  return pruneHistoryByDay({
    ...historyByDay,
    [dateKey]: {
      ...currentEntry,
      sessionsCompleted: currentEntry.sessionsCompleted + 1,
      firstActionAt: currentEntry.firstActionAt ?? summary.completedAt,
      lastActionAt: summary.completedAt,
    },
  });
}

export function appendRecentSessionSummary(summaries: SessionSummary[], summary: SessionSummary): SessionSummary[] {
  return [summary, ...summaries.filter((entry) => entry.sessionId !== summary.sessionId)]
    .filter((entry) => isWithinRecentDays(entry.completedAt, HISTORY_RETENTION_DAYS))
    .slice(0, RECENT_SESSION_LIMIT);
}
