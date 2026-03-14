# YeetFiles UI Design Overview

## UI goals

- feel mobile-native, not like a mini file manager
- make the photo the hero on the queue screen
- keep progress visible as a live score
- keep destructive actions deliberate without slowing the loop too much
- make short sessions feel complete and satisfying

## Design keywords

- bold
- tactile
- premium utility
- focused
- satisfying

## Visual direction

The product should feel like a polished cleanup companion with game-loop energy, not a toy and not an admin dashboard.

That means:

- welcome and settings screens follow the system theme by default
- the queue screen uses a darker preview stage so photos pop
- large, layered cards create depth and anticipation
- bright action colors appear only when they mean something
- progress and reward UI feel intentional, not decorative

## Suggested visual system

These are directional starting points, not final locked tokens.

### Color logic

- keep: mint green `#2ECC71`
- delete: warm coral `#E76F51`
- queue stage: near-black `#111827`
- queue card base: deep navy `#1A1A2E`
- progress accent: electric iris `#7C3AED`
- storage freed: gold `#F59E0B`
- skip and neutral controls: slate gray `#6B7280`
- primary text over dark surfaces: warm white `#F9FAFB`

### Typography direction

- headings and big counters: `Space Grotesk`
- body and controls: `DM Sans`
- metadata: `DM Sans`, compact but readable

The large scoreboard numbers should feel oversized on purpose. They are the emotional center of progress.

## Layout principles

- top area carries the progress ring, reviewed count, and storage-freed score
- optional filter chips sit above the card without overpowering it
- center area is dominated by the current photo card and stack depth
- bottom area is reserved for two large primary actions and one small `Skip` affordance

## Core components

## File preview card

Contains:

- full-bleed photo with generous rounded corners
- subtle stack peek for the next 1 to 2 cards
- a compact translucent metadata strip near the bottom edge
- no status chip by default

Behavior:

- slight lift and deeper shadow on touch start
- up to about 15 degrees of rotation based on drag distance
- directional screen tint during active drag
- spring-back on cancelled drag
- next card scales forward as the current one exits

## Action dock

Contains:

- large `Delete` button on the left
- large `Keep` button on the right
- small `Skip` text action beneath or between them

Rules:

- no five-button toolbar layout
- labels always visible alongside icons
- destructive action is visually strong but not visually louder than the whole screen
- the dock should feel like game controls, not form buttons

## Progress header

Contains:

- progress ring with current count or fraction
- reviewed count
- storage-freed counter
- quick goal or streak indicator when relevant

Rules:

- visible during review at all times
- compact enough to avoid squeezing the photo
- score updates should animate briefly on each successful action

## Filter chips

Default chips:

- `All`
- `Screenshots`
- `Camera`
- `Downloads`

Rules:

- lightweight and horizontally scrollable if needed
- selected state must be obvious even without color
- changing a filter should preserve the sense of queue continuity

## Toast and feedback system

Use to confirm:

- keep or skip undo availability
- delete success or failure
- permission needed
- milestone completion
- resume restored

Rules:

- short copy
- one toast at a time
- no stack spam
- feedback should support momentum, not interrupt it

## Screen feel by area

### Welcome and setup surfaces

- match the system theme by default
- use brighter spacing and optimistic copy
- show a small trust badge instead of a full permissions lecture

### Queue screen

- darker, cinematic, preview-first
- minimal chrome
- strong depth, strong thumb controls, live score

### Summary and settings screens

- lighter and calmer than the queue
- still energetic, but more reflective than immersive

## Motion guidelines

Swipe cycle target:

- release past threshold: current card exits in about 200 ms
- background action tint fades within about 300 ms
- count and score bounce slightly around 100 to 200 ms after confirmation
- next card settles into place by roughly 350 ms total

Gesture guidance:

- threshold roughly one-third of screen width for left and right commits
- subtle directional labels on the first few cards
- drag should feel attached to the finger, not delayed

## Haptic guidelines

- `Keep`: light success tap
- `Delete` confirm: medium warning tap
- `Skip`: very light or none
- milestone: short double tap
- error: distinct error pattern

## Reward system direction

Milestones should be intentionally small and fast:

- first 5 decisions: encouraging message
- 25 decisions: streak and progress emphasis
- 50 decisions: stronger score treatment
- 100 decisions: celebratory theme or cosmetic unlock in a later phase

Every delete should contribute to the live storage-freed score.

## Night session mode

Later polish can add an optional ultra-dark mode for low-light usage:

- darker queue stage
- dimmer flashes
- reduced celebration brightness
- feedback leaning more on haptics than light

## Accessibility and usability

- all gesture actions must have visible control alternatives
- contrast must remain readable over busy photos
- text and icons must work together
- motion should be meaningful and toggleable
- one-handed usage should remain comfortable on large Android phones
