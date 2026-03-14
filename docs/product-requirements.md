# YeetFiles Product Requirements

## Purpose

This document expands the product brief into concrete requirements for the first build path.

## Product stance

YeetFiles is a local-first Android photo cleanup utility with a playful loop. It is not a generic file manager. The product should win by being faster to start, easier to parse, and more satisfying to repeat.

## V1 functional requirements

## 1. Onboarding and entry

The app must:

- explain the product in plain language on the welcome screen
- include permission and trust context inline on that screen
- use `Start cleaning` as the primary CTA
- offer `Resume session` only when local state exists
- avoid a separate source-selection step in V1

Acceptance criteria:

- the user can reach the native permission prompt directly from the welcome screen
- there is no dedicated permission-plus-source route in the main happy path
- the first swipe should be reachable quickly on a small real-device photo library

## 2. Permission handling

The app must:

- check permission state before scan-dependent actions
- request permission only when needed
- clearly explain denied or revoked permission states
- provide retry and system-settings recovery paths when appropriate

Acceptance criteria:

- permission-dependent screens never assume access exists
- denied permission does not dump the user into a fake empty queue
- revoked permission after earlier use is detected and surfaced cleanly

## 3. Scan boot and queue creation

The app must:

- scan the photos lane only in V1
- normalize returned photo metadata into a queue-friendly internal shape
- stream initial results into the queue while background scanning continues
- skip a dedicated scan screen when the scan completes quickly
- persist enough scan output locally for resume and later re-scan comparison

Acceptance criteria:

- if scan completes in under roughly 2 seconds, the user goes straight to the queue
- if scan takes longer, the queue still feels alive through streaming or inline scan feedback
- the queue is not rebuilt blindly on every app launch

## 4. Queue review loop

The app must:

- show one dominant photo card at a time
- use two primary queue actions: `Keep` and `Delete`
- expose `Skip` as a lighter secondary action
- support gesture-first and tap-first usage
- treat card tap as `Open preview`

Acceptance criteria:

- `Keep` is available by swipe right and button
- `Delete` is available by swipe left and button
- `Skip` has a visible non-gesture path
- `Open preview` does not compete as a primary queue button

## 5. Gesture affordance and discovery

The app must:

- show directional hints on the first few cards
- fade those hints after the user demonstrates understanding
- keep button equivalents visible at all times

Acceptance criteria:

- first-time users can discover swiping without a tutorial wall
- gesture hints disappear once they are no longer needed
- queue usage remains fully possible without gestures

## 6. Delete safety

The app must:

- require an explicit inline second confirmation before permanent delete
- avoid `delete_candidate` as a user-facing concept
- keep the file unchanged when delete is not confirmed
- only mark the file deleted after the system reports success

Acceptance criteria:

- an unconfirmed delete restores the exact prior state
- delete failures never show fake success
- delete copy is factual and calm, not dramatic

## 7. Undo and reversibility

The app must:

- provide first-class undo for reversible review decisions
- keep a short recent-action buffer for the current session
- reinsert the prior card cleanly when undo succeeds

Acceptance criteria:

- `Keep` and `Skip` can be undone from a toast for a short window
- the undo buffer stores at least the last 3 reversible actions
- permanent delete is only undoable if platform behavior proves a safe restore path

## 8. Session modes, sorting, and filters

The app must:

- support `Quick 10` as a short-session mode
- support `Full queue` as the uncapped mode
- default queue ordering to `oldest first`
- expose lightweight filter chips such as `All`, `Screenshots`, `Camera`, and `Downloads`

Acceptance criteria:

- first-time users can finish a meaningful short session without fatigue
- sort and filter changes do not corrupt queue state
- filters help users find easy-delete categories quickly

## 9. Progress, reward, and summary

The app must:

- keep reviewed and remaining counts visible during review
- keep a live `storageFreedBytes` counter during the session
- show milestone feedback at small and large moments
- present a celebratory summary when a session ends or a target is reached

Acceptance criteria:

- reviewed count updates as part of the swipe loop
- storage freed increases immediately after confirmed deletes
- the summary feels like a victory screen and includes a clear `Continue` path

## 10. Local persistence

The app must:

- store queue state locally
- store file statuses locally
- store action history locally
- store session settings such as active mode, filter, and sort
- resume the current queue after app restart

Acceptance criteria:

- closing and reopening the app does not reset reviewed progress
- current mode and current card are restored sensibly
- local reset remains possible from settings

## 11. Open preview and secondary actions

The app must:

- open a larger preview when the current card is tapped
- preserve queue position when returning from preview
- keep move out of the primary queue action set in V1

Acceptance criteria:

- preview is exploratory and does not finalize the item
- returning from preview keeps the same active card
- any move flow begins from a secondary affordance in a later phase

## 12. History and debugging

The app must:

- store recent action history
- log failure context locally for debugging
- keep action records clear enough to reconstruct the last session

Acceptance criteria:

- recent actions can explain what the user just did
- failed operations are inspectable after the fact

## V1 non-functional requirements

## Safety

- destructive actions must require explicit confirmation
- failures must be user-visible
- the app must favor safe inaction over ambiguous action
- reward effects must never disguise destructive consequences

## Performance

- first meaningful queue interaction should happen quickly on a small media set
- preview loading should feel responsive on a real phone
- small scans should not force users through an unnecessary waiting screen
- large media sets should degrade gracefully rather than crash

## Resilience

- app restarts should preserve queue state
- permission revocation should not corrupt local data
- slow file operations should show visible busy state
- undo must not create duplicate or contradictory status transitions

## Offline behavior

- core review flows must work without network connectivity
- network absence must not block local-first behavior

## Accessibility

- every gesture action must have a button or link equivalent
- important states cannot rely on color alone
- touch targets must support one-handed use
- haptics and motion must be optional in settings

## Explicit out-of-scope requirements for V1

- no source-selection step for the main photos flow
- no five-primary-action toolbar
- no unrestricted arbitrary folder browsing promise
- no cloud account system
- no cross-device sync
- no hidden auto-delete behavior
- no fake post-delete undo if the platform cannot really restore the file

## Phase 0 subset

The first build milestone intentionally narrows the requirement set to:

- welcome screen with inline trust note
- native media permission request
- photo scan boot with streaming queue entry
- `Keep`, `Delete`, and `Skip`
- live reviewed count and storage-freed counter
- `Quick 10` support
- local persistence and restart resume

If Phase 0 feels slow, confusing, or untrustworthy on a real Android device, the product should not expand scope yet.
