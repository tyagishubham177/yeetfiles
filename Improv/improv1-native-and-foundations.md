# Improv 1: Native, Stability, and Foundation Cleanup

## Goal

Fix the highest-risk correctness and platform issues first, and bundle native-touching work into the smallest possible number of Android development builds.

## Batch intent

This is the one improvement file that may justify `npm run dev:android:eas`. Keep its scope deliberate:

- native delete-path work
- Expo config changes
- platform animation and gesture migrations
- store reset correctness
- repo hygiene that prevents confusing future work

## Stream 1A: Critical correctness fixes

| Item | Problem | Implementation target | Build impact | Verification |
| --- | --- | --- | --- | --- |
| 1 | `photo-preview-modal.tsx` ignores dark and night mode by importing static light tokens | Replace direct token import with `useAppTheme()` and thread runtime colors through modal styles | JS only | Verify modal in light, dark, and night modes |
| 2 | `zoomable-preview-image.tsx` uses private `Animated.Value.__getValue()` | Replace with `addListener()` or move to Reanimated shared values | Likely JS only | Zoom, pan, and dismiss still behave correctly |
| 3 | `file-card.tsx` mixes bridge `Animated` values with native `Gesture` callbacks | Migrate swipe card motion to Reanimated shared values and animated styles | JS only if dependencies stay unchanged | Confirm smooth swipes on a mid-range Android device |
| 4 | `app-store.ts` keeps module-level caches alive across `resetApp()` | Centralize caches and clear them during reset | JS only | Reset app and verify selectors do not return stale queue data |

## Stream 1B: Delete popup removal path

### Why this belongs in the native batch

The current code already checks `MANAGE_MEDIA`, but the direct-delete bridge method does not exist. That means the popup bypass architecture is only half implemented.

### Required implementation

| Item | Problem | Implementation target | Build impact | Verification |
| --- | --- | --- | --- | --- |
| Delete popup investigation | `deleteAssetsDirectAsync()` is phantom code | Add a custom Expo module under `modules/expo-direct-delete` with Android implementation | Native build required | Silent delete works on Android 12+ with granted `MANAGE_MEDIA` |
| Permission wiring | Settings already expose direct delete status but the final bridge is missing | Keep settings flow, connect it to the real native module, and preserve fallback behavior | Native build required | On unsupported devices the app falls back cleanly to the system confirmation flow |
| Platform guardrails | Popup-free delete is impossible on some OS paths | Keep honest fallback copy for Android < 12 or when permission is unavailable | JS only | User messaging remains truthful in every branch |

### Native batch checklist

- add `expo-module.config.json`
- add TypeScript bindings in `modules/expo-direct-delete/src/index.ts`
- add Kotlin module implementation
- validate behavior in a development build, not Expo Go
- confirm no regression in normal `MediaLibrary.deleteAssetsAsync()` fallback

## Stream 1C: Architecture and repo hygiene

| Item | Problem | Implementation target | Build impact | Verification |
| --- | --- | --- | --- | --- |
| 5 | `App.tsx` is dead and misleading | Remove the unused file if Expo Router remains the only entry path | JS only | Repo still boots through `expo-router/entry` |
| 6 | `app-store.ts` is a monolith with repeated analytics logic | Split into feature slices and extract shared analytics helpers | JS only | Behavior matches current app state transitions |
| 7 | `partialize` persists settings only, while logs and analytics live only in memory | Decide whether action logs and analytics events should persist with TTL or stop pretending they are durable | JS only | Restart behavior matches the chosen contract |
| 8 | `app.json` slug is `fileswipe` while the product is `YeetFiles` | Rename slug to `yeetfiles` | Native build recommended | EAS and OTA identifiers match product naming |
| 9 | `app/queue/index.tsx` is too large to test safely | Extract sub-hooks such as `useMoveFlow`, `useDeleteFlow`, `useScanProgress`, and `useDirectDeleteStatus` | JS only | Queue screen remains behaviorally identical |
| 10 | Settings export uses fragile destructure-to-exclude logic | Replace with an explicit whitelist or `getExportableState()` selector | JS only | Export payload stays stable as new actions are added |
| 11 | `newArchEnabled` is false | Re-evaluate Fabric and TurboModules after the current gesture issues are stabilized | Native build if changed | Only enable after confirming no regressions |

## Stream 1D: Project hygiene backlog

| Item | Problem | Implementation target | Build impact | Verification |
| --- | --- | --- | --- | --- |
| 12 | Mixed line endings | Add `.gitattributes` and renormalize | Repo only | Git diff becomes predictable |
| 16 | `storage-adapter.ts` still uses a `phase0` key | Rename to `yeetfiles-store` and inline the tiny adapter if that improves clarity | JS only | Existing migration path does not orphan real users unexpectedly |
| 18 | `media-scan-service.ts` reports `0` bytes for some `content://` URIs | Improve size lookup and document any unavoidable platform gaps | JS only | Sorting and storage stats stop undercounting |
| 19 | `interaction-feedback.ts` uses deprecated vibration APIs | Move to `expo-haptics` | Native build only if package changes are needed | Haptics still fire for supported actions |
| 20 | No splash screen config | Add `splash` config and controlled hide timing with `expo-splash-screen` | Native build required if config changes | No white flash on cold app launch |
| 40 | `gradle-build.log` should not live in git | Remove the log and prevent recommit | Repo only | Status stays clean after Android work |
| 41 | No tests exist | Add a minimal test framework after the critical behavior is stable | JS only | One smoke test path exists |
| 42 | Dependency version pinning is inconsistent | Normalize dependency strategy | Maybe native if packages change | Lockfile updates stay intentional |
| 43 | Missing `.editorconfig`, ESLint, and Prettier baseline | Add formatting and lint guardrails | JS only | Local checks become predictable |
| 44 | `storage-service.ts` uses deprecated `expo-file-system/legacy` | Migrate to the current API | JS only unless package update is needed | Storage paths still resolve correctly |

## Exit gate

Improv 1 is done only when:

- the dark-mode modal bug is fixed
- swipe and preview motion are on safe, supported APIs
- app reset truly clears cached derived state
- the direct-delete architecture is either real and verified or intentionally deferred with the docs updated
- every native-touching change has been grouped into the minimum rebuild count
