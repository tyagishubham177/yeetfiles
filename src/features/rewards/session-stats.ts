import { durationFrom, nowIso } from '../../lib/time';
import type { ReviewAction } from '../../types/action-log';
import type { SessionStats, SessionSummary } from '../../types/app-state';

export function createEmptySessionStats(): SessionStats {
  return {
    reviewedCount: 0,
    keptCount: 0,
    deletedCount: 0,
    skippedCount: 0,
    storageFreedBytes: 0,
    startedAt: nowIso(),
    lastUpdatedAt: nowIso(),
  };
}

export function applySuccessfulAction(
  stats: SessionStats,
  action: ReviewAction,
  bytesDelta: number = 0
): SessionStats {
  const next = {
    ...stats,
    reviewedCount: stats.reviewedCount + 1,
    lastUpdatedAt: nowIso(),
  };

  if (action === 'keep') {
    next.keptCount += 1;
  }

  if (action === 'skip') {
    next.skippedCount += 1;
  }

  if (action === 'delete') {
    next.deletedCount += 1;
    next.storageFreedBytes += Math.max(bytesDelta, 0);
  }

  return next;
}

export function getRemainingForTarget(stats: SessionStats, targetCount: number | null): number {
  if (!targetCount) {
    return 0;
  }

  return Math.max(targetCount - stats.reviewedCount, 0);
}

export function buildSessionSummary(sessionId: string, stats: SessionStats): SessionSummary {
  const endedAt = nowIso();

  return {
    sessionId,
    reviewedCount: stats.reviewedCount,
    keptCount: stats.keptCount,
    deletedCount: stats.deletedCount,
    skippedCount: stats.skippedCount,
    storageFreedBytes: stats.storageFreedBytes,
    durationMs: durationFrom(stats.startedAt, endedAt),
  };
}
