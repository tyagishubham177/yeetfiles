# FileSwipe Data Model

## Purpose

This document defines the core app entities and their intended relationships so the persistence layer and queue behavior stay consistent from the first prototype onward.

## Model design goals

- support local-first persistence
- make resume after restart straightforward
- make action history auditable
- keep state transitions explicit
- support future re-scan and newly found item detection

## Core entities

## `FileItem`

Represents one reviewable file in the app.

Suggested fields:

- `id`: stable app-level identifier
- `sourceNativeId`: underlying source identifier when available
- `uri`: current known URI or content reference
- `name`: display name
- `mimeType`: normalized MIME type
- `size`: size in bytes if known
- `modifiedAt`: last modified timestamp if known
- `createdAt`: created timestamp if known and available
- `bucketType`: coarse grouping such as `photo`, `screenshot`, `document`
- `previewUri`: optional preview-ready URI
- `status`: `pending | kept | moved | delete_candidate | deleted | skipped | error`
- `sourceId`: owning source reference
- `fingerprintLight`: lightweight dedupe or change-detection fingerprint
- `lastActionAt`: timestamp of most recent action on this file
- `lastErrorCode`: optional recent failure code

## `Source`

Represents one chosen content source.

Suggested fields:

- `id`: source identifier
- `kind`: `media_library | picked_docs | folder_scope_future`
- `label`: user-facing name
- `createdAt`: first time the source was saved
- `lastScannedAt`: most recent completed scan timestamp
- `permissionState`: normalized stored permission state
- `scanVersion`: optional snapshot or revision marker

## `ActionLog`

Represents one recorded user or system action related to a file.

Suggested fields:

- `id`: action log id
- `fileId`: related file id
- `action`: `keep | move | delete | skip | open | rescan`
- `destination`: optional target destination for move
- `timestamp`: event time
- `result`: `success | failed | cancelled`
- `errorMessage`: optional human-readable failure detail
- `errorCode`: optional structured failure code
- `sessionId`: session where the action happened

## `ReviewSession`

Represents one persisted session boundary for queue resume and history grouping.

Suggested fields:

- `id`: session identifier
- `sourceId`: related source
- `startedAt`: session start time
- `lastOpenedAt`: last activity timestamp
- `currentFileId`: current visible file at last persistence point
- `isComplete`: whether all pending items were exhausted

## `SessionStats`

Represents persisted or derived summary counters.

Suggested fields:

- `reviewedCount`
- `keptCount`
- `movedCount`
- `deletedCount`
- `skippedCount`
- `pendingCount`
- `streakCount`
- `newlyFoundCount`
- `lastUpdatedAt`

## `Destination`

Represents a saved or recent move target.

Suggested fields:

- `id`
- `label`
- `uri`
- `kind`
- `lastUsedAt`
- `isFavorite`

## `AppPreferences`

Suggested fields:

- `hapticsEnabled`
- `animationsEnabled`
- `onboardingCompleted`
- `lastUsedSourceId`
- `debugLoggingEnabled`

## Status transition rules

Preferred status lifecycle:

- `pending` -> `kept`
- `pending` -> `skipped`
- `pending` -> `delete_candidate`
- `delete_candidate` -> `pending` on cancel
- `delete_candidate` -> `deleted` on confirmed success
- `pending` -> `moved` on confirmed success
- any actionable state -> `error` only when the app needs explicit recovery handling

## Important transition constraints

- do not jump directly from `pending` to `deleted` without a confirmed delete path
- do not mark `moved` until move succeeds
- `open` should not change terminal review status by itself
- `skip` should preserve future review eligibility

## Identity strategy

Preferred identifier strategy:

- primary app id generated and stored locally
- retain native source ids when available for re-scan matching
- use lightweight fingerprint as a fallback for change detection when native ids are unstable or missing

## Re-scan matching strategy

Match in this priority order when possible:

1. stable source-native id
2. URI plus modified timestamp
3. lightweight fingerprint

Goal:

- reviewed items should not re-enter as brand-new items unless they are meaningfully different or the source mapping truly changed

## Suggested relational view

- one `Source` has many `FileItem`
- one `ReviewSession` belongs to one `Source`
- one `ReviewSession` has many `ActionLog`
- one `FileItem` has many `ActionLog`
- `SessionStats` can be derived per `ReviewSession` or globally cached

## Derived selectors to support

The store should be able to answer these quickly:

- current pending item
- pending count
- reviewed count
- recent actions
- newly found items since last completed scan
- items with failed recent operations
- items by status or bucket type

## Data integrity rules

- timestamps should be stored in a consistent machine-readable format
- counters should never drift from durable file status truth without repair logic
- action logs should be append-only where practical
- local reset should clear or archive all related state together
