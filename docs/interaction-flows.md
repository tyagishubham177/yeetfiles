# FileSwipe Interaction Flows

## Interaction model

The app supports both gesture-first and tap-first usage. Gesture users get speed. Tap users get precision. Neither group should feel like a second-class user.

## Global interaction rules

- every file action must be reversible when safe
- every destructive action must be confirmed or clearly staged
- user should always know what happened after an action
- app should never jump screens unexpectedly mid-review
- queue should not advance until action result is known

## Flow 1: first-time onboarding to first swipe

1. User opens app.
2. User sees welcome screen.
3. User taps `Start cleanup`.
4. User lands on permission and source screen.
5. User grants media permission.
6. App scans the supported source.
7. Scan state shows live progress.
8. User enters queue on the first file card.

Expected UX:

- first meaningful action should happen within seconds on a small media set
- no long walls of text
- scanning should feel alive, not frozen

## Flow 2: keep action

1. User sees preview card.
2. User swipes right or taps `Keep`.
3. Card shows green directional feedback.
4. Action records successfully.
5. Queue advances to next item.
6. Progress updates immediately.

Expected UX:

- response feels instant
- no confirmation modal
- toast only if useful

## Flow 3: skip action

1. User sees preview card.
2. User swipes down or taps `Skip` if supported in current iteration.
3. App records a non-destructive skip.
4. Queue advances.

Expected UX:

- skip feels lightweight
- skipped item remains safely reviewable later

## Flow 4: delete candidate

1. User swipes left or taps `Delete`.
2. Card shows warning feedback.
3. Confirmation sheet appears.
4. User cancels or confirms.
5. On confirm, app attempts deletion.
6. On success, queue advances and history updates.
7. On failure, user sees clear feedback and retains control.

Expected UX:

- delete feels protected from accidental loss
- cancel fully restores prior safe state
- failure never masquerades as success

## Flow 5: move file

1. User taps `Move` or swipes up if enabled.
2. Destination picker opens.
3. User chooses recent or browses destination.
4. User confirms move.
5. App performs operation.
6. Success or failure feedback appears.
7. On success, queue advances.
8. On failure, retry or skip path is visible.

Expected UX:

- move can take longer than keep
- destination context should be obvious
- the user should never feel trapped in the move flow

## Flow 6: open file

1. User taps `Open`.
2. App opens preview or native handler where possible.
3. User returns to app.
4. The same file card remains active until a review action is chosen.

Expected UX:

- open is exploratory, not final
- queue position remains intact

## Flow 7: interrupted session and resume

1. User reviews files.
2. App goes to background or is closed.
3. User reopens app later.
4. Resume prompt appears if a session exists.
5. User resumes from prior queue state.

Expected UX:

- no confusing reset
- reviewed counts remain stable
- resume feels trustworthy and fast

## Flow 8: re-scan and new file detection

1. User finishes part of the queue.
2. New photos are added outside the app.
3. User taps `Re-scan`.
4. App compares current scan with stored snapshot.
5. New items appear in pending state.
6. Summary highlights newly found files.

Expected UX:

- already reviewed items should not reappear as new
- changes should be explained simply

## Flow 9: permission revoked after prior use

1. User previously used the app successfully.
2. Permission is revoked in Android settings.
3. User reopens app or attempts a re-scan.
4. App detects revoked access.
5. Affected actions are blocked gracefully.
6. Existing local state remains visible where safe.

Expected UX:

- no crash
- no fake empty queue
- clear recovery path back to settings or permission retry

## Queue interactions in detail

### Suggested swipe mapping

- right: `Keep`
- left: `Delete candidate`
- up: `Move`
- down: `Skip`, only if it tests well

### Gesture thresholds

- light drag: directional hint only
- medium drag: action label grows more prominent
- strong drag past threshold: release commits action
- cancelled drag: card springs back

### Interaction safety

- repeated rapid taps disabled during in-flight operation
- loading state visible for slow operations
- queue advancement locked until result is known

## Empty and edge states

### No files found

- explain that scan completed
- offer re-scan and source change
- avoid implying an error if scan genuinely found nothing

### Permission denied

- explain why access matters
- offer retry and system settings path

### Operation failed

- keep file in safe state
- offer retry or skip
- preserve context

### All files reviewed

- show success state
- provide summary
- offer re-scan

## UX anti-patterns to avoid

- hidden destructive swipe with no confirmation
- tiny icon-only core controls
- silent failure
- endless spinner with no explanation
- gesture-only core interaction
- visually overloaded queue screen
