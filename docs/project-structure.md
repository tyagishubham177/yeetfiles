# FileSwipe Planned Project Structure

## Purpose

This structure is designed for a React Native and Expo codebase that stays easy to reason about while the app grows from a narrow photo-cleanup slice into a broader cleanup tool.

## Guiding principles

- keep app routing shallow and explicit
- keep domain logic out of screen files
- separate capability checks from UI behavior
- isolate file operations behind typed interfaces
- preserve room for testing and docs updates from day one

## Planned repository tree

```text
.
|-- README.md
|-- docs/
|   |-- README.md
|   |-- product-brief.md
|   |-- product-requirements.md
|   |-- design.md
|   |-- ui-design-overview.md
|   |-- screen-specs.md
|   |-- interaction-flows.md
|   |-- technical-architecture.md
|   |-- data-model.md
|   |-- api-notes.md
|   |-- project-structure.md
|   |-- phase-plan.md
|   |-- testing.md
|   |-- manual-test-matrix.md
|   |-- risk-register.md
|   |-- dev-workflow.md
|   |-- next-steps.md
|   |-- agents.md
|   |-- codex-rules.md
|   |-- repo-safety.md
|-- app/
|   |-- _layout.tsx
|   |-- index.tsx
|   |-- onboarding/
|   |   `-- permissions.tsx
|   |-- queue/
|   |   `-- index.tsx
|   |-- move/
|   |   `-- index.tsx
|   |-- summary/
|   |   `-- index.tsx
|   `-- settings/
|       `-- index.tsx
|-- src/
|   |-- components/
|   |   |-- cards/
|   |   |   `-- file-card.tsx
|   |   |-- feedback/
|   |   |   |-- action-toast.tsx
|   |   |   `-- empty-state.tsx
|   |   `-- ui/
|   |       |-- button.tsx
|   |       |-- progress-ring.tsx
|   |       `-- stat-chip.tsx
|   |-- features/
|   |   |-- permissions/
|   |   |   |-- permission-service.ts
|   |   |   `-- permission-selectors.ts
|   |   |-- scanner/
|   |   |   |-- media-scan-service.ts
|   |   |   `-- scan-normalizers.ts
|   |   |-- queue/
|   |   |   |-- queue-engine.ts
|   |   |   `-- queue-selectors.ts
|   |   |-- preview/
|   |   |   `-- preview-service.ts
|   |   |-- file-ops/
|   |   |   |-- delete-service.ts
|   |   |   |-- move-service.ts
|   |   |   `-- open-service.ts
|   |   |-- dashboard/
|   |   |   `-- summary-selectors.ts
|   |   `-- settings/
|   |       `-- settings-service.ts
|   |-- store/
|   |   |-- app-store.ts
|   |   |-- queue-store.ts
|   |   `-- settings-store.ts
|   |-- db/
|   |   |-- client.ts
|   |   |-- migrations.ts
|   |   `-- repositories/
|   |       |-- action-log-repository.ts
|   |       |-- file-item-repository.ts
|   |       `-- session-repository.ts
|   |-- hooks/
|   |   |-- use-current-file.ts
|   |   |-- use-permission-gate.ts
|   |   `-- use-review-actions.ts
|   |-- lib/
|   |   |-- errors.ts
|   |   |-- result.ts
|   |   `-- time.ts
|   |-- types/
|   |   |-- file-item.ts
|   |   |-- file-ops.ts
|   |   |-- session.ts
|   |   `-- source.ts
|   `-- constants/
|       |-- actions.ts
|       |-- routes.ts
|       `-- ui-tokens.ts
|-- tests/
|   |-- unit/
|   |-- integration/
|   `-- fixtures/
|-- scripts/
|   |-- seed-test-media/
|   `-- export-debug-log/
|-- assets/
|   |-- fonts/
|   |-- icons/
|   `-- illustrations/
`-- .github/
    `-- workflows/
```

## Directory responsibilities

## `app/`

Holds route files and screen entry points only. These files should compose hooks, selectors, and view components rather than contain business logic.

## `src/components/`

Reusable visual building blocks. Keep them focused on rendering and interaction, not storage or file-system decisions.

## `src/features/`

Feature-owned domain modules. This is where permission checks, scanning, queue logic, and file operations should live.

## `src/store/`

Thin app state layer. Keep state mutations small and predictable. Persist through dedicated storage adapters rather than ad hoc component effects.

## `src/db/`

Owns local persistence. Repositories provide a stable interface for saving sessions, files, and action logs.

## `src/lib/`

Cross-cutting utilities and typed result helpers. Good place for error normalization and shared data helpers.

## `src/types/`

Source-of-truth type declarations for domain entities and operation results.

## `tests/`

Keeps pure logic tests, integration tests, and shared fixtures close but separated by purpose.

## `scripts/`

Holds focused tooling for local workflows, such as seeding media or exporting logs. No random one-off scripts without a clear repeated use.

## Structure rules

- do not put scanning logic inside screen components
- do not let UI components call native modules directly
- do not duplicate status or result types across modules
- do not create broad `utils` dumping grounds
- prefer feature-local files before inventing another global layer

## Naming conventions

- screens: noun-oriented route names such as `queue`, `summary`, `settings`
- services: `<capability>-service.ts`
- selectors: `<feature>-selectors.ts`
- repositories: `<entity>-repository.ts`
- types: one domain topic per file where practical

## What not to add too early

- generalized plugin systems
- multiple state libraries
- complex abstraction around navigation
- premature cross-platform directories
- cloud service folders before cloud scope exists
