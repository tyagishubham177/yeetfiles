# YeetFiles Docs Index

This folder is the project source of truth for YeetFiles while the app is being shaped.

## Why this docs set exists

YeetFiles sounds simple, but its quality depends on getting a few first principles right:

- file cleanup must feel fast enough to start
- destructive actions must feel safe enough to trust
- the loop must feel rewarding enough to repeat
- Android capability limits must stay visible in product copy and architecture

These docs now reflect a tighter product stance: fewer gates, fewer core actions, stronger reward loops, and less early overengineering.

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
6. [../phase/README.md](D:/Coding%20Projects/Codex%20All/YeetFiles/phase/README.md)
7. [next-steps.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/next-steps.md)

### Quality and delivery

1. [testing.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/testing.md)
2. [manual-test-matrix.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/manual-test-matrix.md)
3. [repo-safety.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/repo-safety.md)
4. [codex-rules.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/codex-rules.md)
5. [agents.md](D:/Coding%20Projects/Codex%20All/YeetFiles/docs/agents.md)

## Glossary

- `YeetFiles`: the shared product and repository name
- `lane`: a future high-level content area such as photos or documents
- `photos lane`: the only user-facing lane in V1
- `bucket`: a lightweight category used for faster cleanup, such as screenshots, camera, or downloads
- `queue`: the ordered list of reviewable photos for the current session
- `Quick 10`: a short session mode that caps review at 10 items
- `Full queue`: the uncapped session mode
- `source`: an internal capability term, not primary user-facing language in V1

## Documents in this folder

- `product-brief.md`: concise product framing, scope, and success signals
- `product-requirements.md`: functional and non-functional requirements for the first build path
- `design.md`: first-principles UX principles and behavior guardrails
- `ui-design-overview.md`: visual system, motion, and component direction
- `screen-specs.md`: per-screen layout and state expectations
- `interaction-flows.md`: end-to-end user journey logic
- `technical-architecture.md`: app modules, data flow, and implementation stance
- `data-model.md`: minimal persisted shapes and transition rules
- `project-structure.md`: planned code layout for the initial build
- `phase-plan.md`: summary phase roadmap ordered by UX and trust impact
- `../phase/`: detailed per-phase playbooks with streams, gates, and exit criteria
- `testing.md`: test strategy and scenario coverage
- `manual-test-matrix.md`: practical device validation checklist
- `risk-register.md`: product, retention, and implementation risks
- `dev-workflow.md`: expected development and review workflow
- `api-notes.md`: Android and Expo capability notes
- `next-steps.md`: immediate implementation sequence
- `agents.md`: named project agent roles for future Codex use
- `codex-rules.md`: non-negotiable project rules
- `repo-safety.md`: repo safety baseline and branch hygiene

## Change discipline

- If product scope changes, update `product-brief.md` and `product-requirements.md`.
- If the core loop, action model, or reward model changes, update `design.md`, `screen-specs.md`, and `interaction-flows.md`.
- If persistence or state shape changes, update `technical-architecture.md`, `data-model.md`, and `project-structure.md`.
- If phase ordering changes, update `phase-plan.md`, the relevant file in `../phase/`, and `next-steps.md`.
- If wording changes create new product terms, update this glossary.
- Do not leave docs silently stale after a code change.
