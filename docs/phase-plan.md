# YeetFiles Phase Plan

## Planning principle

The project should grow by proving one trustworthy and satisfying slice at a time. Every later phase depends on the earlier phase feeling real on a physical Android device, not just plausible in code.

Detailed execution playbooks now live in [../phase/README.md](D:/Coding%20Projects/Codex%20All/YeetFiles/phase/README.md). Use this file as the summary roadmap and the `phase/` folder for stream-level planning, bifurcations, and verification gates.

## Phase 0: first-swipe feasibility

### Goal

Prove that YeetFiles can deliver a fast, understandable, rewarding first loop on a real Android phone.

### Scope

- welcome screen with inline trust note
- native photo permission request
- photo scan that streams into the queue
- `Keep`, `Delete`, and `Skip`
- `Quick 10` session mode
- live reviewed count and storage-freed score
- local persistence and restart resume

### Exit criteria

- runs on a real Android device
- first swipe happens quickly on a small real photo library
- the app does not need a dedicated scan screen for trivial scans
- delete confirmation is clear and safe
- queue persists after restart

### Reject criteria

Stop expanding scope if:

- onboarding still feels like setup, not momentum
- the queue is visually or cognitively overloaded
- queue restore is unreliable
- delete behavior is unclear or flaky
- the app only feels convincing in emulator but not on phone

## Phase 1: trust and reward vertical slice

### Goal

Turn the Phase 0 feasibility loop into a short-session product people would plausibly want to repeat.

### Scope

- undo buffer for reversible actions
- progress ring and improved score header
- milestone banners and summary victory screen
- gesture hints for first-time users
- filter chips
- haptics and motion tuning

### Exit criteria

- `Quick 10` feels complete and satisfying
- undo is reliable for safe actions
- reward effects add energy without reducing clarity
- filters increase decision speed without breaking queue trust

## Phase 2: deeper review controls

### Goal

Add slower, more precise secondary actions without weakening the primary loop.

### Scope

- move from long-press or overflow
- richer full preview
- additional sort modes
- stronger settings and diagnostics surfaces

### Exit criteria

- move never competes with the keep/delete loop
- preview return preserves queue context
- sort changes remain stable and understandable

## Phase 3: scaling and re-scan

### Goal

Make ongoing use more reliable for medium and large libraries.

### Scope

- re-scan photos lane
- detect new files since last snapshot
- better batching of large libraries
- refined resume behavior after interruptions
- optional night-session polish

### Exit criteria

- reviewed items do not duplicate after re-scan
- new files are highlighted accurately
- queue remains responsive on larger libraries
- low-light usage feels comfortable if night mode ships

## Phase 4: smarter cleanup moments

### Goal

Increase decision speed without turning the app into a black box.

### Scope

- comparison view for similar photos
- large-file bucket
- smarter summary and share-card output
- cosmetic rewards that do not affect trust

### Exit criteria

- comparison view genuinely speeds up hard decisions
- smart buckets feel helpful, not pushy
- summaries strengthen retention without overclaiming impact

## Phase 5: careful lane expansion

### Goal

Extend beyond photos only after the photo loop feels excellent and honest.

### Scope

- explicit document-lane exploration
- separate capability copy for documents
- document preview and limited actions where proven safe

### Exit criteria

- document lane does not inherit false assumptions from photos
- capability limits remain clear in UI and docs

## Phase ordering rule

Do not start the next phase just because code exists. Start the next phase when the previous phase is stable on a real Android device and its main trust and retention risks are understood.
