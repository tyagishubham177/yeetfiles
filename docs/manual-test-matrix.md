# FileSwipe Manual Test Matrix

## Purpose

This is the practical checklist for device-based validation before a phase is called done.

## Core device matrix

| Device type | Why it matters | Minimum expectation |
| --- | --- | --- |
| Main Android phone | Closest to real everyday use | Full primary flow works |
| Android emulator | Fast smoke checks during iteration | No obvious route or layout break |
| Lower-RAM Android phone if available | Catches performance and resume issues sooner | Queue remains usable under memory pressure |

## OS coverage targets

| Android version band | Priority | Reason |
| --- | --- | --- |
| Android 13 or newer | High | Modern permission behavior and current-user relevance |
| Android 11 or 12 | Medium | Broad real-world compatibility and older permission patterns |

## Scenario checklist

| Scenario | Verify on phone | Verify on emulator | Notes |
| --- | --- | --- | --- |
| First launch permission grant | Yes | Yes | Phone is the source of truth |
| Permission denial and recovery | Yes | Yes | Check retry and settings guidance |
| Small scan complete | Yes | Yes | Phone timing matters most |
| Queue keep and skip | Yes | Yes | Must feel fast on phone |
| Delete confirm and cancel | Yes | Optional | Prefer phone before trusting behavior |
| Move success and failure | Yes | Optional | Capability can differ on device |
| App background and resume | Yes | Limited | Real phone is essential |
| Permission revoked after earlier use | Yes | Optional | Best tested on device settings |
| Large library stress | Yes | No | Emulator is not enough |
| Local data reset | Yes | Yes | Check onboarding and clean state |

## Per-build checklist

### Before testing

- install the newest build cleanly
- know which branch and commit are on the device
- confirm whether test data changed since last run

### During testing

- note exact screen where failures happen
- record whether failure is visual, logic, or capability related
- capture whether restart changes the result

### After testing

- confirm whether issue is reproducible
- tie issue back to doc assumption if needed
- update docs if implementation reality changed

## Manual evidence to capture

- screenshots of key screens
- short notes on scan time and responsiveness
- exact wording of permission or failure states
- confirmation that destructive flows behaved safely
