# FileSwipe Next Steps

## Immediate next milestone

Build the Phase 0 prototype.

## Phase 0 scope

- request media permission
- index a small photo set
- show a queue card UI
- support `Keep` and `Skip`
- store progress locally
- restore session after restart

## Suggested implementation order

1. Set up the Expo and React Native app shell with TypeScript strict mode.
2. Create the permission gate and a basic onboarding entry flow.
3. Implement a small media scan service for supported photo access.
4. Normalize scan results into the first `FileItem` shape.
5. Build the queue screen with one image card and button-based `Keep` and `Skip`.
6. Add local persistence for queue position and item status.
7. Restore the session on restart and expose `Resume session`.
8. Smoke test on emulator, then validate on a real Android device.

## Success criteria

- works on a real Android phone
- no USB required for day-to-day iteration after setup
- UI feels mobile-first
- queue state survives restart
- project is ready for Codex-driven expansion

## Decisions to keep open for now

- final navigation choice between Expo Router and React Navigation
- final persistence library details if SQLite setup friction is high
- final gesture implementation details before queue UI exists

## Verification checklist for the next pass

- confirm the app can request and recognize media permission
- confirm at least one real image can render as the queue card
- confirm `Keep` and `Skip` update counts and survive restart
- confirm denied permission does not show a fake empty queue
