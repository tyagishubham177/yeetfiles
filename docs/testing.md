# YeetFiles Testing Strategy

## Testing philosophy

This app touches user files and trust-sensitive operations, but it also has to feel fast and satisfying enough to repeat. Testing must prioritize correctness, first-swipe speed, short-session usability, and recovery over polish for polish's sake.

## Testing priorities in order

1. No false success for destructive or move actions.
2. The first swipe happens quickly on a real Android phone.
3. Queue and session state survive interruptions.
4. Undo and progress counters stay internally consistent.
5. Reward and motion polish do not damage clarity.

## Test layers

## 1. Unit tests

Focus on pure logic.

Primary targets:

- queue ordering
- action reducer correctness
- stats calculation
- undo buffer behavior
- file status transitions
- bucket classification helpers
- sorting and filtering helpers
- quick-goal completion selectors

## 2. Integration tests

Focus on feature modules working together.

Primary targets:

- permission-gated scan boot
- scanner to queue pipeline
- delete result handling
- session resume logic
- summary calculation from stored state
- undo rollback of counts and queue state

## 3. Manual device tests

Focus on real Android behavior.

Primary targets:

- first-launch onboarding speed
- media permission prompts
- queue boot responsiveness
- image preview performance
- app background and foreground resume
- delete confirmation and failure handling
- large media library handling
- permission revoked after prior use

## 4. Regression checks

Run after every meaningful feature change.

Always re-check:

- permission flow works
- queue boots quickly
- queue restores after restart
- delete flow still reports truthfully
- storage-freed score remains accurate
- summary still matches persisted state

## Core testing scenarios

## Scenario A: first launch happy path

1. Install app.
2. Open app.
3. Tap `Start cleaning`.
4. Grant media access.
5. Confirm the queue appears quickly.
6. Review 10 photos.
7. Close app.
8. Reopen app.
9. Verify queue resumes correctly.

Expected:

- no crash
- first card appears quickly enough to feel responsive
- reviewed items stay reviewed
- pending count decreases correctly

## Scenario B: quick-session completion

1. Start `Quick 10`.
2. Review exactly 10 photos.
3. Reach the summary screen.
4. Choose `Continue`.

Expected:

- the goal boundary is clear
- summary stats are accurate
- continuing back into the queue is smooth

## Scenario C: permission denied path

1. Install app fresh.
2. Tap `Start cleaning`.
3. Deny media permission.

Expected:

- app does not crash
- app explains why permission is needed
- retry path is visible
- app does not show fake empty queue

## Scenario D: reversible action undo

1. Keep one photo.
2. Tap `Undo`.
3. Skip another photo.
4. Tap `Undo` again.

Expected:

- prior cards re-enter the queue correctly
- counts roll back correctly
- undo does not create duplicates

## Scenario E: delete safety

1. Attempt to delete a photo.
2. Cancel the system delete confirmation.
3. Attempt delete again and confirm.
4. Trigger a failure case if possible.

Expected:

- cancelling the system delete confirmation does not change status
- successful delete updates storage-freed score
- failed delete does not claim success

## Scenario F: interrupted session

1. Start reviewing files.
2. Background the app mid-session.
3. Force close app or let OS evict it.
4. Reopen app.

Expected:

- queue position restored
- action history remains correct
- no duplicate reprocessing of already reviewed files

## Scenario G: filter and sort behavior

1. Start a session.
2. Switch filters between `All`, `Screenshots`, and `Camera`.
3. Change sort mode if available.
4. Return to the default ordering.

Expected:

- active card and queue order remain understandable
- counts stay correct
- no missing or duplicated items appear

## Scenario H: large library stress

1. Use a device with a large photo library.
2. Start scan.
3. Confirm the first card still appears before the full scan ends.
4. Review quickly across many large images.

Expected:

- app remains responsive
- memory pressure does not crash app
- inline scan state stays honest
- queue continues functioning

## Scenario I: new files added after session start

1. Scan photos lane.
2. Review some items.
3. Add new photos to the gallery outside the app.
4. Run re-scan.

Expected:

- new items detected accurately
- already reviewed items are not duplicated
- queue and summary explain the difference cleanly

## Scenario J: local data reset

1. Use app for several sessions.
2. Go to settings.
3. Clear local app data.
4. Restart app.

Expected:

- prior session data removed
- onboarding shown again if intended
- no corrupted leftovers remain

## Scenario K: offline behavior

1. Put the phone in airplane mode.
2. Open app.
3. Continue the local review flow.

Expected:

- app works without network for local flows
- no unnecessary blocking spinners
- local persistence remains functional

## Test automation guidance

Early automation should focus on confidence-building logic, not flashy end-to-end scripts.

Best first automated targets:

- review engine
- status transitions
- undo behavior
- summary calculations
- permission gating selectors
- file-operation result reducers

## Device test matrix direction

### Minimum

- one real Android phone used as the primary test device
- one Android emulator for quick smoke checks

### Preferred

- Android 13 or newer phone
- Android 11 or 12 device if available
- one lower-RAM device if possible

## Test data recommendations

Create sample sets with:

- 20 photos for quick tests
- 100 to 200 photos for more realistic `Quick 10` and filter behavior
- 500 to 1000 mixed photos for performance checks
- screenshots, selfies, duplicates, blurry shots, and large images

## Release checklist before each milestone

- app installs cleanly
- permissions behave as expected
- queue appears quickly
- queue survives restart
- delete flow remains safe
- failed actions never report success
- storage-freed score is correct
- no obvious UI break on small screens
