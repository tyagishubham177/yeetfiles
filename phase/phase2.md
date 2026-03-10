# Phase 2: Deeper Controls and Preview

## Goal

Add precision tools without weakening the primary swipe loop.

## Stream 2A: Full preview

| Task | Deliverable | Verification |
| --- | --- | --- |
| Full-screen preview | Card tap opens a larger photo view | Tap current card and verify preview |
| Metadata detail | Date, dimensions, size, and path context | Compare with underlying file data |
| Pinch-to-zoom | Basic zoom and pan support | Manual gesture test |
| Preview return | Same queue card remains active on exit | Open and close repeatedly |
| Preview actions | Keep or delete from preview when appropriate | Trigger action and verify queue state |

## Stream 2B: Move and secondary actions

| Task | Deliverable | Verification |
| --- | --- | --- |
| Long-press or overflow menu | Secondary actions like `Move` and `Share` | Open menu without breaking swipe |
| Move destination picker | Explicit target selection flow | Pick destination and verify result |
| Typed move result handling | Clear success and failure states | Simulate both paths |
| Native share handoff | Share current photo | Verify platform share sheet |

## Stream 2C: Settings and diagnostics

| Task | Deliverable | Verification |
| --- | --- | --- |
| Settings screen | All documented toggles and recovery actions | Manual review |
| Haptics, sound, and animation toggles | Preferences apply immediately | Toggle and verify live |
| Debug logging toggle | Richer local logs for reproduction | Enable, reproduce, inspect logs |
| Local data export | JSON or similar local export | Export and inspect contents |

## Bifurcation

## Secondary-action entry point

Preferred path:

- long-press on card plus overflow fallback if needed

Fallback path:

- overflow button only if long-press interferes with gesture reliability

## Exit gate

Phase 2 is done when preview and secondary actions add precision without crowding the core queue.

## Exit checklist

- `Move` never appears in the main action dock
- preview return preserves queue position consistently
- sort and filter state survive preview round-trips
- long-press does not interfere with swipe gestures
- settings changes take effect immediately without requiring a restart
