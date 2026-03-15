# YeetFiles Improvement Playbooks

These files turn the current bug list, UX critiques, and expansion ideas into implementation-ready work batches. The `phase/` folder remains the product roadmap. The `Improv/` folder is where we group concrete improvements in a way that reduces unnecessary Android development builds.

## Reading order

1. [improv1-native-and-foundations.md](./improv1-native-and-foundations.md)
2. [improv2-queue-and-persistence.md](./improv2-queue-and-persistence.md)
3. [improv3-ux-and-expansion.md](./improv3-ux-and-expansion.md)

## How to use these docs

- Start with `improv1` if a change touches native code, Expo config, permissions, or store architecture.
- Batch every native-touching change into one implementation pass so `npm run dev:android:eas` is only used when strictly necessary.
- Treat `improv2` and `improv3` as mostly JS and UI passes that should ride on top of an already-working dev build.
- If one improvement changes product behavior, update the matching docs in `docs/` and `phase/` before closing the work.

## Batching rule for Android rebuild cost

Use this default batching model:

- Batch A: native module and app-config changes that require a fresh development build
- Batch B: store, queue, persistence, analytics, and scanning changes that should stay JS-only if possible
- Batch C: visual polish, onboarding, card-stack UX, and screen layout changes

Do not trigger a new Android development build for pure TypeScript, styling, or routing work unless the implementation proves otherwise.

## Outcome target

The improvement track should make YeetFiles:

- more trustworthy across app restarts
- faster to review without re-tagging old files
- clearer in dark and night mode
- more rewarding through visible progress, history, and stats
- better structured for future lanes without prematurely broadening scope
