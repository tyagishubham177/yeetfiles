# FileSwipe API and Capability Notes

## Purpose

This document keeps the project grounded in realistic Android-native capability assumptions for an Expo-based app.

## Implementation stance

- start with the photos lane only
- design the happy path around fast entry, not broad source choice
- treat move and documents as later, slower capabilities
- do not design UX around APIs the product may not safely have in production

## Media access notes

### Expo Media Library

Good fit for:

- reading supported photo assets
- getting image metadata
- building the initial queue
- deleting supported media assets when capability is confirmed on target devices

Important implications:

- permission state must be checked before scan and re-scan
- asset identifiers and delete behavior may vary by Android version
- scan should happen in pages or batches so the first card can appear quickly
- real-device testing is mandatory because emulator behavior can mislead

## Queue-boot implications

The app should not wait for a perfect full-library snapshot before showing value.

Working principles:

- start scan immediately after permission grant
- normalize enough data to render the first card fast
- keep scan feedback inline when it lasts longer
- skip a standalone scan screen when the wait is trivial

## File operation notes

### Expo FileSystem

Potentially useful for:

- reading additional metadata for supported URIs
- writing logs or debug artifacts into app-managed storage
- future move flows where capability has been validated

Important implications:

- do not assume every URI behaves the same way
- move and delete semantics depend on how the file was accessed
- a success state should only be shown after the operation result is confirmed

## Open and preview behavior

`Open preview` should be treated as a lightweight helper action triggered by card tap.

Guidelines:

- returning from preview must preserve queue position
- failure to open must not mutate review state
- preview should stay in-app by default unless a native handoff is clearly better and equally safe

## Delete and undo behavior

Guidelines:

- delete uses a confirmation sheet, not a staged `delete_candidate` state
- post-delete undo must not be promised unless the platform can truly restore the file
- keep and skip undo are safe to support early because they only reverse local review state

## Document lane notes

### Expo Document Picker

Good fit later for:

- explicit user-selected document flows
- limited future document review

Important implications:

- picked-document access is not broad device document scanning
- document workflows should be framed as user-selected scope, not full-device awareness
- document move and delete behavior may need separate UI and capability handling from photos

## Android permission notes

The app should assume permission behavior can differ by Android version and asset source.

Working principles:

- permission once granted does not guarantee every later operation succeeds
- revoked permission must be detected after prior successful use
- permission-denied UX must stay separate from no-files-found UX

## Capability matrix direction

### Supported early

- media permission request from the welcome flow
- streaming photo scan into the queue
- `Keep`, `Delete`, and `Skip`
- card tap preview
- local queue persistence
- storage-freed tracking

### Supported later with validation

- move from a secondary menu
- re-scan with new-file detection
- comparison view for similar photos
- stronger summary sharing

### Future or constrained

- broad document lane
- arbitrary folder-scoped management
- safe post-delete restore
- aggressive smart-cleanup automation

## Guardrails for implementation

- never let UI assume a file operation is cheap or immediate
- isolate native API calls behind service modules
- capture operation errors as structured results
- document any capability caveat that affects product copy or scope
- if platform behavior weakens a fun idea, choose honesty over spectacle
