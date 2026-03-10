# FileSwipe Technical Architecture

## Architecture stance

FileSwipe is Android-first, local-first, and capability-aware.

That stance means:

- the app should be built around supported Android-native paths, not imagined file access
- local persistence is a first-class part of the design, not an afterthought
- every permission-dependent feature must gate itself
- risky file operations must be wrapped in explicit, typed result handling

## Recommended stack

- React Native
- Expo
- TypeScript with strict mode
- Expo Router or React Navigation, with Expo Router preferred if it keeps route structure simple
- Zustand for lightweight app state
- SQLite or equivalent local persistent store for indexed state
- Expo Media Library for media access
- Expo FileSystem for supported file operations
- Expo Document Picker for document-lane flows when that lane begins

## Architecture goals

- reliable resume after restart
- clean separation between UI and native capability access
- stable queue behavior over multiple sessions
- safe and auditable file operations
- low mental overhead for future iteration

## Layer model

## 1. App shell layer

Responsibilities:

- boot app
- hydrate persisted state
- load fonts and theme tokens
- mount navigation
- catch top-level errors

Outputs:

- route tree
- app-level providers
- startup readiness state

## 2. Permission layer

Responsibilities:

- query current permission state
- request permission when needed
- normalize permission status across screens
- react to revoked permission on app resume or feature entry

Outputs:

- permission snapshot
- capability flags for scan and preview actions

## 3. Scanner layer

Responsibilities:

- query supported source items
- normalize raw media metadata
- generate stable app-level file records
- persist scan snapshot and source metadata

Outputs:

- normalized `FileItem` records
- source snapshot metadata
- newly found item detection inputs

## 4. Queue engine layer

Responsibilities:

- decide next file to show
- record user review decisions
- calculate pending and reviewed counts
- support future undo or replay-friendly history

Outputs:

- current queue state
- action transitions
- summary stats

## 5. Preview layer

Responsibilities:

- prepare thumbnail or preview URIs
- degrade gracefully when preview generation is slow or unavailable
- keep preview behavior isolated from queue logic

Outputs:

- preview source for current card
- placeholder or fallback state

## 6. File operations layer

Responsibilities:

- execute `Move`, `Delete`, and `Open`
- verify results as far as capability allows
- return typed success or failure objects
- write action log entries

Outputs:

- operation result objects
- user-visible success or failure state
- persisted action log entries

## 7. Progress and persistence layer

Responsibilities:

- persist queue position
- persist file statuses
- persist summary counters or derive them efficiently
- restore session state after restart

Outputs:

- hydrated app state
- summary metrics
- resume eligibility state

## Primary modules

### `app-shell`

Navigation, boot logic, theme setup, error boundaries, and startup hydration.

### `permissions`

Runtime Android permission checks, revocation handling, and permission-state storage.

### `scanner`

Indexes supported items from the selected source and normalizes metadata into internal records.

### `queue-engine`

Produces the next candidate file, records actions, manages ordering rules, and keeps the queue deterministic.

### `preview-engine`

Builds preview-ready URIs or image metadata without coupling preview generation to queue state mutation.

### `file-ops`

Owns move, delete, open, result verification, and the final typed response returned to UI.

### `progress-store`

Stores queue position, file status, session summary, and recent history.

### `sync-watch`

Compares later scans against prior snapshots to detect newly added items without reintroducing reviewed files.

## Data flow overview

### Initial scan flow

1. User selects supported source.
2. Permission layer verifies access.
3. Scanner queries source and normalizes items.
4. Persistence layer stores the snapshot and file records.
5. Queue engine selects the first pending item.
6. UI renders queue screen.

### Review action flow

1. User triggers `Keep`, `Skip`, `Move`, or `Delete candidate`.
2. Queue engine validates that the item is actionable.
3. For `Move` or `Delete`, file-ops executes native action.
4. File-ops returns typed result.
5. Queue engine commits state transition only after success or explicit safe staging behavior.
6. Progress state updates.
7. UI advances or surfaces failure state.

### Resume flow

1. App starts.
2. Persistence layer hydrates last known session.
3. Permission layer refreshes capability status.
4. App shell decides whether `Resume session` is available.
5. Queue engine restores the next pending item.

## Typed result philosophy

All file operations should return structured results, not booleans.

Example direction:

```ts
export type FileOpResult =
  | { ok: true; action: 'move' | 'delete' | 'open'; fileId: string; timestamp: string }
  | { ok: false; action: 'move' | 'delete' | 'open'; fileId: string; errorCode: string; message: string };
```

This keeps UI behavior explicit and testable.

## Persistence strategy

Use a local store that can support:

- session metadata
- file item records
- action logs
- settings and preferences
- source snapshots

Candidate split:

- Zustand for in-memory session and UI-friendly selectors
- SQLite for durable persistence and indexed lookup

## Performance considerations

- large media libraries should be scanned in pages or batches where practical
- preview loading should avoid decoding huge images eagerly
- queue selection must not depend on full-array reprocessing every render
- summary counts should be derived efficiently or cached responsibly

## Failure handling requirements

- permission failure and operation failure must be distinct states
- failed file operations must log enough context for debugging
- state updates should be transactional enough to avoid phantom success
- a crash or forced close should not mark unfinished destructive actions as completed

## Capability boundaries

The system must recognize these boundaries early:

- not every Android source supports the same move/delete semantics
- broad arbitrary folder access may remain limited or future-scoped
- document lane behavior may differ materially from media lane behavior
- delete semantics can vary by source and platform version

## Architectural anti-patterns to avoid

- UI directly calling native APIs without a service boundary
- file status being mutated in multiple unrelated layers
- optimistic destructive success without verification
- route screens accumulating business logic
- broad abstraction before the first vertical slice proves itself
