# FileSwipe Testing Strategy

## Testing philosophy

This app touches user files and trust-sensitive operations. Testing must prioritize correctness, safety, recovery, and permission handling over visual polish.

## Testing priorities in order

1. No false success for destructive or move actions.
2. Queue and session state survive interruptions.
3. Permission handling stays honest and recoverable.
4. Preview and scanning remain usable on real Android devices.
5. UI polish does not break core flows.

## Test layers

## 1. Unit tests

Focus on pure logic.

Primary targets:

- queue ordering
- action reducer correctness
- stats calculation
- file status transitions
- duplicate or fingerprint helper behavior
- sorting and filtering helpers
- derived selector logic

## 2. Integration tests

Focus on feature modules working together.

Primary targets:

- scanner to queue pipeline
- permission-gated feature behavior
- file operation result handling
- session resume logic
- summary calculation from stored state
- action log persistence

## 3. Manual device tests

Focus on real Android behavior.

Primary targets:

- permission prompts
- gallery scanning speed
- image preview performance
- app background and foreground resume
- interrupted actions
- large media library handling
- permission revoked after prior use

## 4. Regression checks

Run after every meaningful feature change.

Always re-check:

- scan works
- queue restores
- delete candidate flow still safe
- move still reports success or failure correctly
- summary metrics remain accurate

## Core testing scenarios

## Scenario A: first launch happy path

1. Install app.
2. Open app.
3. Grant media access.
4. Start photo scan.
5. App shows queue.
6. Swipe or tap through 10 photos.
7. Close app.
8. Reopen app.
9. Verify queue resumes correctly.

Expected:

- no crash
- reviewed items stay reviewed
- pending count decreases correctly

## Scenario B: permission denied path

1. Install app fresh.
2. Deny media permission.
3. Attempt to start cleanup.

Expected:

- app does not crash
- app explains why permission is needed
- retry path is visible
- app does not show fake empty queue

## Scenario C: permission revoked after prior use

1. Use app normally.
2. Revoke permission from Android settings.
3. Reopen app.
4. Attempt re-scan or preview.

Expected:

- app detects revoked permission
- app blocks affected features gracefully
- prior local state remains intact
- user is guided to recover access

## Scenario D: interrupted session

1. Start reviewing files.
2. Background app mid-session.
3. Force close app or let OS evict it.
4. Reopen app.

Expected:

- queue position restored
- action log remains correct
- no duplicate reprocessing of already reviewed files

## Scenario E: failed move operation

1. Pick a file to move.
2. Simulate or trigger move failure.
3. Return to queue.

Expected:

- action result is shown as failed
- file status does not falsely become moved
- retry path exists
- failure is recorded in action log

## Scenario F: delete candidate safety

1. Mark file for delete.
2. Cancel confirmation.
3. Verify item status.
4. Confirm deletion on another item.

Expected:

- cancel does not change item to deleted
- confirmed delete updates status correctly
- user gets visible confirmation
- deletion history entry is stored

## Scenario G: large library stress

1. Use device with large photo library.
2. Start scan.
3. Scroll and review quickly.
4. Trigger preview loads across many large images.

Expected:

- app remains responsive
- memory pressure does not crash app
- placeholders appear before previews load
- queue continues functioning

## Scenario H: new files added after session start

1. Scan media source.
2. Review some items.
3. Add new photos to gallery outside app.
4. Run re-scan.

Expected:

- new items detected accurately
- already reviewed items are not duplicated
- summary distinguishes new vs old pending items

## Scenario I: local data reset

1. Use app for several sessions.
2. Go to settings.
3. Clear local app data.
4. Restart app.

Expected:

- prior session data removed
- onboarding shown again if intended
- no corrupted leftovers remain

## Scenario J: offline behavior

1. Put phone in airplane mode.
2. Open app.
3. Continue local review flow.

Expected:

- app works without network for local flows
- no unnecessary blocking spinners
- local persistence remains functional

## Test automation guidance

Early automation should focus on pure confidence-building logic, not flashy end-to-end scripts.

Best first automated targets:

- queue engine
- status transitions
- summary calculations
- permission gating selectors
- file operation result reducers

## Device test matrix direction

### Minimum

- one real Android phone used as daily driver
- one Android emulator for quick smoke checks

### Preferred

- Android 13 or newer phone
- Android 11 or 12 device if available
- one lower-RAM device if possible

## Test data recommendations

Create sample sets with:

- 20 photos for quick tests
- 500 to 1000 mixed photos for performance checks
- screenshots, selfies, blurry images, duplicates, large images
- a few picked PDF, doc, and text files for future document-lane testing

## Release checklist before each milestone

- app installs cleanly
- permissions behave as expected
- queue survives restart
- delete flow remains safe
- failed actions never report success
- summary counts are correct
- no obvious UI break on small screens
