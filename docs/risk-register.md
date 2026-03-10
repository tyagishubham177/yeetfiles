# FileSwipe Risk Register

## Purpose

This document keeps the project honest about the main ways the app can fail users or drift out of realistic scope.

| Risk | Severity | Likelihood | Why it matters | Mitigation |
| --- | --- | --- | --- | --- |
| Permission behavior is more fragile than expected | High | High | Without clear access handling, the product feels broken immediately | Build permission gates first and test denial plus revocation on real devices |
| Delete flow reports success incorrectly | Critical | Medium | This would directly destroy trust | Use typed results, confirm delete separately, and log every destructive attempt |
| Move behavior differs by source or URI type | High | Medium | Incorrect move assumptions can corrupt product promises | Keep move behind a service boundary and validate on real supported sources only |
| Resume state becomes inconsistent after restart | High | Medium | Losing progress breaks the core promise of short-session cleanup | Persist queue state early and regression test interruption paths |
| Large photo libraries cause memory or scan issues | High | Medium | Real users will hit this quickly if the app works at all | Batch scans, use placeholders, and test on larger libraries before expanding scope |
| UI becomes playful at the expense of clarity | Medium | Medium | Delight can accidentally hide risk or increase confusion | Keep design review tied to trust and usability checklist |
| Document lane is treated like free bonus scope | Medium | High | It can silently multiply platform risk and UI complexity | Treat documents as a separate future lane with separate capability notes |
| Broad file-manager expectations leak into product copy | High | Medium | Users will expect unsupported access and feel misled | Keep copy capability-aware and repeat scope boundaries in docs and UI |
| Only emulator testing happens | High | Medium | App may look finished while failing on real phones | Require real-device exit criteria for each phase |
| Docs drift from implementation | Medium | Medium | Future decisions become incoherent and the team loses shared truth | Update docs in the same branch when assumptions change |

## Highest-priority watch items

These deserve ongoing attention from the very first coding pass:

- permission request and revocation behavior
- queue restore integrity
- delete confirmation and verified result handling
- realistic move capability boundaries
- scan and preview performance on real devices
