# FileSwipe

`FileSwipe` is the working product name for an Android-first file sorting app built as a native mobile experience with React Native and Expo.

This repository is starting in a docs-first mode. The current goal is not to rush into code, but to lock down a realistic product, UX, architecture, testing, and delivery plan for a trustworthy local-first cleanup app.

## Current status

- Repo codename: `YeetFiles`
- Product working name: `FileSwipe`
- Branching model: work happens on feature branches into `main`
- Current delivery target: Phase 0 feasibility spike
- Primary platform: Android only

## What FileSwipe is trying to solve

Most personal file cleanup tools feel technical, risky, or exhausting. FileSwipe turns cleanup into a fast review loop:

- show one file at a time
- make the next safe action obvious
- keep progress visible
- preserve trust around file operations

The app starts with photos because they are the highest-value, most testable Android-native lane.

## Documentation map

Start here:

1. [docs/README.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/README.md)
2. [docs/product-brief.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/product-brief.md)
3. [docs/product-requirements.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/product-requirements.md)
4. [docs/design.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/design.md)
5. [docs/ui-design-overview.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/ui-design-overview.md)
6. [docs/screen-specs.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/screen-specs.md)
7. [docs/interaction-flows.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/interaction-flows.md)
8. [docs/technical-architecture.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/technical-architecture.md)
9. [docs/data-model.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/data-model.md)
10. [docs/project-structure.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/project-structure.md)
11. [docs/phase-plan.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/phase-plan.md)
12. [docs/testing.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/testing.md)
13. [docs/manual-test-matrix.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/manual-test-matrix.md)
14. [docs/risk-register.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/risk-register.md)
15. [docs/next-steps.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/next-steps.md)

## Non-negotiables

- Android-first only for now
- Native app approach, not a browser workaround
- Local-first persistence
- Honest permission handling
- No silent destructive actions
- Real-device testing before claiming milestone completion
- Working vertical slice before broad feature sprawl

## Near-term milestone

Phase 0 proves the platform path with a real Android loop:

- request photo/media permission
- scan a small photo set
- render a queue card UI
- support `Keep` and `Skip`
- persist local state
- restore queue after app restart

## Repo rule of thumb

If implementation changes an assumption in the docs, update the relevant document in the same branch before calling the work complete.
