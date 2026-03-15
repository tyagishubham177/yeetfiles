# Improv 2: Queue, Persistence, Filters, and 90-Day History

## Goal

Make the review loop trustworthy across sessions, faster to scan visually, and richer in meaningful progress data without forcing users to re-tag old files.

## Product stance for this batch

The queue should behave like a durable review system, not a temporary scan result. A rescan should add newly discovered items and refresh metadata where safe, but it should not erase prior user decisions unless the user explicitly requests a full rebuild from Settings.

## Stream 2A: Persistent tagging and rescan behavior

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 4-user request | App rescans all local files on open and effectively makes old tagged work feel unstable | Persist per-file decision state keyed by a stable media identifier and merge new scans into the existing corpus | Review 20 items, restart app, and confirm counts remain constant |
| 4-user request | Old images should keep `KEEP`, `SKIP`, or equivalent tags | Treat prior decisions as durable unless the asset disappears or a manual clean rescan is requested | Previously reviewed cards do not re-enter the main queue on normal startup |
| 4-user request | Manual clean rebuild should exist as an explicit escape hatch | Add a Settings action that clears prior review state and performs a full rescan | Manual rescan truly rebuilds the review set |
| 7 | Action logs and analytics disappear on restart | Decide what history must persist for stats and calendar views, then persist only that durable subset | History survives restart without bloating storage |

### Suggested state model additions

- durable per-asset review status
- first seen timestamp
- last action timestamp
- action source such as swipe, button, or undo
- scan snapshot metadata for incremental detection

## Stream 2B: Filter chips, sorting, and queue organization

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 3-user request | Filter chips need better arrangement | Reorder chips by usefulness and count, with stable placement rules instead of ad hoc ordering | Chips read cleanly on small phones |
| 3-user request | High-to-low sorting should be easier to understand | Surface a clear size-descending or score-descending mode and label it plainly | Large files reliably bubble up first |
| 3-user request | Images should remain associated with their folders | Preserve bucket or folder provenance visibly in queue and filtering | A user can understand where a file came from at a glance |
| 3-user request | `random` should be the default selected chip | Make random the initial filter state if that still fits the product promise after persistence changes | First queue load defaults to random |
| 18 | Bad byte lookups break sorting fidelity | Fix size resolution so sort order can be trusted | Biggest files are not incorrectly buried |
| 36 | Zero-count chips create noise | Dim and disable zero-count chips instead of leaving them fully active | Empty filters are still visible but clearly inactive |

## Stream 2C: Calendar view and stats for the past 90 days

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 2-user request | No calendar view exists for recent cleaning history | Add a 90-day history view backed by persisted daily aggregates | Activity heatmap or calendar reflects real sessions |
| 2-user request | Users want to know how much cleaning was done | Track daily reviewed count, delete count, keep count, skip count, and storage recovered | Totals match recent session summaries |
| 28 | `0 B` can feel like a failure when no files were deleted | Use alternate hero stats such as `photos organized` when freed storage is zero | Summary stays encouraging |

### Suggested history metrics

- sessions completed per day
- items reviewed per day
- items deleted per day
- storage recovered per day
- streak or active days in last 30 and 90 days

### Recommended UI shape

- lightweight calendar or heatmap in Settings or a dedicated stats view
- tap a day to see sessions completed and totals
- default summary window of 90 days with optional 7-day and 30-day quick filters later

## Stream 2D: Queue surface behavior and feedback

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 23 | Delete has weak in-card progress feedback | Add pending delete motion such as pulse, shake, or fly-out animation on success | The queue feels responsive before the OS result returns |
| 24 | `UndoToast` and `ActionDock` can visually collide | Move the action dock to a fixed footer and float undo above it | Small screens do not overlap controls |
| 25 | Card stack has no visible depth | Render one or two peek cards behind the current card | The deck metaphor is obvious before the first swipe |
| 30 | No image skeleton or shimmer exists | Add a loading placeholder that fades once the image loads | Card area never looks blank while loading |
| 31 | Important metadata is hidden in the preview modal | Add top-right overlay chips for file size and relative date and keep them overlapping the image | Faster decisions without opening preview |
| 37 | No threshold haptic exists during swipe | Fire a light haptic when crossing commit threshold and a heavier one on release | Swipe intent feels tactile |
| 39 | Queue cannot pull to refresh | Add `RefreshControl` to trigger a controlled rescan or incremental sync | User can request fresh media without leaving the queue |

## Exit gate

Improv 2 is done only when:

- old decisions survive app restarts
- rescans add new media without re-tagging old media
- a manual clean rescan exists and is explicit
- chips, sorting, and metadata overlays make the queue faster to parse
- at least one 90-day history surface is real and backed by durable stored data
