# Phase 5: Careful Lane Expansion

## Goal

Extend beyond the photos lane only after the photo loop feels excellent, honest, and resilient.

## Stream 5A: Document-lane discovery

| Task | Deliverable | Verification |
| --- | --- | --- |
| Capability audit | Honest document-lane capability matrix | Review against target Android devices |
| Entry copy and expectations | Separate user-facing explanation for document scope | Copy review against real behavior |
| Limited preview and action prototypes | Document preview and a safe subset of actions | Manual device validation |

## Stream 5B: Lane architecture hardening

| Task | Deliverable | Verification |
| --- | --- | --- |
| Lane-aware state model | Multiple lanes without polluting photo simplicity | Regression test photos lane |
| Lane-specific testing matrix | Photos and documents tested independently | Scenario coverage review |
| Lane-specific risk register updates | Risks documented without hand-waving | Docs review |

## Stream 5C: Pre-launch product polish

| Task | Deliverable | Verification |
| --- | --- | --- |
| Name checkpoint | Validate that `YeetFiles` still fits the product best | Lightweight user name test |
| Delete-friction checkpoint | Replace the repeat delete sheet with a deliberate lower-friction confirm pattern | Real-device short-session validation |
| Store-message checkpoint | Launch copy centers speed and outcome, not file-type breadth | Copy review with non-developers |
| Trust audit | Final review of delete, undo, and capability claims | Full docs and product walkthrough |

## Exit gate

Phase 5 is done when a second lane can be described honestly without weakening the clarity or trust of the original photos loop.

## Exit checklist

- document-lane copy never implies broad unrestricted storage access
- photo-lane simplicity is preserved after multi-lane changes
- testing and risk docs treat each lane separately where needed
- branding and store messaging have been sanity-checked with real people before launch
