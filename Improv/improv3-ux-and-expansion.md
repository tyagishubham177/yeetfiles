# Improv 3: UX Polish, Theming, and Future Expansion

## Goal

Strengthen the app's delight, clarity, and visual trust while keeping future lane expansion honest and scoped.

## Stream 3A: Welcome, onboarding, and first-run clarity

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 21 | Selected session chip is too subtle | Add a checkmark, stronger border, or scale treatment for the selected state | Selected mode is obvious in all themes |
| 22 | First launch has no friendly empty state when the library is empty | Show a warm no-photos state after a completed zero-result scan | Empty libraries do not feel broken |
| 34 | Tutorial card is too passive | Replace the static tutorial with a short interactive practice flow using a dummy card | A new user can learn the gestures by doing |

## Stream 3B: Queue and preview polish

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 1-user request | Put more information in the top-right image area and keep it overlapping the photo | Treat the photo card as an information surface with persistent overlay chips | Overlay remains readable over bright and dark images |
| 15 | No local error boundary exists around the complex queue | Add a queue-scoped error boundary with a recovery action | Queue failures do not crash the whole app |
| 29 | Backticks render literally in the tutorial card | Replace pseudo-markdown with real styled text | Instruction copy renders cleanly |
| 38 | Preview modal cannot swipe down to dismiss | Add a swipe-down-to-dismiss gesture with a threshold and spring-back | Full-screen preview feels mobile-native |

## Stream 3C: Summary, settings, and theming polish

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 26 | Summary stats waste vertical space | Change the stat block to a 2x2 grid | Summary becomes more scannable |
| 27 | Summary has no moment of celebration | Add a tasteful entrance animation, checkmark, or confetti treatment | Completion feels rewarding without becoming noisy |
| 28 | `0 B` hero stat can feel deflating | Switch to organized-count messaging when recovered storage is zero | All-keep sessions still feel successful |
| 32 | Settings sections blend together visually | Add section icons, clearer headers, and a stronger danger-zone treatment | Settings page is faster to scan |
| 33 | All switches share the same accent treatment | Differentiate groups with sublabels or accent logic where it clarifies meaning | Preference groups feel intentional |
| 35 | No live dark-mode preview exists in settings | Add a small live preview card for the selected theme mode | Theme changes are understandable before leaving settings |
| 20 | Cold launch can flash white before the boot screen | Pair splash configuration with the visual system so startup feels intentional | Launch transitions look polished |

## Stream 3D: Design-system cleanup

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| 13 | Many hardcoded `rgba()` values exist | Add semantic color tokens such as overlays, hint text, and soft surfaces | New surfaces stop inventing colors ad hoc |
| 14 | `useAppHealthMonitor` effect cascades by reading and writing the same state | Simplify read paths with `useAppStore.getState()` where appropriate | Health monitoring stops causing unnecessary reruns |
| 17 | Date formatting is pinned to `en-IN` | Use the system locale by default | Dates feel natural for each user |

## Stream 3E: Future lanes and honest expansion

| Item | Problem | Implementation target | Verification |
| --- | --- | --- | --- |
| All-files concept | Future support for video, documents, audio, archives, and other files needs a truthful plan | Extend `FileItem` into a category-based model and keep photos as the only enabled default lane initially | Architecture can grow without confusing current users |
| Scanner expansion | Non-photo files need different scanning capabilities | Separate photo and video scanning from document and download traversal | Scope stays clear and technically honest |
| Filter evolution | Future file-type chips should grow from the existing filter row | Reserve a path for category chips without shipping them prematurely | The filter system does not need to be rewritten later |
| Preview routing | Each file category needs a different preview path | Define photo, video, PDF, audio, archive, and fallback preview expectations in advance | Future expansion has a spec before code |
| Settings expansion | Users will need scan-target controls if more lanes ship | Plan a Settings section for scan-target toggles, off by default for non-photo lanes | Future lane growth remains opt-in |

## Nice-to-have ideas to evaluate later

- section-level motion and staggered reveals on the summary screen
- richer card-stack depth cues tied to swipe progress
- celebratory streak language in the 90-day history surface
- side-by-side theme previews if the settings screen has room

## Exit gate

Improv 3 is done only when:

- the first-run experience is clearer
- queue and preview interactions feel more native
- summary and settings screens are visually easier to scan
- theme behavior is trustworthy and previewable
- future all-files support remains documented as a planned lane, not an implied shipped capability
