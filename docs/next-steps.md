# YeetFiles Next Steps

## Immediate next milestone

Validate the full Phase 3 reliability slice on a real Android device.

## Current Phase 3 slice

- additive re-scan that keeps the existing queue intact
- new-photo detection with `New since last scan` surfacing
- reviewed-item protection so already-reviewed files do not return as duplicates
- smarter sorting and nearby-image prefetch for large queues
- notification preferences and weekly reminder scheduling
- local low-storage detection and alerting
- real follow-system theme support plus manual and auto night mode
- foreground resume checks for permission and storage refresh
- first-run gesture tutorial before the first real review card

## Suggested implementation order

1. Rebuild the Android dev client so `expo-notifications` is present in the installed app.
2. Validate additive re-scan from Settings and Summary after adding new photos outside the app.
3. Verify weekly reminder permission prompts and scheduling behavior on a physical device.
4. Confirm low-storage warnings are factual, dismissible, and never spammy.
5. Stress-test larger libraries before deciding whether cursor-first persistence is necessary.

## Success criteria

- re-scan adds only unmatched photos instead of resetting the queue
- reviewed files stay protected from duplicate re-entry
- reminders and alerts are easy to enable, understand, and disable
- night mode feels comfortable in `Off`, `Auto`, and `On`
- restart and foreground resume preserve trust in queue continuity
- larger libraries still scan and sort quickly enough on-device

## Decisions to keep open for now

- whether cursor-first persistence is worth adding before a database migration
- how far the `smart` sort heuristic should go beyond the current lightweight ranking
- whether weekly reminders should remain opt-in by default
- whether optional action sounds are worth the extra native complexity

## Verification checklist for the next pass

- confirm re-scan works from both Settings and Summary without duplicate reviewed cards
- confirm newly added photos get the `New since last scan` badge
- confirm low-storage warnings appear only when the device is actually low on free space
- confirm killing the app during a scan still resumes safely on reopen
- confirm weekly reminders stop immediately when disabled
