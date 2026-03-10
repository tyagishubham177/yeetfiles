# FileSwipe Design Principles

## Design mission

Make cleanup feel fast enough to start, safe enough to trust, and rewarding enough to repeat.

## Product principles

1. Get to the first swipe fast.
2. Let the photo do most of the work.
3. Reduce the core loop to obvious choices.
4. Reward progress without becoming noisy.
5. Use reversibility where it is honest.
6. Keep one-thumb usage comfortable.

## Experience pillars

## 1. Speed before setup

The product should not make the user work through extra screens before they see value. V1 starts with photos only, so the happy path is:

- welcome
- native permission
- queue

Anything beyond that must justify its existence.

## 2. Two strong actions beat five weak ones

The queue is not a toolbar. It is a decision loop. The interface should make `Keep` and `Delete` obvious, while `Skip` stays available without fighting for visual weight.

That means:

- no five-button bottom bar
- no primary `Move` action in the queue
- no `Open` button competing with the decision actions

## 3. The photo is the hero

Users decide based on the image first. Chrome should support the decision, not dominate it.

That means:

- large full-bleed preview card
- only the most useful metadata visible by default
- no noisy status chips on the main card

## 4. Progress should feel like a score

Cleanup is easier to continue when progress feels tangible. The interface should turn abstract effort into visible reward:

- reviewed count
- remaining count
- storage freed
- quick session goal
- milestones that appear briefly and then get out of the way

## 5. Trust comes from clarity plus reversibility

Users move faster when the product feels careful. Delete needs an explicit confirm step. Reversible decisions need undo. Every operation needs a truthful result.

## 6. Energy in short bursts

The app should feel alive, not hyperactive. Motion, haptics, and milestone feedback should create rhythm and satisfaction without turning the app into a casino.

## UX tone

- playful utility
- premium but grounded
- tactile and responsive
- upbeat without being childish
- calm when risk or failure appears

## Design guardrails

- No deceptive gamification that hides destructive risk.
- No separate setup screens unless they remove real confusion.
- No fake file-manager visuals implying unsupported scope.
- No overloaded card layouts that compete with the photo.
- No gesture-only interaction.
- No reward effects that interrupt rapid swiping.

## Information hierarchy

On the queue screen, the hierarchy should be:

1. The current photo
2. The next obvious action
3. Progress and score
4. Secondary details and filters

## Content design rules

- Use short labels for core actions: `Keep`, `Delete`, `Skip`
- Treat card tap as `Open preview`, not a separate CTA
- Reserve `Move` for a later secondary menu
- Avoid technical jargon in the main flow
- Use supportive, factual copy for warnings and failures

Examples:

- good: `Start cleaning`
- good: `Delete this photo from your device?`
- good: `Permission needed to load your photos`
- bad: `Select a supported source`
- bad: `Unhandled storage exception`

## Progress philosophy

Progress should be visible on every card without becoming stressful.

Preferred signals:

- reviewed count
- remaining count or fraction
- progress ring
- storage freed counter
- quick goal completion state

Avoid:

- fake urgency
- productivity guilt language
- reward spam on every single action

## Destructive action philosophy

Delete must feel intentional, not scary.

The UI should communicate that through:

- a clear left-swipe warning state
- a factual confirmation sheet
- stronger warning haptic than `Keep`
- explicit post-result feedback

The product should not force a staging concept the user never asked for.

## Failure handling philosophy

When something fails:

- keep the file in a safe state
- explain the failure in plain language
- preserve queue context
- provide the next action
- never trade clarity for momentum

## Motion guidelines

- card movement should feel physical and responsive
- cancelled drags should spring back quickly
- next-card transitions should keep rhythm high
- milestone celebrations should be brief and rare enough to stay special

## Haptic guidelines

- `Keep`: light confirmation tap
- `Delete` confirm: medium warning tap
- `Skip`: minimal or no haptic
- milestone: short double pulse
- error: distinct error pattern

Haptics should be on by default and configurable in settings.

## Accessibility principles

- button or link alternatives for all gestures
- high text contrast over previews
- large touch targets in the bottom action dock
- visible labels alongside icons
- motion and haptic controls available in settings

## Design review checklist

Before accepting a UI change, ask:

- can a new user reach the first swipe quickly?
- are there only two truly primary actions on the queue?
- does the photo remain the visual hero?
- does progress feel rewarding and easy to read?
- is destructive behavior explicit enough?
- would this still feel clear if gestures were unavailable?
