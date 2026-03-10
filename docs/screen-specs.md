# FileSwipe Screen Specifications

## Purpose

This document defines what each core screen must do, what it must contain, and how it should behave in edge cases.

## 1. Welcome screen

### Goal

Orient the user quickly and create confidence that the app is simple, safe, and worth trying.

### Must include

- product name
- one-line value proposition
- simple hero illustration or visual motif
- primary CTA: `Start cleanup`
- secondary CTA: `Resume session` when a session exists
- short trust note about permissions and local-first behavior

### Optional details

- reviewed count from previous session
- small "works on supported Android media sources" note

### States

- first-time user
- returning user with resume available
- returning user without resume but with history

### Do not do

- show a long permissions explainer here
- hide the main CTA below the fold
- clutter the screen with settings-level detail

## 2. Permission and source screen

### Goal

Explain required access clearly, then get the user into a supported scan path.

### Must include

- plain-language explanation card
- visible permission status row
- source options list
- `Continue` button

### Interaction rules

- `Continue` stays disabled until the selected lane is valid
- denied permission state must show retry path
- if system settings are needed, surface a direct hint

### Empty or blocked states

- permission denied
- permission permanently denied
- source unavailable

## 3. Scan progress screen or panel

### Goal

Make the scanning wait feel alive and informative instead of frozen.

### Must include

- scan title
- short status line
- progress indicator when measurable
- fallback animated loading treatment when exact progress is not available
- note that the scan is local to the device

### Must communicate

- whether the app is still scanning
- whether the scan found files
- whether the scan failed

## 4. Queue screen

### Goal

Deliver the core review loop with strong focus and minimal friction.

### Required layout zones

- header with progress context
- dominant preview card in center
- metadata strip below preview
- sticky bottom action bar

### Required content

- current file preview
- file name
- metadata such as date, size, and source context
- progress counts
- visible action buttons

### Required behaviors

- drag feedback for swipe directions
- button equivalents for all swipe actions
- no advancement until the current action is resolved
- optional undo only where safe

### Queue screen states

- ready with current card
- loading next card
- action in progress
- action failed
- no files found
- all reviewed

## 5. Delete confirmation sheet

### Goal

Protect the user from accidental destruction.

### Must include

- clear warning headline
- file identity context
- short statement of the consequence
- `Cancel` and `Confirm delete` actions

### Rules

- `Cancel` returns cleanly with no side effect
- destructive action should never be the visually dominant default
- after confirm, show result feedback

## 6. Move destination screen

### Goal

Let the user select a destination confidently without losing queue context.

### Must include

- recent destinations when available
- favorite destinations in later iteration
- searchable or browsable target list if needed
- explicit `Confirm move` control

### Behavior rules

- no destructive actions on this screen
- last used destination may be shown first
- if move fails, the user must remain in control

## 7. Summary screen

### Goal

Show closure, momentum, and next possible actions after a run or partial run.

### Must include

- big reviewed count
- remaining count
- kept, moved, deleted, skipped breakdown
- newly added files section when relevant
- `Resume` or `Re-scan` CTA

### Tone

- rewarding but not loud
- fast to scan
- focused on trust and continuation

## 8. Settings screen

### Goal

Provide recovery, preferences, and transparency controls without overwhelming the user.

### Sections

- preferences
- data
- debug
- danger zone

### Must include

- toggle haptics and animations
- reset onboarding
- re-scan source
- clear local session data
- export debug log if implemented

### Danger zone rules

- destructive local reset requires confirmation
- copy should explain exactly what will be cleared

## Cross-screen requirements

### Navigation behavior

- app should never jump to a different screen unexpectedly during queue review
- returning from `Open` should preserve the same card
- interrupted flows should restore to a sensible state

### Copy behavior

- primary actions use short verbs
- warnings are direct but not alarming
- error states always explain what to do next when possible

### Accessibility behavior

- touch targets sized for thumb use
- labels visible alongside icons
- meaning conveyed through text and shape, not color alone
