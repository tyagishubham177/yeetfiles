# Phase 3: Scaling, Re-scan, and Re-engagement Foundations

## Goal

Make ongoing use reliable for medium and large libraries, and prepare gentle re-engagement without turning the app into a naggy utility.

## Stream 3A: Re-scan engine

| Task | Deliverable | Verification |
| --- | --- | --- |
| Re-scan trigger | Re-scan available from settings and summary | Trigger and verify completion |
| Delta detection | New files identified against prior scan | Add photos externally and re-scan |
| Reviewed-item protection | No reviewed items re-enter as duplicates | Re-scan after review and inspect queue |
| `New since last scan` affordance | Badge or indicator for new items | Verify on newly added photos |

## Stream 3B: Large-library optimization

| Task | Deliverable | Verification |
| --- | --- | --- |
| Scan batching | Fixed-size paginated scan, such as 100 assets at a time | Inspect memory and responsiveness |
| Lazy image loading | Only current and nearby cards decode eagerly | Memory profile while reviewing |
| Queue cursor model | Cursor and filter hash replace heavy full-order persistence when justified | Compare persistence size and hydration time |
| Smooth review at scale | Queue stays responsive for 1000+ items | Manual performance run |

## Stream 3C: Notifications and return loops

| Task | Deliverable | Verification |
| --- | --- | --- |
| Notification preference model | User controls for digests and storage alerts | Toggle and verify behavior |
| Low-storage trigger | Local prompt when device storage is low | Simulate threshold and verify |
| Weekly summary experiment | Low-volume return reminder | Verify schedule, frequency, and easy disable |

## Stream 3D: Night mode

| Task | Deliverable | Verification |
| --- | --- | --- |
| Ultra-dark visual variant | Darker queue stage and dimmer chrome | Dark-room visual review |
| Manual or automatic trigger | Settings toggle and optional auto behavior | Toggle and verify |
| Reduced-brightness celebrations | Gentler effects for low-light use | Trigger milestones in night mode |

## Bifurcations

## Persistence model

Stay simple if:

- queue hydration stays fast
- persisted state remains small
- action saves remain below budget

Migrate to cursor-first persistence if:

- large arrays become expensive to serialize
- hydration exceeds budget on real devices
- filter and sort changes feel heavy

## Notification posture

Conservative path:

- notifications off by default, except optional low-storage education after explicit permission

Experiment path:

- weekly summary on by default for a short onboarding window, with easy disable

Choose the experiment path only if early retention data suggests reminders help more than they annoy.

## Exit gate

Phase 3 is done when the app remains responsive on large libraries and re-scan behavior is trustworthy.

## Exit checklist

- re-scan identifies new files without duplicating reviewed items
- queue remains responsive on libraries around 2000 photos
- active review memory stays under the agreed ceiling on a mid-range device
- queue persistence still restores correctly after the cursor changes, if migrated
- any notification behavior stays factual, low-volume, and easy to disable
- night mode is comfortable for extended low-light use if it ships
