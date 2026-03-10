# FileSwipe Phase Plan

## Planning principle

The project should grow by proving one trustworthy slice at a time. Every later phase depends on the earlier phase being real on a physical Android device, not just convincing in code.

## Phase 0: feasibility spike

### Goal

Prove the platform path with the smallest believable Android-native review loop.

### Scope

- request photo/media permission
- index a small media set
- show image cards
- support `Keep` and `Skip`
- persist state locally
- survive app restart

### Exit criteria

- runs on a real Android device
- queue persists after restart
- image previews are smooth enough for real use
- no fake assumptions about unsupported storage access remain

### Reject criteria

Stop expanding scope if:

- permission handling is flaky
- queue restore is unreliable
- preview performance is visibly poor
- the app only works convincingly in emulator but not on phone

## Phase 1: photo review vertical slice

### Goal

Turn the Phase 0 spike into a coherent photo review experience.

### Scope

- main swipe queue
- action buttons
- progress ring or bar
- summary screen
- delete candidate flow
- action log

### Exit criteria

- delete candidate flow is clearly safe
- reviewed and pending counts stay accurate
- session summary matches stored state

## Phase 2: move flow

### Goal

Add practical file organization behavior without losing trust.

### Scope

- target destination selection
- move operation handling
- failed-operation UI
- recent destination shortcuts

### Exit criteria

- move success and failure are both surfaced clearly
- app never marks files as moved when move failed
- destination choice remains understandable on phone screens

## Phase 3: better scanning and resume

### Goal

Make ongoing use more reliable for medium and large libraries.

### Scope

- re-scan media source
- detect new files since last snapshot
- stable ordering rules
- better batching of large libraries

### Exit criteria

- reviewed items do not duplicate after re-scan
- new files are highlighted accurately
- scan behavior remains responsive on larger libraries

## Phase 4: documents lane

### Goal

Extend the product carefully into user-selected document flows.

### Scope

- picked docs flow
- doc metadata cards
- open file action
- limited document move/delete support where capability is proven

### Exit criteria

- document lane copy honestly reflects limited scope
- doc actions do not inherit unsafe assumptions from media lane

## Phase 5: polish

### Goal

Improve delight, speed, and clarity without changing the trust model.

### Scope

- smoother animations
- haptics
- milestones and streaks
- advanced filters
- stronger empty states and onboarding

### Exit criteria

- polish does not reduce clarity
- motion still feels controlled
- delight remains secondary to reliability

## Phase ordering rule

Do not start the next phase just because code exists. Start the next phase when the previous phase is stable on a real Android device and its main failure paths are understood.
