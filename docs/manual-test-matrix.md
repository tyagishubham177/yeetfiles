# YeetFiles Manual Test Matrix

## Purpose

This is the practical checklist for device-based validation before a phase is called done.

## Core device matrix

| Device type | Why it matters | Minimum expectation |
| --- | --- | --- |
| Main Android phone | Closest to real everyday use | Full primary flow works and feels fast |
| Android emulator | Fast smoke checks during iteration | No obvious route or layout break |
| Lower-RAM Android phone if available | Catches scan, memory, and resume issues sooner | Queue remains usable under pressure |

## OS coverage targets

| Android version band | Priority | Reason |
| --- | --- | --- |
| Android 13 or newer | High | Modern permission behavior and current-user relevance |
| Android 11 or 12 | Medium | Broad real-world compatibility and older permission patterns |

## Scenario checklist

| Scenario | Verify on phone | Verify on emulator | Notes |
| --- | --- | --- | --- |
| First launch permission grant | Yes | Yes | Phone is the source of truth |
| First swipe speed | Yes | Optional | Must feel immediate on phone |
| Small scan complete | Yes | Yes | Confirm no unnecessary full-screen wait |
| Queue keep, delete, and skip | Yes | Yes | Must feel simple on phone |
| Delete confirm and cancel | Yes | Optional | Prefer phone before trusting behavior |
| Undo for reversible actions | Yes | Yes | Check count rollback too |
| Quick 10 completion | Yes | Yes | Summary should feel like a win |
| App background and resume | Yes | Limited | Real phone is essential |
| Permission revoked after earlier use | Yes | Optional | Best tested through device settings |
| Large library stress | Yes | No | Emulator is not enough |
| Local data reset | Yes | Yes | Check onboarding and clean state |

## Per-build checklist

### Before testing

- install the newest build cleanly
- know which branch and commit are on the device
- confirm whether test data changed since the last run

### During testing

- note exact screen where failures happen
- record whether failure is visual, logic, capability, or feel-related
- capture whether restart changes the result
- note time-to-first-card if it feels slow

### After testing

- confirm whether the issue is reproducible
- tie the issue back to a doc assumption if needed
- update docs if implementation reality changed

## Manual evidence to capture

- screenshots of the welcome, queue, system delete confirmation, and summary screens
- short notes on first-swipe speed and scan responsiveness
- exact wording of permission or failure states
- confirmation that storage-freed numbers behaved correctly
- confirmation that destructive flows behaved safely
