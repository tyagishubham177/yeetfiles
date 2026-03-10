# FileSwipe Product Requirements

## Purpose

This document expands the product brief into concrete requirements for the first real build path.

## Product stance

FileSwipe is a local-first Android cleanup utility with a playful review loop. The product is not a generic file manager and should not mimic one until capability and trust have been proven.

## V1 functional requirements

## 1. Onboarding and entry

The app must:

- explain what the app does in plain language
- state that access depends on Android permissions and supported sources
- offer `Start cleanup` as the primary entry point
- offer `Resume session` only when local state exists

Acceptance criteria:

- no wall of text before first action
- core permission explanation visible before the user commits
- onboarding can be reset later from settings

## 2. Permission handling

The app must:

- check permission state before scan-dependent actions
- request permission only when needed
- clearly explain denied or revoked permission states
- provide a retry path and a route to system settings when appropriate

Acceptance criteria:

- permission-dependent screens never assume access exists
- denied permission does not dump user into a fake empty queue
- revoked permission after earlier use is detected and surfaced

## 3. Source selection

The app must:

- let the user choose a supported source lane
- clearly label what each source can and cannot access
- avoid showing unsupported source types as if they are ready

Acceptance criteria:

- photos/media lane is present in Phase 0 and V1
- document lane can appear as later or limited, but not as false promise

## 4. Scanning

The app must:

- scan the chosen supported source
- normalize returned file metadata into an internal queue format
- show live scan feedback for non-trivial scans
- persist scan results locally for session resume and re-scan comparison

Acceptance criteria:

- the user knows whether the app is scanning, done, or blocked
- scans can complete on a small real-device media set
- the queue is not rebuilt blindly on every app launch

## 5. Queue review loop

The app must:

- show one primary file card at a time
- keep progress visible while reviewing
- support gesture-first and tap-first usage
- advance only when an action result is known

Acceptance criteria:

- `Keep` and `Skip` work in Phase 0
- queue order remains stable for a given scan snapshot
- already reviewed items do not immediately re-enter the visible queue

## 6. File actions

Supported actions in V1:

- `Keep`
- `Move`
- `Delete candidate`
- `Skip`
- `Open`

Action behavior requirements:

- `Keep` records a durable decision
- `Skip` leaves the file safe and reviewable later
- `Open` is exploratory and does not finalize the item
- `Move` requires explicit destination confirmation
- `Delete candidate` must be confirmed before destructive execution

Acceptance criteria:

- every file operation returns a typed success or failure result
- the UI never claims success when the operation failed
- in-flight action state blocks double submission

## 7. Delete safety

The app must:

- visually distinguish delete from neutral actions
- require a confirm step before destructive delete
- leave the file unchanged when the user cancels
- store a visible action log entry for confirmed delete attempts

Acceptance criteria:

- cancel never marks item as deleted
- confirmed deletion updates local state only after the system reports success
- failed deletion keeps the item in a safe non-deleted state

## 8. Move flow

The app must:

- open a move destination picker
- support recent or favorite destinations when available
- show success or failure clearly
- keep the user in control if move fails

Acceptance criteria:

- move success updates file state and action log
- move failure does not falsely reduce pending work
- last-used destination can be surfaced in later phases

## 9. Local persistence

The app must:

- store queue state locally
- store file statuses locally
- store action log entries locally
- resume the current queue state after app restart

Acceptance criteria:

- closing and reopening the app does not reset reviewed progress
- local state survives normal background and foreground transitions
- data reset is possible from settings

## 10. Summary and progress

The app must:

- show reviewed and remaining counts
- show counts for kept, moved, deleted, and skipped items
- surface newly found files after re-scan
- provide a clean summary screen after or during sessions

Acceptance criteria:

- counts remain internally consistent
- reviewed count reflects only durable decisions
- summary loads from persisted state, not transient UI state

## 11. History and debugging

The app must:

- store recent action history
- log failure context locally for debugging
- allow export of a local debug log in later milestone work

Acceptance criteria:

- action history is sufficient to understand the last few user operations
- failed operations are inspectable after the fact

## V1 non-functional requirements

## Safety

- destructive actions must require explicit confirmation
- failures must be user-visible
- the app must favor safe inaction over ambiguous action

## Performance

- first meaningful action should happen quickly on a small media set
- preview loading should feel responsive on a real phone
- large media sets should degrade gracefully rather than crash

## Resilience

- app restarts should preserve queue state
- permission revocation should not corrupt local data
- slow file operations should show visible progress or busy state

## Offline behavior

- core review flows must work without network connectivity
- network absence must not block local-first behavior

## Accessibility

- every swipe action must have a button equivalent
- important states cannot rely on color alone
- touch targets must support one-hand mobile use

## Explicit out-of-scope requirements for V1

- no cloud account system
- no cross-device sync
- no "smart cleanup" claims that depend on heavy inference
- no unrestricted arbitrary folder browsing promise
- no hidden auto-delete behavior

## Phase 0 subset

The first build milestone intentionally narrows the requirement set to:

- permission request for photos/media
- small media scan
- queue UI with image card
- `Keep` and `Skip`
- local persistence
- restart resume

If Phase 0 is unreliable on a real Android device, the product should not expand scope yet.
