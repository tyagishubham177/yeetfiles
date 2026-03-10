# FileSwipe Docs Index

This folder is the project source of truth for FileSwipe while the app is still being shaped.

## Why this docs set exists

The product sounds simple on the surface, but it sits in a risky space:

- it touches user files
- it depends on Android permissions and platform limits
- it can lose trust fast if move/delete behavior is unclear
- it needs a satisfying UX without pretending unsupported capabilities exist

Because of that, the project is starting with a detailed written blueprint before the codebase grows.

## Reading order

### Product direction

1. [product-brief.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/product-brief.md)
2. [product-requirements.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/product-requirements.md)
3. [risk-register.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/risk-register.md)

### Experience design

1. [design.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/design.md)
2. [ui-design-overview.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/ui-design-overview.md)
3. [screen-specs.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/screen-specs.md)
4. [interaction-flows.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/interaction-flows.md)

### Implementation planning

1. [technical-architecture.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/technical-architecture.md)
2. [data-model.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/data-model.md)
3. [api-notes.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/api-notes.md)
4. [project-structure.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/project-structure.md)
5. [phase-plan.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/phase-plan.md)
6. [next-steps.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/next-steps.md)

### Quality and delivery

1. [testing.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/testing.md)
2. [manual-test-matrix.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/manual-test-matrix.md)
3. [repo-safety.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/repo-safety.md)
4. [codex-rules.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/codex-rules.md)
5. [agents.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/agents.md)

## Documents in this folder

- `product-brief.md`: concise business and user framing
- `product-requirements.md`: functional and non-functional requirements
- `design.md`: product principles and behavior guardrails
- `ui-design-overview.md`: visual direction and component language
- `screen-specs.md`: per-screen layout and state expectations
- `interaction-flows.md`: end-to-end user journey logic
- `technical-architecture.md`: app modules, data flow, and engineering stance
- `data-model.md`: entity definitions and status transitions
- `project-structure.md`: planned code and docs layout
- `phase-plan.md`: phased delivery roadmap
- `testing.md`: testing philosophy and scenario coverage
- `manual-test-matrix.md`: practical device test checklist
- `risk-register.md`: product and implementation risks
- `dev-workflow.md`: expected development and review workflow
- `api-notes.md`: Android and Expo capability notes
- `next-steps.md`: immediate implementation sequence
- `agents.md`: named project agent roles for future Codex use
- `codex-rules.md`: non-negotiable project rules
- `repo-safety.md`: repo safety baseline and branch hygiene

## Change discipline

- If product scope changes, update `product-brief.md` and `product-requirements.md`.
- If UX behavior changes, update `screen-specs.md` or `interaction-flows.md`.
- If implementation assumptions change, update `technical-architecture.md`, `data-model.md`, or `api-notes.md`.
- If milestone scope shifts, update `phase-plan.md` and `next-steps.md`.
- Do not leave docs silently stale after a code change.
