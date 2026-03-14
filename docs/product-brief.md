# YeetFiles Product Brief

## Product name

YeetFiles

## Repository note

The repository and product now intentionally share the `YeetFiles` name.

## One-line pitch

An Android-first photo cleanup app that gets the user from welcome to first swipe in seconds, then turns storage cleanup into a short, satisfying review loop.

## Core product idea

YeetFiles should feel like clearing a backlog, not operating a file manager. The best version of the product is simple enough to start instantly and rewarding enough to return to.

The loop is:

- one photo at a time
- two clear primary actions: `Keep` or `Delete`
- one low-pressure escape hatch: `Skip`
- live progress that feels like a score, not a report
- explicit safety around any destructive action

## Problem statement

People accumulate screenshots, old camera photos, downloads, and random visual clutter. Cleanup usually fails for four reasons:

1. The entry flow is too slow or too technical.
2. The UI asks for too many different decisions at once.
3. Delete feels risky and hard to trust.
4. The experience feels like work, so people do it once and never come back.

YeetFiles exists to make cleanup:

- faster to start
- easier to parse
- safer to trust
- more satisfying to repeat

## Product goal

Make photo cleanup feel quick, safe, and energizing enough that a user will actually come back for another short session.

## Product vision

In its best form, YeetFiles becomes the "daily 10" cleanup loop for an Android phone:

- open fast
- swipe fast
- see meaningful progress immediately
- stop after a short win or keep going when momentum is high

## Target user

### Primary user

- single Android phone owner
- personal utility use only
- messy photo library
- wants storage relief without a complex gallery workflow
- values low friction more than power features

### Likely behaviors

- has many screenshots and throwaway images
- procrastinates cleanup because it feels tedious
- wants visible progress and quick wins
- is cautious about permanent deletion
- often uses utilities in short bursts, not long admin sessions

### Anti-personas

The first version is not for:

- multi-user or shared-device workflows
- enterprise file management
- cloud-drive organization
- power users expecting unrestricted desktop-style folder browsing
- users who need iOS parity on day one

## Jobs to be done

- "Help me decide quickly what should stay and what should go."
- "Help me free storage without making me manage folders."
- "Give me a cleanup task I can finish in under a minute if I want."
- "Make delete feel safe enough that I do not freeze."
- "Show me progress that feels real, not abstract."

## Core promise

The app should feel like a playful utility: quick and rewarding like a game loop, but honest and careful like a trusted tool.

## Trust promise

Trust is still the central product asset. The app must:

- ask only for the permissions it needs
- explain limits before failure happens
- never fake success for delete, move, or open
- keep progress after interruption
- make destructive moments deliberate
- use reversibility where it is actually safe

## Non-negotiables

- Android-first
- Native app approach via React Native and Expo
- Real device testing
- Local-first persistence
- Honest permission handling
- No silent destructive actions
- No fake broad file-manager claims
- A fast first-swipe path is part of product quality, not polish

## Why native instead of web

A browser-based approach is not a credible fit for the core loop. YeetFiles needs:

- Android media permission integration
- local persistence for session resume
- responsive previews and gesture handling
- truthful file-operation behavior grounded in platform capability

If the platform cannot safely do something, the product should narrow scope instead of pretending.

## V1 product scope

### In scope

- photos-only lane
- onboarding collapsed to `Welcome -> permission -> queue`
- queue boot that streams results while scanning
- actions: `Keep`, `Delete`, `Skip`
- card tap to open full preview
- oldest-first default ordering with filter chips
- `Quick 10` short-session mode plus `Full queue`
- live reviewed count, remaining count, and storage-freed counter
- celebratory but restrained milestones and summary screen
- resume sessions after app restart
- recent action history and undo for reversible review actions

### Deliberately simplified in V1

- no separate source-selection screen
- no five-button action toolbar
- no primary `Move` action in the queue
- no batch delete review staging model
- no always-dark onboarding if the system is using light theme

## V1.5 scope

- move as a secondary action from long-press or overflow
- safer post-action undo expansion if platform capability allows it
- comparison view for similar photos
- better shareable end-of-session summary
- additional smart buckets such as large files

## Out of scope for V1

- iOS parity
- desktop app
- cloud sync
- multi-user accounts
- OCR-heavy analysis
- background full-device intelligence
- unrestricted arbitrary folder browsing
- broad document-lane promises

## Product success signals

### Early qualitative signals

- users understand the app immediately from the welcome screen
- the first swipe happens quickly on a small real-device library
- the queue feels easier than using the gallery directly
- delete feels deliberate, not scary
- the summary screen feels like a win screen, not a report

### Early quantitative signals to eventually measure

- time to first swipe
- files reviewed per minute
- storage freed per session
- completion rate for `Quick 10`
- session return rate within 7 days
- queue abandonment before the first decision

## Strategic guardrails

- start narrow and reliable
- optimize for momentum before adding power features
- do not use delight to hide risk
- do not let safety turn into needless extra steps
- only add complexity after the core loop feels excellent on a real Android phone
