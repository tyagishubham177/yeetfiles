# FileSwipe Data Model

## Purpose

This document defines the persisted shapes needed to keep FileSwipe trustworthy as scans, resumes, reminders, and queue review all evolve together.

## Model design goals

- support local-first persistence
- keep resume after restart straightforward
- make action history auditable
- keep status transitions explicit
- support additive re-scan without duplicating reviewed work
- track quality-of-life state such as reminders, storage warnings, and theme choices without inventing extra entities too early

## Core persisted shapes

## `FileItem`

Represents one reviewable photo.

Suggested fields:

- `id`: stable app-level identifier
- `nativeAssetId`: underlying media-library identifier when available
- `uri`: current known content reference
- `previewUri`: preview-ready URI when available
- `name`: display name
- `mimeType`: normalized MIME type
- `sizeBytes`: file size in bytes if known
- `createdAt`: created timestamp if available
- `modifiedAt`: modified timestamp if available
- `bucketType`: `screenshots | camera | downloads | other`
- `sortKey`: normalized value used for stable queue ordering
- `status`: `pending | kept | deleted | skipped | error`
- `lastActionAt`: timestamp of most recent action
- `lastErrorCode`: optional recent failure code
- `scanFingerprint`: lightweight persisted matching key for re-scan fallback
- `firstSeenAt`: timestamp when the file first entered the app queue
- `lastSeenAt`: timestamp when the file was last confirmed during a scan
- `isNewSinceLastScan`: flag used to surface brand-new items after additive re-scan

## `ActionLog`

Represents one recorded user or system action related to a file.

Suggested fields:

- `id`: action log id
- `fileId`: related file id
- `action`: `keep | delete | skip | open | undo | rescan | move_future`
- `result`: `success | failed | cancelled`
- `timestamp`: event time
- `sessionId`: current session identifier
- `bytesDelta`: storage change applied by the action when relevant
- `revertedActionId`: optional link to an undone action
- `errorCode`: optional structured failure code
- `errorMessage`: optional human-readable failure detail

## `AppState`

Represents the persisted app snapshot used for hydration and resume.

Suggested fields:

- `permissionState`: normalized media permission state
- `currentLane`: `photos`
- `sessionMode`: `quick10 | full_queue`
- `targetCount`: `10 | null`
- `currentFileId`: active file id
- `queueOrder`: array of file ids in stable order
- `activeFilter`: `all | screenshots | camera | downloads`
- `sortMode`: `oldest_first | newest_first | largest_first | random | smart`
- `lastCompletedScanAt`: timestamp or null
- `notificationPermissionState`: normalized notification permission state
- `scanState`: `idle | scanning | paused | failed`
- `scanMode`: `initial | rescan`
- `currentScanNewFileCount`: count of files added during the active scan
- `currentScanMatchedFileCount`: count of previously known files matched during the active scan
- `currentScanProtectedReviewedCount`: count of reviewed files protected from duplicate re-entry
- `lastRescanSummary`: optional persisted summary of the most recent additive re-scan
- `lowStorageWarning`: optional latest low-storage snapshot shown to the user
- `lastStorageCheckAt`: timestamp of the last device storage check
- `lastLowStorageNotificationAt`: timestamp of the last low-storage alert sent
- `undoBuffer`: array of recent reversible action ids, max length 3
- `sessionStats`: nested summary state
- `settings`: nested preference state

## Nested state shapes

### `sessionStats`

Suggested fields:

- `reviewedCount`
- `keptCount`
- `deletedCount`
- `skippedCount`
- `pendingCount`
- `storageFreedBytes`
- `currentStreak`
- `bestStreak`
- `milestonesHit`
- `startedAt`
- `lastUpdatedAt`

### `settings`

Suggested fields:

- `hapticsEnabled`
- `animationsEnabled`
- `followSystemTheme`
- `nightModePreference`
- `showGestureHints`
- `hasSeenGestureTutorial`
- `hasCompletedOnboarding`
- `weeklySummaryNotificationsEnabled`
- `storageAlertsEnabled`
- `debugLoggingEnabled`

## Deferred entities

Do not create these as first-class persisted entities until the product truly needs them:

- `Source`
- `ReviewSession`
- `Destination`
- comparison or grouping records

Those can be introduced later if the app adds multiple lanes, richer move flows, or heavier analytics needs.

## Status transition rules

Preferred status lifecycle:

- `pending -> kept`
- `pending -> skipped`
- `pending -> deleted` only after confirmed successful delete
- `pending -> error` only when explicit recovery handling is required
- `kept -> pending` on safe undo
- `skipped -> pending` on safe undo

## Important transition constraints

- do not use a `delete_candidate` status in V1
- canceling delete does not change status
- do not mark `deleted` until native delete succeeds
- `open` does not change terminal review status
- `skip` preserves future review eligibility

## Identity strategy

Preferred identifier strategy:

- primary app id generated and stored locally
- retain media-library asset ids when available for re-scan matching
- use `uri + modifiedAt` or a lightweight fingerprint only as a fallback

## Re-scan matching strategy

Match in this priority order when possible:

1. `nativeAssetId`
2. `uri + modifiedAt`
3. lightweight fingerprint

Goal:

- reviewed items should not re-enter as brand-new items unless they are meaningfully different or the source mapping truly changed
- additive re-scan should explain how many new files were found without wiping the existing queue

## Derived selectors to support

The store should be able to answer these quickly:

- current pending item
- next two stack items
- pending count
- reviewed count
- storage freed total
- recent reversible actions
- items by bucket type
- quick-goal completion state

## Data integrity rules

- timestamps should use a consistent machine-readable format
- counters must be derived from durable status truth or repaired from it
- action logs should be append-only where practical
- undo rollback must repair both status and progress counters together
- local reset should clear all related state together
