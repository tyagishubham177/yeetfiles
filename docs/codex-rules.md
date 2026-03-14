# YeetFiles Codex Rules

## Non-negotiable build rules

- Android-first only
- Do not assume web APIs.
- Do not fake file access capabilities.
- Do not claim a move or delete succeeded unless verified.
- Keep modules small and composable.
- Keep docs current with implementation.
- Prefer a working vertical slice over broad half-built systems.
- Protect first-swipe speed and queue clarity.

## Delivery rule

Ship the smallest real loop first:

1. welcome screen
2. permission grant
3. streaming photo queue
4. `Keep`, `Delete`, and `Skip`
5. live progress and storage score
6. local persistence and resume

## Dangerous assumptions to avoid

- broad storage access is not guaranteed
- permission granted once does not mean every flow will always work
- delete undo is not safe to promise by default
- five primary actions will fit a swipe queue gracefully
- large media sets can cause performance and memory issues
- emulator success is not a substitute for real-device testing

## Review rule

When reviewing changes, prioritize:

- user trust
- correctness of status transitions
- safety of destructive flows
- speed to first meaningful action
- resume reliability
- honesty of capability claims

## Documentation rule

If implementation changes assumptions, update the matching docs in the same branch before calling the work done.
