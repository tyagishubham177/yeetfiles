# FileSwipe Codex Rules

## Non-negotiable build rules

- Android-first only
- Do not assume web APIs.
- Do not fake file access capabilities.
- Do not claim a move or delete succeeded unless verified.
- Keep modules small and composable.
- Keep docs current with implementation.
- Prefer a working vertical slice over broad half-built systems.

## Delivery rule

Ship the smallest real loop first:

1. scan supported photos
2. create queue
3. review cards
4. persist status locally
5. resume after restart

## Dangerous assumptions to avoid

- broad storage access is not guaranteed
- permission granted once does not mean every flow will always work
- delete semantics may differ by source
- large media sets can cause performance and memory issues
- cloud or emulator testing is not a substitute for real device testing

## Review rule

When reviewing changes, prioritize:

- user trust
- correctness of status transitions
- safety of destructive flows
- resume reliability
- honesty of capability claims

## Documentation rule

If implementation changes assumptions, update the matching docs in the same branch before calling the work done.
