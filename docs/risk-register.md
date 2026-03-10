# FileSwipe Risk Register

## Purpose

This document keeps the project honest about the main ways the app can fail users or drift out of realistic scope.

| Risk | Severity | Likelihood | Why it matters | Mitigation |
| --- | --- | --- | --- | --- |
| Users do not return after the first session | Critical | High | A cleanup app that feels like a one-time chore still fails even if it works correctly | Design the reward loop early, make `Quick 10` real, and keep storage-freed progress visible during review |
| Onboarding still takes too long before the first swipe | Critical | High | Users will bounce before feeling the product | Collapse onboarding to welcome, permission, and queue; stream scan results instead of forcing extra steps |
| Delete flow reports success incorrectly | Critical | Medium | This would directly destroy trust | Use typed results, confirm delete separately, and log every destructive attempt |
| Queue action model becomes cognitively overloaded | High | High | Too many equal-weight actions weakens the swipe-loop promise | Keep only `Keep` and `Delete` as primary actions and demote move to a later secondary flow |
| Resume state becomes inconsistent after restart | High | Medium | Losing progress breaks the core promise of short-session cleanup | Persist queue state early and regression test interruption paths |
| Large photo libraries cause memory or scan issues | High | Medium | Real users will hit this quickly if the app works at all | Batch scans, stream first results, and test on larger libraries before expanding scope |
| Undo semantics are promised beyond what the platform can safely support | High | Medium | False reversibility is just another trust break | Limit undo to safe local review actions until delete restore is proven |
| UI becomes playful at the expense of clarity | Medium | Medium | Delight can accidentally hide risk or increase confusion | Keep design review tied to trust, one-thumb usability, and action clarity |
| Broad file-manager expectations leak into product copy | High | Medium | Users will expect unsupported access and feel misled | Keep scope narrow in UI copy and repeat lane boundaries in docs |
| Only emulator testing happens | High | Medium | App may look finished while failing on real phones | Require real-device exit criteria for each phase |
| Docs drift from implementation | Medium | Medium | Future decisions become incoherent and the team loses shared truth | Update docs in the same branch when assumptions change |

## Highest-priority watch items

These deserve ongoing attention from the very first coding pass:

- time to first swipe on a real device
- decision speed inside `Quick 10`
- delete confirmation and verified result handling
- undo reliability for safe actions
- queue restore integrity
- first-week repeatability signals once measurement exists
