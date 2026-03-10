# FileSwipe Planned Project Structure

## Purpose

This structure is designed for a React Native and Expo codebase that stays easy to reason about while the app grows from a narrow photo-cleanup slice into a broader cleanup tool.

## Guiding principles

- keep routing shallow and explicit
- keep domain logic out of screen files
- optimize for the photos queue first
- isolate native capability checks from UI behavior
- avoid database-first complexity before it is needed
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
|   `-- repo-safety.md
|-- app/
|   |-- _layout.tsx
|   |-- index.tsx
|   |-- queue/
|   |   `-- index.tsx
|   |-- summary/
|   |   `-- index.tsx
|   `-- settings/
|       `-- index.tsx
|-- src/
|   |-- components/
|   |   |-- review/
|   |   |   |-- file-card.tsx
|   |   |   |-- action-dock.tsx
|   |   |   |-- progress-header.tsx
|   |   |   `-- filter-chip-row.tsx
|   |   |-- feedback/
|   |   |   |-- action-toast.tsx
|   |   |   |-- milestone-banner.tsx
|   |   |   `-- empty-state.tsx
|   |   `-- ui/
|   |       |-- button.tsx
|   |       |-- progress-ring.tsx
|   |       `-- sheet.tsx
|   |-- features/
|   |   |-- permissions/
|   |   |   `-- permission-service.ts
|   |   |-- scanner/
|   |   |   |-- media-scan-service.ts
|   |   |   `-- bucket-classifier.ts
|   |   |-- review/
|   |   |   |-- review-engine.ts
|   |   |   |-- review-selectors.ts
|   |   |   `-- undo-buffer.ts
|   |   |-- rewards/
|   |   |   `-- session-stats.ts
|   |   |-- preview/
|   |   |   `-- preview-service.ts
|   |   |-- file-ops/
|   |   |   |-- delete-service.ts
|   |   |   `-- move-service.ts
|   |   `-- settings/
|   |       `-- settings-service.ts
|   |-- store/
|   |   `-- app-store.ts
|   |-- persistence/
|   |   |-- storage-adapter.ts
|   |   |-- async-storage.ts
|   |   `-- migrations.ts
|   |-- hooks/
|   |   |-- use-queue-session.ts
|   |   |-- use-review-actions.ts
|   |   `-- use-scan-bootstrap.ts
|   |-- lib/
|   |   |-- errors.ts
|   |   |-- result.ts
|   |   `-- time.ts
|   |-- types/
|   |   |-- file-item.ts
|   |   |-- action-log.ts
|   |   `-- app-state.ts
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

Route files and screen entry points only. These files should compose hooks, selectors, and view components rather than contain business logic.

## `src/components/`

Reusable visual building blocks. Keep them focused on rendering and interaction, not storage or native API decisions.

## `src/features/`

Feature-owned domain modules. This is where permission checks, scanning, review logic, rewards, preview handling, and file operations should live.

## `src/store/`

Thin app state layer. Keep mutations small, predictable, and selector-friendly.

## `src/persistence/`

Owns durable local storage behind a narrow adapter. Start simple with AsyncStorage and leave room for a later swap if needed.

## `src/lib/`

Cross-cutting utilities and typed result helpers. Good place for error normalization and shared helpers.

## `src/types/`

Source-of-truth type declarations for domain entities and persisted state.

## `tests/`

Keeps pure logic tests, integration tests, and shared fixtures separated by purpose.

## `scripts/`

Focused local tooling such as seeding test media or exporting logs. No random one-off scripts without repeated use.

## Structure rules

- do not put scan logic inside screen components
- do not let UI components call native modules directly
- do not add a database layer before the adapter boundary proves insufficient
- do not duplicate status or result types across modules
- prefer feature-local files before inventing another global layer

## Naming conventions

- screens: noun-oriented route names such as `queue`, `summary`, `settings`
- services: `<capability>-service.ts`
- selectors: `<feature>-selectors.ts`
- state helpers: `<feature>-engine.ts` or `<feature>-stats.ts`
- types: one domain topic per file where practical

## What not to add too early

- generalized multi-lane source systems
- SQLite repositories before AsyncStorage is clearly insufficient
- complex abstraction around navigation
- always-on analytics-like event systems
- power-user move workflows in the primary queue UI
