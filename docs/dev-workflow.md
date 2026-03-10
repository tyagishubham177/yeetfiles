# FileSwipe Development Workflow

## Purpose

This document defines how the project should move from docs-first planning into a working Expo app without losing clarity, trust, or product energy.

## Working style

- branch for every meaningful change
- keep pull requests focused
- prefer vertical slices over broad unfinished frameworks
- update docs when implementation changes assumptions
- verify important behavior on a real Android phone early
- treat first-swipe speed as part of feature quality, not post-hoc polish

## Branching rules

- branch from `main`
- use `codex/` branch names
- do not work directly on `main`
- prefer one milestone or coherent slice per branch

## Delivery rhythm

1. update the relevant docs for the slice
2. implement the smallest real version of the slice
3. run quick local checks
4. verify on device where the feature needs it
5. capture findings and update docs if reality differed

## Pull request expectations

A good PR for this repo should:

- solve one clear problem
- keep product scope honest
- note what was tested on device
- mention any remaining capability caveats
- state whether first-swipe speed or queue clarity changed
- leave docs aligned with code

## Environment priorities

- free or near-free local setup
- Android-first iteration path
- minimal dependency sprawl
- simple commands over complex build wrappers
- no infrastructure heavier than the current phase actually needs

## Verification rule

If a feature depends on native behavior or materially changes the core feel of the queue, it is not complete until it has been exercised on a real Android device.

## Documentation rule

Any change to scope, UX behavior, platform assumption, terminology, or test strategy should update the matching document in `docs/` during the same branch.

## Anti-patterns for workflow

- coding several phases ahead of the current proof point
- reintroducing setup screens or primary actions the docs removed
- adding persistence complexity before the simple adapter proves insufficient
- claiming delete or move support without verified result handling
- treating emulator-only success as milestone completion
