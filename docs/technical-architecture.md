# FileSwipe Technical Architecture

## Architecture stance

FileSwipe is Android-first, local-first, speed-to-first-swipe aware, and capability-aware.

That stance means:

- build around supported Android-native photo flows, not imagined broad storage access
- treat local persistence as a first-class part of the loop
- gate every permission-dependent feature explicitly
- keep the first implementation smaller than the docs used to suggest
- optimize for a fast queue boot before adding broad abstractions

## Recommended stack

- React Native
- Expo
- TypeScript with strict mode
- Expo Router, unless navigation complexity proves otherwise
- Zustand for app state
- AsyncStorage through a thin persistence adapter for Phase 0 and Phase 1
- Expo Media Library for photo access
- React Native Reanimated plus React Native Gesture Handler for the card loop
- Expo FileSystem only where it supports trustworthy local operations or logging

## Architecture goals

- fast first swipe on a small real-device photo library
- reliable resume after restart
- deterministic queue behavior over multiple sessions
- simple persistence that can evolve later
- safe and auditable file operations
- low mental overhead for early iteration

## Layer model

## 1. App shell layer

Responsibilities:

- boot the app
- hydrate persisted state
- load fonts and theme settings
- mount navigation
- catch top-level errors

Outputs:

- route tree
- app-level providers
- startup readiness state

## 2. Permission and boot layer

Responsibilities:

- query current media permission state
- request permission from the welcome flow
- react to revoked permission on app resume
- trigger scan boot immediately after permission is granted

Outputs:

- permission snapshot
- boot state for the queue
- resume eligibility

## 3. Scanner and classifier layer

Responsibilities:

- page through supported photo assets
- normalize raw media metadata
- classify lightweight buckets such as screenshots or camera photos
- feed cards into the queue as soon as enough data is available

Outputs:

- normalized `FileItem` records
- queue order seeds
- filter and sort metadata

## 4. Review engine layer

Responsibilities:

- decide the next file to show
- apply keep, delete, and skip transitions
- maintain `Quick 10` and full-queue session logic
- own undo buffering for reversible actions

Outputs:

- current queue state
- action transitions
- recent reversible history

## 5. Reward and summary layer

Responsibilities:

- calculate reviewed and remaining counts
- update storage-freed score
- trigger milestone eligibility
- build summary data for session completion

Outputs:

- live score state
- milestone events
- summary payloads

## 6. Preview and file-ops layer

Responsibilities:

- prepare preview-ready photo data
- open the current photo in a larger preview
- execute delete and later move operations through typed results
- isolate native capability handling from UI code

Outputs:

- preview data
- file-operation result objects
- failure context for logs

## 7. Persistence layer

Responsibilities:

- persist the minimal app state snapshot
- store file records and action history
- restore queue position, filters, and current mode after restart
- support future migration to a stronger store if needed

Outputs:

- hydrated app state
- stored action history
- migration-safe persistence boundary

## Primary modules

### `app-shell`

Navigation, boot logic, theme setup, error boundaries, and startup hydration.

### `permissions`

Runtime media permission checks, revocation handling, and queue boot gating.

### `scanner`

Photo indexing, normalization, bucket classification, and streaming results into the review engine.

### `review-engine`

Queue ordering, keep/delete/skip transitions, quick-goal tracking, and undo buffering.

### `rewards`

Reviewed counts, storage-freed math, milestone events, and summary payloads.

### `preview-engine`

Preview-ready URIs and larger-preview preparation without mutating queue state.

### `file-ops`

Delete, later move, open-preview handoff, and typed result normalization.

### `persistence`

AsyncStorage adapter, hydration, migration helpers, and action log storage.

## Data flow overview

### Initial boot to first swipe

1. User taps `Start cleaning`.
2. Permission layer requests media access.
3. Scanner starts immediately after grant.
4. Normalized photo records stream into persistence and review state.
5. Review engine selects the first eligible card.
6. UI renders the queue while scanning can continue in the background.

### Review action flow

1. User triggers `Keep`, `Delete`, or `Skip`.
2. Review engine validates that the item is actionable.
3. For `Delete`, file-ops performs the native operation after confirmation.
4. File-ops returns a typed result.
5. Review engine commits state only after confirmed success.
6. Reward layer updates counts and storage score.
7. Persistence saves the new snapshot.

### Undo flow

1. User performs a reversible action.
2. Review engine stores a short-lived undo entry.
3. User taps `Undo`.
4. Review engine restores the prior state.
5. Reward layer rolls back the relevant counters.
6. Persistence saves the repaired state.

### Resume flow

1. App starts.
2. Persistence hydrates last known state.
3. Permission layer refreshes access state.
4. App shell decides whether `Resume session` is available.
5. Review engine restores the active card and current session mode.

## Typed result philosophy

All capability-dependent operations should return structured results, not booleans.

Example direction:

```ts
export type FileOpResult =
  | { ok: true; action: 'delete' | 'move' | 'open'; fileId: string; timestamp: string }
  | { ok: false; action: 'delete' | 'move' | 'open'; fileId: string; errorCode: string; message: string };
```

This keeps UI behavior explicit and testable.

## Persistence strategy

Use a minimal persistence boundary that can support:

- app state snapshot
- file item records
- action logs
- settings and preferences
- queue resume metadata

Phase 0 and Phase 1 direction:

- Zustand for in-memory state and selectors
- AsyncStorage behind a persistence adapter for durable storage

Upgrade to SQLite later only if one of these becomes real:

- queue sizes create noticeable hydration cost
- indexed queries become necessary
- action history and analytics-like state become too expensive to recompute

## Performance considerations

- scan in pages or batches and stream early results
- avoid a blocking full-library wait before showing the first card
- apply default sort rules during normalization so render-time work stays small
- avoid eager full-resolution image decoding
- keep selectors focused on the active card and nearby stack items

## Failure handling requirements

- permission failure and operation failure must be distinct states
- failed file operations must log enough context for debugging
- state updates must avoid phantom success
- a crash or force close must not mark unfinished destructive actions as complete

## Capability boundaries

The system must recognize these boundaries early:

- delete semantics may vary by Android version and asset access path
- post-delete undo is not safe to promise unless platform behavior truly supports restore
- move is a later, slower secondary action, not part of the primary loop
- document-lane behavior remains materially different from the photos lane

## Architectural anti-patterns to avoid

- designing for multiple lanes before the photos loop feels great
- forcing a dedicated scan screen for trivial scans
- keeping separate sources, sessions, and database layers before they are needed
- UI directly calling native APIs without a service boundary
- storing the same truth in multiple competing status systems
