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

Phase 0 is done only when the whole loop works on a real Android phone with believable speed and without trust-breaking behavior.

## Exit checklist

- app runs on a real Android phone, not just an emulator
- first swipe happens in under 5 seconds from `Start cleaning`
- no dedicated scan screen appears for small libraries
- `Keep`, `Delete`, and `Skip` all produce correct state transitions
- delete confirmation is clear, calm, and accurate
- storage-freed counter changes only after confirmed successful delete
- reviewed and remaining counts stay accurate during and after `Quick 10`
- queue state survives restart without duplicates
- denied permission shows a recovery path, not a fake empty queue
- UI feels mobile-native instead of like a web wrapper
