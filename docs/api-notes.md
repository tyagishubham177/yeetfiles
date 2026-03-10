# FileSwipe API and Capability Notes

## Purpose

This document keeps the project grounded in realistic Android-native capability assumptions for an Expo-based app.

## Implementation stance

- start with supported media flows
- delay broad arbitrary file-manager behavior until proven necessary
- treat documents as a separate lane with different capability assumptions
- do not design UX around APIs that the product may not safely have in production

## Media access notes

### Expo Media Library

Good fit for:

- reading supported media assets
- getting image and media metadata
- building the initial photo-first queue

Important implications:

- permission state must be checked before scan and re-scan
- asset identifiers and deletion behavior may vary by platform and OS version
- real-device testing is mandatory because simulator behavior can be misleading

## File operation notes

### Expo FileSystem

Potentially useful for:

- reading file metadata for supported URIs
- moving or copying within supported capability boundaries
- writing logs or exported debug artifacts into app-managed storage

Important implications:

- do not assume every URI returned by other modules behaves the same way
- move/delete semantics may depend on how the file was accessed
- a "success" state should only be shown after the operation result is confirmed

## Document lane notes

### Expo Document Picker

Good fit for:

- explicit user-selected document flows
- future limited document review lane

Important implications:

- document access is not the same as broad device document scanning
- picked-document workflows should be framed as user-selected scope, not full-device awareness
- document move/delete behavior may need separate UI and capability handling from media flows

## Open and preview behavior

The `Open` action should be treated as a capability-dependent helper action.

Guidelines:

- returning from open must preserve queue position
- failure to open should not mutate file review state
- if native handlers are unavailable, show a clear failure or limited-preview fallback

## Android permission notes

The app should assume permission behavior can differ by Android version and file source.

Working principles:

- permission once granted does not guarantee all later operations succeed
- revoked permission must be detected after prior successful use
- permission-denied UX should stay separate from no-files-found UX

## Capability matrix direction

### Supported early

- photo/media permission request
- media scan on supported source
- image preview card
- local queue persistence
- `Keep` and `Skip`

### Supported later with validation

- delete against supported media source
- move flow with confirmed destination
- newly found item detection across re-scans

### Future or constrained

- broad document lane
- richer destination browsing
- advanced duplicate grouping
- broad folder-scoped management

## Guardrails for implementation

- never let UI assume a file operation is cheap or immediate
- isolate native API calls behind service modules
- capture operation errors as structured results
- document any capability caveat that affects product copy or scope
