# Phase 1: Trust, Reward, and Repeatability

## Goal

Turn the feasibility loop into a short-session product people would plausibly want to use again.

## Success shape

By the end of Phase 1, YeetFiles should feel physical, rewarding, and forgiving without losing trust.

## Stream 1A: Undo and reversibility

| Task | Deliverable | Verification |
| --- | --- | --- |
| Undo buffer expansion | Circular buffer for last 10 reversible actions | Undo several actions in sequence |
| Undo toast | Visible `Undo` affordance after safe actions | Verify 5-second window |
| Counter rollback | Reviewed and storage counts reverse correctly | Undo a prior action and inspect counters |
| Card re-insertion | Prior card returns cleanly to the queue | Undo and verify photo identity |
| Undo badge | Optional dock badge like `Undo (3)` | Review several items and verify count |

## Stream 1B: Gesture, motion, haptics, and education

| Task | Deliverable | Verification |
| --- | --- | --- |
| Swipe gestures | Right=`Keep`, left=`Delete` | Device gesture testing |
| Drag rotation and spring-back | Physical-feeling card behavior | Screen recording review |
| Full-screen color wash | Mint on keep, coral on delete | Video review on device |
| First-run tutorial card | One fake instructional card before first real photo | Fresh install walkthrough |
| Gesture hints on early cards | Hints fade after understanding | First-time flow test |
| Haptic palette | Differentiated tactile feedback | Manual device validation |
| Optional sound palette | Off by default, toggleable | Verify settings toggle and audio behavior |
| Idle breathing and dock response | Card and dock feel alive at rest and during drag | Manual visual review |

## Stream 1C: Reward surfaces and summary polish

| Task | Deliverable | Verification |
| --- | --- | --- |
| Progress ring | Animated ring with goal progress | Check at 0%, 50%, and 100% |
| Milestone banners | Rewards at 5, 25, 50, and 100 actions | Hit each threshold in test sessions |
| Animated counter ticks | Reviewed and freed counters pulse on update | Screen recording review |
| Floating `+X MB` feedback | Delete reward animates toward score | Delete several files and verify |
| Stronger storage context | Optional subtitle like `That's about 86 more photos` | Copy review against several sizes |
| Summary victory screen | Big reviewed count, freed space, duration, streak | Finish session and verify data |
| Home dashboard for return visits | Returning users see stats and quick-start options | Relaunch app after completed sessions |

## Stream 1D: Filters, sorting, and session goals

| Task | Deliverable | Verification |
| --- | --- | --- |
| Filter chips with counts | `All (142)`, `Screenshots (47)`, and similar | Compare chip counts to underlying state |
| Filter persistence | Active filter survives restart | Change filter, restart, re-check |
| Sort options | Oldest, newest, largest, random, smart | Switch and verify ordering |
| Smart `most deletable first` heuristic | Screenshots, burst-like duplicates, large files surface early | Manually review first items in mixed library |
| Adaptive quick-session targets | 10, 25, and 50 item goals with rough time estimates | Complete each mode and verify transitions |
| Velocity indicator experiment | Optional live review speed in header | Confirm it helps rather than distracts |

## Phase 1 bifurcations

## Universal versus tiered delete confirmation

Conservative path:

- keep confirmation for every delete

Faster path:

- direct delete with undo for low-risk screenshots and downloads
- confirmation for camera photos, videos, and large files

Choose the faster path only after three strong conditions are true:

- users understand the delete consequence
- undo is reliable
- real-device testing shows universal confirmations are slowing sessions materially

## Fixed versus adaptive quick sessions

Conservative path:

- keep `Quick 10`

Expanded path:

- rename to `Quick Session`
- offer 10, 25, and 50 item targets

Choose the expanded path only if the added choice does not slow the welcome-to-queue flow.

## Exit gate

Phase 1 is done when the app feels fun to use in short bursts and still behaves like a careful utility.

## Exit checklist

- undo is reliable for `Keep`, `Skip`, and any safe direct-delete path
- reward effects add energy without blocking rapid swiping
- milestone celebrations stay brief and non-disruptive
- filters increase decision speed and their counts stay accurate
- swipe physics feel polished on a mid-range Android phone
- haptics and optional sounds are correctly differentiated per action
- the summary feels like a victory screen, not a report
- TalkBack users can complete the loop with button alternatives and meaningful labels
- no animation or motion creates visible jank during active review

