# FileSwipe Next Steps

## Immediate next milestone

Build the Phase 0 first-swipe prototype.

## Phase 0 scope

- welcome screen with inline trust note
- native media permission request
- photo scan that streams into the queue
- `Keep`, `Delete`, and `Skip`
- `Quick 10` mode
- live reviewed count and storage-freed score
- local persistence and restart resume

## Suggested implementation order

1. Set up the Expo and React Native app shell with TypeScript strict mode, Expo Router, and the initial theme tokens.
2. Build the welcome screen and wire `Start cleaning` straight into the permission request.
3. Implement a small media scan service that can stream normalized photo records into state.
4. Create the first `FileItem`, `ActionLog`, and `AppState` shapes plus a Zustand store with AsyncStorage persistence.
5. Build the queue screen with a single card, stacked depth hint, and button-based `Keep`, `Delete`, and `Skip`.
6. Add the delete confirmation sheet and live storage-freed updates.
7. Add `Quick 10`, summary handoff, and resume on restart.
8. Smoke test on emulator, then validate the full loop on a real Android device.

## Success criteria

- works on a real Android phone
- first swipe feels fast on a small real library
- UI feels mobile-first and visually alive
- queue state survives restart
- the core loop already feels simpler than using the gallery directly

## Decisions to keep open for now

- exact visual threshold for milestone celebrations
- exact bucket heuristics for `Screenshots`, `Camera`, and `Downloads`
- whether safe post-delete restore is possible on the target platform
- final navigation choice only if Expo Router creates real friction

## Verification checklist for the next pass

- confirm the app can request and recognize media permission
- confirm at least one real image can render as the first queue card quickly
- confirm `Keep`, `Delete`, and `Skip` update counts correctly
- confirm storage-freed score only changes after successful delete
- confirm denied permission does not show a fake empty queue
- confirm closing and reopening the app restores the queue state
