# YeetFiles Screen Specifications

## Purpose

This document defines what each core screen must do, what it must contain, and how it should behave in edge cases.

## 1. Welcome screen

### Goal

Sell the feeling quickly, explain trust briefly, and get the user to the native permission prompt without extra setup.

### Must include

- product name
- one-line value proposition
- animated or clearly lively hero illustration
- primary CTA: `Start cleaning`
- secondary CTA: `Resume session` when a session exists
- short trust note such as local-only behavior and no cloud dependency

### Optional details

- quick note that the first version works on photos
- subtle history or last-session stat for returning users

### States

- first-time user
- returning user with resume available
- returning user without resume but with prior history

### Do not do

- show a separate source picker here
- dump the user into a long permission explainer
- bury the CTA below the fold

## 2. Queue screen and scan states

### Goal

Deliver the core review loop with minimal friction, while allowing scan progress to happen inline when needed.

### Required layout zones

- progress header with ring and score
- optional filter chip row
- dominant stacked photo card area
- bottom action dock with two large buttons and small `Skip`

### Required content

- current photo preview
- compact metadata strip
- reviewed and remaining progress context
- storage-freed score
- visible `Keep`, `Delete`, and `Skip` controls

### Required behaviors

- drag feedback for left and right swipe actions
- button equivalents for all queue decisions
- card tap opens preview
- no advancement until the current action is resolved
- reversible actions surface undo where supported

### Queue screen states

- booting with scan in progress and no first card yet
- ready with current card
- still scanning in background while cards are available
- action in progress
- action failed
- no files found
- all reviewed or goal reached

### Scan behavior rules

- if scan is fast, skip a dedicated scan screen entirely
- if scan is slower, show inline scan status without blocking the whole queue
- the first card should appear as soon as enough data is available

## 3. Full preview modal or screen

### Goal

Let the user inspect the current photo more closely without losing queue context.

### Must include

- larger preview of the active photo
- date, size, and other useful metadata
- clear close or back affordance

### Rules

- opening preview does not finalize the item
- returning keeps the same active card
- avoid turning preview into a secondary editing workflow in V1

## 4. System delete confirmation

### Goal

Protect the user from accidental permanent deletion without adding unnecessary conceptual overhead.

### Must include

- clear, factual copy that the system may ask for final confirmation
- visible feedback while the delete request is in flight

### Rules

- no `delete candidate` language
- cancelling the system confirmation produces no state change
- success and failure both return visible feedback
- copy should feel calm, not alarming

## 5. Summary screen

### Goal

Turn the end of a session into a satisfying checkpoint and an easy launch point for the next one.

### Must include

- large reviewed count
- delete, keep, and skip breakdown
- storage-freed total
- session duration or streak detail when useful
- primary CTA to continue or start another pass

### Tone

- celebratory, not loud
- easy to scan in a few seconds
- more victory screen than report page

### Session-end variants

- `Quick 10` completed
- full queue exhausted
- user stops after a partial session

## 6. Settings screen

### Goal

Provide recovery, preferences, and transparency controls without overwhelming the user.

### Sections

- preferences
- session and data
- debug and diagnostics
- danger zone

### Must include

- toggle haptics
- toggle animations
- reset onboarding
- clear local session data
- re-scan photos lane
- follow-system-theme preference and future night-mode control when implemented

### Danger zone rules

- destructive local reset requires confirmation
- copy must explain exactly what will be cleared

## 7. Move destination sheet or screen

### Goal

Define the future secondary move flow without letting it pollute the primary queue experience.

### Must include in later phases

- destination picker or recent targets
- explicit `Confirm move` control
- clear return path to the current queue card

### Rules

- move is not a primary queue action in V1
- move does not use swipe-up
- any failure keeps the user in control and preserves queue state

## Cross-screen requirements

### Navigation behavior

- app should never jump to a different screen unexpectedly during queue review
- returning from preview should preserve the same card
- interrupted flows should restore to a sensible state

### Copy behavior

- primary actions use short verbs
- warnings are factual, not theatrical
- error states explain what the user can do next

### Accessibility behavior

- touch targets sized for thumb use
- labels visible alongside icons
- meaning conveyed through text and shape, not color alone
- gesture learning supported through hints, not hidden assumptions
