# FileSwipe

`FileSwipe` is the working product name for an Android-first cleanup app built as a native mobile experience with React Native and Expo.

This repository is still docs-first, but the direction is now much sharper: get the user to their first swipe fast, keep the core loop simple, and make progress feel rewarding without weakening trust.

## Current status

- Repo codename: `YeetFiles`
- Product working name: `FileSwipe`
- Branching model: work happens on `codex/` branches into `main`
- Current delivery target: Phase 0 first-swipe feasibility slice
- Primary platform: Android only

## What FileSwipe is trying to solve

Most cleanup apps feel like chores because they ask the user to think like a file manager. FileSwipe should feel closer to a short game loop:

- show one photo at a time
- offer two obvious primary actions: `Keep` or `Delete`
- leave `Skip` available without making it compete for attention
- show progress and storage freed as the score
- make every risky action explicit and honest

The first version stays photo-first on purpose. That keeps onboarding short, capability claims narrow, and the product energy focused on one believable loop.

## Product direction in one glance

- Onboarding collapses to `Welcome -> native permission -> queue`
- Source selection is removed from V1 because the only lane is photos
- Small scans should stream straight into the queue instead of stopping on a dedicated scan screen
- The queue uses two large thumb-friendly actions, with `Open` on card tap and `Move` demoted to a later secondary action
- The reward loop is now part of the product, not polish: reviewed count, storage freed, quick session goals, milestones, and a celebratory summary

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
12. [phase/README.md](D:/Coding%20Projects/Codex%20All/YeetFiles/phase/README.md)
13. [docs/testing.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/testing.md)
14. [docs/manual-test-matrix.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/manual-test-matrix.md)
15. [docs/risk-register.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/risk-register.md)
16. [docs/next-steps.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/next-steps.md)

## Non-negotiables

- Android-first only for now
- Native app approach, not a browser workaround
- Local-first persistence
- Honest permission handling
- No silent destructive actions
- No fake capability claims
- Real-device testing before calling a milestone done
- First swipe should happen fast on a small real photo library
- A working, fun vertical slice matters more than broad unfinished scope

## Near-term milestone

Phase 0 proves the product can deliver a believable first-swipe loop on a real Android phone:

- request photo/media permission from the welcome flow
- scan photos and stream results into the queue
- render a premium card stack UI
- support `Keep`, `Delete`, and `Skip`
- show live reviewed count and storage-freed progress
- persist local state and restore the queue after restart

## Repo rule of thumb

If implementation changes a product, UX, or trust assumption, update the matching document in the same branch before calling the work complete.
