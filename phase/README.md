# YeetFiles Phase Playbooks

These files turn the high-level roadmap into execution-ready phase guides. [docs/phase-plan.md](../docs/phase-plan.md) remains the summary roadmap. The `phase/` folder is where each phase gets its detailed streams, bifurcations, verification gates, and exit checks.

## Reading order

1. [docs/phase-plan.md](../docs/phase-plan.md)
2. [phase0.md](./phase0.md)
3. [phase1.md](./phase1.md)
4. [phase2.md](./phase2.md)
5. [phase3.md](./phase3.md)
6. [phase4.md](./phase4.md)
7. [phase5.md](./phase5.md)

## How to use these docs

- Start each phase by reading the prior phase's exit gate first.
- Do not begin Phase N+1 until Phase N passes on a real Android device.
- When a phase includes a bifurcation, default to the more conservative path unless evidence clearly supports the faster one.
- If implementation reality changes a gate, update both the phase file and [docs/phase-plan.md](../docs/phase-plan.md).

## Cross-cutting tracks

## Positioning and messaging

The product should be pitched around speed and outcome, not around the fact that V1 starts with photos.

Preferred framing:

- Swipe through your phone clutter in 60 seconds.
- Free storage without overthinking it.
- Clean up fast, safely, and locally.

Avoid leading with "photo cleanup" in user-facing launch messaging because that invites direct comparison with gallery apps instead of with the decision-speed experience.

## Local analytics schema

Capture local-only product learning from the start so retention and throughput decisions are based on evidence instead of guesswork.

```ts
export type AnalyticsEvent =
  | { event: 'session_start'; mode: 'quick10' | 'quick25' | 'quick50' | 'full_queue'; timestamp: string }
  | { event: 'first_swipe'; timeFromLaunchMs: number; timestamp: string }
  | { event: 'action'; action: 'keep' | 'delete' | 'skip'; fileId: string; durationMs: number; timestamp: string }
  | { event: 'undo'; originalAction: 'keep' | 'delete' | 'skip'; timestamp: string }
  | { event: 'filter_change'; from: string; to: string; timestamp: string }
  | { event: 'milestone_hit'; milestone: string; atCount: number; timestamp: string }
  | { event: 'session_end'; reviewedCount: number; deletedCount: number; storageFreedBytes: number; durationMs: number; timestamp: string };
```

No network sync is required in V1. Local export is enough.

## Accessibility baseline

These requirements should not wait until the end:

- every gesture action has a button equivalent
- TalkBack labels are present for card, actions, and summary stats
- motion can be reduced without breaking clarity
- haptics and sound are independently toggleable
- destructive copy remains understandable when read aloud by a screen reader

## Performance budget

| Metric | Target | How to measure |
| --- | --- | --- |
| Time to first swipe | < 5 seconds | Stopwatch from `Start cleaning` to first actionable card |
| Cold start | < 2 seconds | Device timing or `adb` startup measurement |
| Swipe animation FPS | > 55 FPS | Performance monitor on a mid-range Android device |
| Active review memory | < 250 MB by default, < 300 MB hard ceiling | Android Studio profiler |
| Persistence read/write | < 100 ms for normal action saves | Timestamp logs around persistence adapter |

## Strategic decision gates to revisit

- whether inline armed-delete beats sheet-based confirmation on short sessions
- fixed `Quick 10` versus adaptive quick-session targets like 10, 25, and 50
- oldest-first versus smart `most deletable first` ordering
- when to migrate from persisted queue arrays to a cursor model
- whether notifications improve return behavior enough to justify their complexity
- whether `YeetFiles` keeps testing well with real users before a public launch
