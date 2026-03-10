# FileSwipe UI Design Overview

## UI goals

- feel mobile-native, not like a cramped admin panel
- keep one dominant action area per screen
- make progress visible at all times
- make destructive actions feel deliberate, not twitchy
- preserve momentum between files

## Design keywords

- bold
- spacious
- tactile
- focused
- playful utility

## Visual direction

The app should feel like a polished Android utility with a game-like energy, not a toy and not an enterprise dashboard.

That means:

- large preview surfaces
- assertive cards with clear depth
- bright state colors used sparingly and meaningfully
- dark, image-friendly review surfaces
- lighter utility surfaces for settings and setup screens

## Suggested visual system

These are directional starting points, not final locked tokens.

### Color logic

- red family: pending, messy, unsorted
- green family: reviewed, resolved, completed
- amber family: caution, delete candidate, warning
- blue family: move, navigation, helpful utility actions
- charcoal or deep slate: queue backgrounds and preview framing

### Example token direction

- background-app: deep charcoal
- background-card: near-black with soft elevation
- accent-keep: saturated green
- accent-move: electric blue
- accent-delete: amber shifting toward red on confirm
- text-primary: warm white
- text-secondary: soft gray

### Typography direction

- headings: `Space Grotesk` or `Sora`
- body and labels: `Manrope` or `DM Sans`
- metadata: compact but readable, never tiny by default

The design should avoid generic system-default feeling typography when custom font loading is practical.

## Layout principles

- top area holds context and progress
- center area is dominated by the current file preview
- bottom area holds the most likely actions within thumb reach
- only one primary screen-level task should compete for attention

## Visual states

### Pending state

- neutral base card
- subtle red or warm accent in progress area
- directional hints only when dragged

### Keep state

- green wash during swipe or button press
- clean, positive confirmation feedback

### Delete candidate state

- amber warning during initial intent
- stronger red cue only near confirm threshold or confirm sheet

### Error state

- preserve context
- surface concise error text
- provide retry or skip choice

## Core components

## File preview card

Contains:

- hero image or document placeholder
- gradient or scrim only when needed for legibility
- file name
- compact metadata row
- optional status chip

Behavior:

- slight tilt while dragging
- directional color wash
- crisp snap-back when gesture cancels

## Bottom action bar

Contains:

- `Keep`
- `Move`
- `Delete`
- `Skip`
- `Open`

Rules:

- large touch targets
- central frequent actions easiest to reach
- destructive action visually separated
- no icon-only dependence

## Progress header

Contains:

- reviewed count
- remaining count
- streak count or current run indicator
- compact progress visualization

Rules:

- visible at all times on queue screen
- compact enough not to crowd preview

## Toast and feedback system

Use to confirm:

- move success
- action cancelled
- permission needed
- operation failed
- undo available where safe

Rules:

- short copy
- no stacked spam
- failure toast should suggest next step when possible

## Screen feel by area

### Welcome and setup screens

- brighter and more open
- strong headline and trust copy
- clear primary CTA

### Queue screen

- darker, more cinematic, preview-first
- minimal clutter
- high-contrast controls

### Summary and settings screens

- more dashboard-like than queue, but still airy
- emphasize clarity over spectacle

## Motion guidelines

- fast card response on drag
- medium spring when released
- subtle celebration on milestones every 25 decisions
- no noisy particle effects or casino-style feedback

## Accessibility and usability

- all gestures must have button equivalents
- contrast must stay readable over images
- haptics should be optional
- icons should reinforce labels, not replace them
- one-handed use should remain comfortable on large Android phones
