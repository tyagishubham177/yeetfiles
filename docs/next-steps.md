# FileSwipe Next Steps

## Immediate next milestone

Build the first coherent Phase 1 trust-and-reward slice.

## Current Phase 1 slice

- safe undo for `Keep` and `Skip`
- quick-session targets for 10, 25, and 50 items
- filter chips with persisted selection
- sort choices that keep queue exploration lightweight
- milestone feedback and a stronger summary screen

## Suggested implementation order

1. Validate the safe undo path for `Keep` and `Skip`, including count rollback and clean card reinsertion.
2. Verify filter chips and sort mode persist after restart without corrupting queue continuity.
3. Confirm `Quick 10`, `Quick 25`, and `Quick 50` all start and complete with correct progress math.
4. Tune milestone timing and summary copy on a real Android device so reward stays brief and readable.
5. Add haptic differentiation only after the visual and trust layer feels stable on device.

## Success criteria

- undo is reliable for safe actions
- quick-session target choice does not slow the welcome-to-queue flow
- filter changes feel helpful rather than disorienting
- summary feels like a win screen, not a report
- queue state survives restart with the active filter and target intact

## Decisions to keep open for now

- whether delete can ever support a truthful restore path on target Android versions
- whether `random` sort adds enough value to keep
- how aggressive milestone copy and motion should be on smaller phones
- when to add differentiated haptics and optional sound without adding native churn

## Verification checklist for the next pass

- confirm undo works from both the queue and the summary screen while the window is still active
- confirm filter counts match the visible pool on a mixed real library
- confirm changing sort modes does not create duplicates or hide actionable cards
- confirm `Quick 25` and `Quick 50` still route to summary cleanly
- confirm closing and reopening the app restores the active filter, sort, and session target
