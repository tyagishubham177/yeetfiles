import assert from 'node:assert/strict';
import test from 'node:test';

import { toLocalDateKey } from '../lib/time';
import { appendRecentSessionSummary, recordCompletedSession, recordHistoryAction } from './history';

test('recordHistoryAction tracks delete counts and recovered bytes', () => {
  const timestamp = new Date().toISOString();
  const nextHistory = recordHistoryAction({}, 'delete', timestamp, 2048);
  const dateKey = toLocalDateKey(timestamp);

  assert.equal(nextHistory[dateKey]?.reviewedCount, 1);
  assert.equal(nextHistory[dateKey]?.deletedCount, 1);
  assert.equal(nextHistory[dateKey]?.storageRecoveredBytes, 2048);
});

test('recordCompletedSession increments the matching day session total', () => {
  const completedAt = new Date().toISOString();
  const dateKey = toLocalDateKey(completedAt);
  const nextHistory = recordCompletedSession({}, {
    sessionId: 'session-1',
    completedAt,
    reviewedCount: 6,
    keptCount: 2,
    deletedCount: 3,
    skippedCount: 1,
    movedCount: 0,
    storageFreedBytes: 4096,
    durationMs: 120000,
    targetCount: 10,
  });

  assert.equal(nextHistory[dateKey]?.sessionsCompleted, 1);
  assert.equal(nextHistory[dateKey]?.lastActionAt, completedAt);
});

test('appendRecentSessionSummary deduplicates by session id and drops stale sessions', () => {
  const now = new Date();
  const recentCompletedAt = now.toISOString();
  const staleCompletedAt = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();

  const nextSummaries = appendRecentSessionSummary(
    [
      {
        sessionId: 'session-1',
        completedAt: staleCompletedAt,
        reviewedCount: 2,
        keptCount: 1,
        deletedCount: 1,
        skippedCount: 0,
        movedCount: 0,
        storageFreedBytes: 512,
        durationMs: 15000,
        targetCount: 10,
      },
      {
        sessionId: 'session-2',
        completedAt: recentCompletedAt,
        reviewedCount: 5,
        keptCount: 2,
        deletedCount: 2,
        skippedCount: 1,
        movedCount: 0,
        storageFreedBytes: 2048,
        durationMs: 45000,
        targetCount: 10,
      },
    ],
    {
      sessionId: 'session-2',
      completedAt: recentCompletedAt,
      reviewedCount: 7,
      keptCount: 3,
      deletedCount: 3,
      skippedCount: 1,
      movedCount: 0,
      storageFreedBytes: 3072,
      durationMs: 60000,
      targetCount: 10,
    },
  );

  assert.equal(nextSummaries.length, 1);
  assert.equal(nextSummaries[0]?.reviewedCount, 7);
  assert.equal(nextSummaries[0]?.sessionId, 'session-2');
});