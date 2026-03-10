# FileSwipe Product Brief

## Working name

FileSwipe

## Repository note

The repository is still named `YeetFiles`, but the product working name for planning and UI copy is `FileSwipe`.

## One-line pitch

An Android-first mobile app that turns photo and file cleanup into a fast, swipeable review loop for keeping, moving, skipping, and safely deleting files.

## Core product idea

FileSwipe should feel like the user is clearing a backlog, not managing a file system. The product has to convert a messy, high-friction maintenance task into a short, focused sequence of obvious decisions.

The key experience is:

- one file at a time
- one clear decision at a time
- instant progress feedback
- strong trust signals around risky actions

## Problem statement

People accumulate large volumes of screenshots, duplicates, camera photos, downloads, and random documents. Existing cleanup behavior usually fails for one of three reasons:

1. The system gallery or file manager exposes too much at once.
2. Cleanup actions feel risky because users are not sure what will happen.
3. The task is emotionally draining and easy to abandon halfway through.

FileSwipe exists to make cleanup:

- less visually overwhelming
- less technically intimidating
- easier to continue over multiple short sessions

## Product goal

Make file cleanup feel simple, visual, safe, and satisfying instead of technical and exhausting.

## Product vision

In its best form, FileSwipe becomes the "five-minute cleanup loop" for a personal Android device:

- quick to enter
- rewarding to use
- honest about what it can and cannot access
- dependable enough that users trust it with real organization work

## Target user

### Primary user

- Single user
- Android phone owner
- Personal utility use only
- Large or messy photo library
- Wants visible progress and low mental load

### Likely behaviors

- has many screenshots and throwaway images
- postpones cleanup because it feels tedious
- wants phone storage relief but does not want a complex file-manager workflow
- is cautious about deleting anything permanently

### Anti-personas

The first version is not for:

- multi-user/shared device workflows
- enterprise file management
- cloud-drive organization
- power users expecting unrestricted desktop-style folder control
- users who need iOS parity on day one

## Jobs to be done

- "Help me quickly decide what to keep and what to get rid of."
- "Help me clean up my photo mess in short sessions without losing track."
- "Let me organize files without making me navigate deep folders for every action."
- "Show me that the app is being careful before anything destructive happens."

## Core promise

The app should feel like a game loop for digital cleanup while still behaving like a trustworthy utility.

## Trust promise

Trust is the central product asset. The app must:

- ask for only the permissions it really needs
- explain limits before failure happens
- never fake a file move or delete success
- keep progress after interruption
- separate staging from irreversible actions where possible

## Non-negotiables

- Android-first
- Native app approach via React Native / Expo
- Real device testing
- Free or near-free development setup
- Local-first persistence
- Honest permission handling
- No silent destructive actions

## Why native instead of web

A browser-based approach is not a credible fit for the core product loop. FileSwipe needs:

- direct integration with Android media access flows
- reliable local storage for session progress
- better control over thumbnails, previews, and file operation results
- behavior that is consistent with mobile system permissions

The app should be honest about capability. If the platform cannot safely do something, the product should narrow scope instead of pretending.

## V1 product scope

### In scope

- photos-first review flow
- supported-source scanning on Android
- review queue generation
- actions: `Keep`, `Move`, `Delete candidate`, `Skip`, `Open`
- local tracking of reviewed vs pending vs newly found files
- resume sessions after app restart
- visible progress and summary stats
- failure reporting for file operations

### Deliberately simplified in V1

- start with the highest-confidence photo lane
- keep destination selection understandable
- prefer explicit review over background automation
- bias toward safety over aggressive cleanup shortcuts

## V1.5 scope

- duplicate hints
- large-file bucket
- similar screenshot grouping
- better batch actions
- undo queue for recent actions

## Out of scope for V1

- iOS parity
- desktop app
- cloud sync
- multi-user accounts
- OCR-heavy analysis
- background full-device intelligence
- broad unrestricted file-manager claims
- Play Store hardening for maximum storage access

## Product success signals

### Early qualitative signals

- user understands what source is being scanned
- first review action happens quickly after entry
- session resume feels trustworthy
- delete flow feels safe, not scary
- user can describe the app as "easy" rather than "powerful"

### Early quantitative signals to eventually measure

- time to first file review
- average files reviewed per session
- session return rate within 7 days
- share of sessions resumed successfully
- action failure rate for move/delete
- queue abandonment rate during permission or scan steps

## Strategic guardrails

- start narrow and reliable
- do not promise desktop-level file management
- do not use delight to hide risk
- prioritize safe completion over clever automation
- build only what can be tested on real Android devices
