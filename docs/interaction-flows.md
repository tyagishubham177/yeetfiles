# YeetFiles Interaction Flows

## Interaction model

The app supports both gesture-first and tap-first usage. Gesture users get speed. Tap users get precision. Neither group should feel like a second-class user.

## Global interaction rules

- every reversible review action should surface undo
- every destructive action must be explicitly confirmed
- user should always know what happened after an action
- app should never jump screens unexpectedly mid-review
- queue should not advance until action result is known
- scan progress should not block the queue longer than necessary

## Flow 1: first-time onboarding to first swipe

1. User opens app.
2. User sees the welcome screen with a short trust note.
3. User taps `Start cleaning`.
4. Native media permission dialog appears.
5. User grants permission.
6. App begins scanning photos immediately.
7. The queue appears as soon as the first card is ready.
8. Background scanning continues if needed.
9. User reaches the first swipe.

Expected UX:

- no separate source selection step
- no wall of text before the native permission prompt
- the queue feels alive even if scan is still running

## Flow 2: keep action

1. User sees preview card.
2. User swipes right or taps `Keep`.
3. Card shows green directional feedback.
4. Action records successfully.
5. Progress updates immediately.
6. Undo toast appears for a short window.
7. Queue advances to the next item.

Expected UX:

- response feels instant
- score ticks up cleanly
- undo does not break momentum

## Flow 3: delete action

1. User swipes left or taps `Delete`.
2. Card shows warning feedback.
3. Confirmation sheet appears.
4. User cancels or confirms.
5. On confirm, app attempts deletion.
6. On success, storage-freed score updates and queue advances.
7. On failure, user sees clear feedback and keeps control.

Expected UX:

- delete feels deliberate
- cancel fully restores the safe prior state
- failure never masquerades as success

## Flow 4: skip action

1. User taps `Skip` or uses the supported secondary gesture.
2. App records a non-destructive skip.
3. Queue advances.
4. Undo toast appears for a short window.

Expected UX:

- skip feels lightweight
- skipped item remains reviewable later

## Flow 5: open preview

1. User taps the current card.
2. App opens the larger preview.
3. User inspects metadata or image detail.
4. User returns to the queue.
5. The same file card remains active.

Expected UX:

- preview is exploratory, not final
- queue position remains intact

## Flow 6: undo recent action

1. User performs `Keep` or `Skip`.
2. Undo toast appears.
3. User taps `Undo` within the allowed window.
4. App restores the prior file state.
5. The prior card re-enters the queue cleanly.

Expected UX:

- undo feels reliable and quick
- counts and progress roll back correctly
- undo history remains shallow and understandable

## Flow 7: quick session completion

1. User starts or resumes `Quick 10`.
2. User reviews 10 photos.
3. App reaches the target count.
4. Summary screen appears with reviewed count and storage freed.
5. User chooses `Continue` or ends the session.

Expected UX:

- the finish line feels clear
- the summary feels rewarding
- continuing into the full queue is easy

## Flow 8: interrupted session and resume

1. User reviews files.
2. App goes to background or is closed.
3. User reopens app later.
4. Resume prompt appears if a session exists.
5. User resumes from the prior queue state.

Expected UX:

- no confusing reset
- reviewed counts remain stable
- resume feels trustworthy and fast

## Flow 9: re-scan and new file detection

1. User finishes part of the queue or a quick session.
2. New photos are added outside the app.
3. User triggers re-scan from settings or summary.
4. App compares the new scan to stored records.
5. New items appear in the pending queue.
6. Summary or queue state explains what changed.

Expected UX:

- already reviewed items should not reappear as new
- new items should feel additive, not disruptive

## Flow 10: permission revoked after prior use

1. User previously used the app successfully.
2. Permission is revoked in Android settings.
3. User reopens app or attempts re-scan.
4. App detects revoked access.
5. Affected actions are blocked gracefully.
6. Existing local state remains visible where safe.

Expected UX:

- no crash
- no fake empty queue
- clear recovery path back to settings or permission retry

## Flow 11: move as a later secondary action

1. User opens a long-press menu or overflow action from the current card.
2. User chooses `Move`.
3. Destination picker opens.
4. User confirms move.
5. App performs operation and returns clear success or failure.

Expected UX:

- move never competes with the core keep/delete loop
- move is explicit and slower by design
- failure keeps queue state safe

## Queue interactions in detail

### Suggested interaction mapping

- swipe right: `Keep`
- swipe left: `Delete`
- tap card: `Open preview`
- visible secondary control: `Skip`
- long-press or overflow: `Move` in later phases

### Gesture thresholds

- light drag: directional hint only
- medium drag: action label grows and background tint strengthens
- strong drag past threshold: release commits action intent
- cancelled drag: card springs back quickly

### Discovery behavior

- show subtle directional hints on the first 3 cards
- fade hints away after successful use
- keep explicit controls visible at all times

### Interaction safety

- repeated rapid taps disabled during in-flight operation
- loading state visible for slow operations
- queue advancement locked until result is known

## Empty and edge states

### No files found

- explain that scan completed
- invite re-scan later
- avoid implying an error if the library genuinely has no matching items

### Permission denied

- explain why access matters
- offer retry and system-settings path

### Operation failed

- keep file in safe state
- offer retry or return to queue
- preserve context and score integrity

### All files reviewed or goal reached

- show celebratory completion state
- provide summary
- offer continue or re-scan path

## UX anti-patterns to avoid

- separate source-selection flow in V1
- hidden destructive swipe with no confirmation
- five equal-weight action buttons on the queue
- silent failure
- endless spinner with no explanation
- gesture-only core interaction
- visually overloaded queue screen
