# Phase 0: First-Swipe Feasibility

## Goal

Prove that FileSwipe can deliver a fast, understandable, safe first loop on a real Android phone.

## Core promise for this phase

A user should be able to tap `Start cleaning`, reach a real photo card quickly, complete a short session, and trust the outcome.

## Non-goals

- no move flow
- no document lane
- no heavy smart-cleanup claims
- no notification system
- no advanced social or share features

## Stream 0A: App shell and navigation

| Task | Deliverable | Verification |
| --- | --- | --- |
| Expo and React Native init with TypeScript strict mode | Working `npx expo start` app shell | App runs on emulator and phone |
| Expo Router setup with `/`, `/queue`, and `/summary` | Three working routes | Navigate between all routes |
| Theme tokens for color, typography, spacing, radius, and shadows | `ui-tokens.ts` | Visual review on device |
| Font loading for `Space Grotesk` and `DM Sans` | Fonts render intentionally | Screenshot comparison on device |
| Error boundary wrapper | Friendly error screen | Manually throw an error and verify |
| Safe-area aware app shell | Correct status-bar and inset handling | Verify on a notched Android phone |

## Stream 0B: Permission and scan pipeline

| Task | Deliverable | Verification |
| --- | --- | --- |
| Permission service | Check, request, and re-check media permission | Grant, deny, and revoke on device |
| Permission-denied UI | Clear recovery state with retry | Deny permission and verify UI |
| Paginated media scan service | Streams normalized `FileItem[]` | Scan 200+ photos and log first result timing |
| `FileItem` metadata enrichment | `width`, `height`, bucket type, timestamps, bytes | Inspect logged records against real photos |
| Bucket classifier | Categorizes screenshots, camera, downloads | Verify against mixed real library |
| Scan-to-queue streaming | First card appears before full scan ends | Measure on device |
| Local analytics stub | `session_start` and `first_swipe` events written locally | Export log and confirm events |

## Stream 0C: Queue UI and core loop

| Task | Deliverable | Verification |
| --- | --- | --- |
| Full-bleed card component | Renders current `FileItem` cleanly | Review portrait and landscape photos |
| Card stack peek | Visible next-card depth illusion | Screenshot idle queue state |
| `Keep` action | Swipe right and button path | Verify status after several keeps |
| `Delete` action with confirmation sheet | Confirmed delete path with cancel support | Verify sheet appears and cancel is safe |
| `Skip` action | Secondary non-destructive path | Verify it records correctly |
| Two-button action dock plus small `Skip` | Thumb-friendly layout | One-handed device test |
| Progress header | Reviewed, remaining, and storage-freed counters | Review 10 items and verify counters |
| `Quick 10` session mode | Stops at exactly 10 and routes to summary | Complete one session on device |
| Calm delete copy | Destructive sheet explains consequence clearly | Manual wording review |

## Stream 0D: Persistence and resume

| Task | Deliverable | Verification |
| --- | --- | --- |
| AsyncStorage adapter | Saves and restores `AppState` | Close and reopen app |
| Queue resume on restart | Same card and same counts restored | Kill app mid-session and reopen |
| Persist on every action | No data loss after force close | Force-close after `Keep` and `Delete` |
| Welcome resume CTA | `Resume session` appears when valid | Compare fresh install and returning state |
| Local reset | Clears persisted state | Reset and confirm clean start |

## Phase 0 bifurcations

## Delete model

Default path:

- confirm every delete in Phase 0
- optimize for trust first

Accelerated experiment path:

- allow direct delete for low-risk screenshots only behind a flag
- keep a visible undo path

Choose the accelerated path only if real-device testing shows the universal confirmation sheet is materially slowing short sessions and users still understand the delete consequence.

## Session-goal model

Default path:

- ship `Quick 10` only

Optional experiment path:

- prototype 25 and 50 targets behind an internal flag after `Quick 10` is stable

Choose the experiment path only after the 10-item session feels crisp and accurate.

## Queue ordering

Default path:

- keep a stable, understandable sort, even if simple

Preferred path if low-risk to implement:

- add a smart ordering mode that bubbles up obviously deletable items first

Do not let a clever sort delay Phase 0 exit.

## Exit gate

Phase 0 is done only when the full `Welcome -> permission -> queue -> summary -> continue/restart` loop works on a real Android phone with believable speed, stable startup, and no trust-breaking behavior.

## Success parameters

### 1. Launch and startup reliability

- the app starts consistently on a real Android phone
- `npm run dev:tunnel` is not a one-shot gamble; if tunnel is unstable, the fallback path is clear and usable
- the app reaches the welcome screen and queue flow without route, hydration, or startup crashes

### 2. First-use flow

- tapping `Start cleaning` starts a real scan without requiring hidden manual recovery
- the first meaningful queue interaction happens quickly on a small real-device library
- if scanning takes longer, the queue still shows honest progress and an explicit recovery path
- denied or blocked permission shows a real recovery state, not a fake empty queue

### 3. Core queue loop

- at least one real photo card appears and is reviewable
- `Keep`, `Delete`, and `Skip` all work through visible UI, not gestures alone
- reviewed count, remaining count, and storage-freed values stay accurate while reviewing
- delete only counts as successful after the system confirms the delete

### 4. Session completion

- `Quick 10` stops at exactly 10 reviewed items
- the summary screen is fully visible on a phone and scrolls when needed
- the summary offers a clear path to continue cleaning and a clear path to start fresh

### 5. Persistence and trust

- queue state survives restart without duplicates or confusing resets
- resume only appears when there is a real resumable session
- starting fresh does not silently reuse a dead queue
- destructive behavior remains understandable and user-controlled

### 6. UX quality bar

- the UI feels mobile-native rather than like a cramped web view
- key surfaces respect safe areas and do not cut off important content
- loading, scanning, error, and completion states are all visible and understandable
- no blocking crash, render loop, or stuck loading state remains in the primary Phase 0 path

## Signoff checklist

- app runs on a real Android phone, not just an emulator
- welcome screen content is fully visible
- `Start cleaning` leads to a real scanning/review flow
- at least one real photo card appears without manual debugging steps
- `Keep`, `Delete`, and `Skip` behave correctly
- `Quick 10` completes and reaches summary cleanly
- summary scrolls fully and supports continue plus fresh restart
- queue state and resume behavior remain trustworthy after restart
- permission recovery works when access is denied or revoked
- no crash, stuck scan, or obvious trust break remains in the main loop
