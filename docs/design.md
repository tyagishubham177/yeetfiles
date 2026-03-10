# FileSwipe Design Principles

## Design mission

The design system for FileSwipe should make cleanup feel light, focused, and satisfying without weakening the user's sense of control.

## Product principles

1. Start fast.
2. Stay visually satisfying.
3. Be honest about permissions.
4. Make destructive actions safe.
5. Keep progress visible.
6. Recover gracefully from failures.

## Experience pillars

## 1. Clarity before cleverness

Every important step should be understandable in a few seconds. The product should not hide core behavior behind tricks, icon-only gestures, or clever animation.

## 2. Momentum without recklessness

The app should feel quick, but not twitchy. Users should sense speed during review while still feeling protected around risky actions.

## 3. Trust through explicit feedback

Whenever the app touches a file, the user should know:

- what action was attempted
- whether it worked
- what state the file is now in

## 4. Small wins matter

Cleanup is emotionally draining. The UX should create a loop of tiny completions:

- one decision
- one visible progress increment
- one less item in the backlog

## 5. One-handed usability

The review loop should be comfortable on tall Android phones:

- primary actions near thumb reach
- dense controls avoided
- scrolling minimized during core review

## UX tone

- playful utility
- clean and modern
- tactile and responsive
- rewarding without being noisy
- calm when things go wrong

## Design guardrails

- No deceptive gamification that hides destructive risk.
- No fake file-manager visuals implying unsupported scope.
- No empty "success" states unless the system actually confirmed success.
- No overstuffed queue screen with secondary data fighting the preview.
- No forcing gesture-only interaction.

## Information hierarchy

On most screens, the information hierarchy should be:

1. What screen am I on and what am I doing?
2. What is the single next action?
3. What progress have I already made?
4. What secondary details matter if I look closer?

## Content design rules

- Use short labels for core actions: `Keep`, `Move`, `Delete`, `Skip`, `Open`
- Avoid technical jargon in the main flow
- Use supportive copy for failure states
- Explain limits before the user hits them where possible

Examples:

- good: `Permission needed to scan photos`
- good: `Move failed. Try again.`
- bad: `Unhandled storage exception`

## Progress philosophy

Progress should always feel visible, but never naggy.

Preferred signals:

- reviewed count
- remaining count
- progress ring or bar
- streak or session goal as optional reinforcement

Avoid:

- pressure-heavy productivity language
- fake urgency
- aggressive badge spam

## Destructive action philosophy

Delete is intentionally heavier than other actions.

The UI should communicate that through:

- distinct warning color
- deliberate confirmation sheet
- slightly stronger haptic or motion treatment if enabled
- explicit result feedback after confirmation

## Failure handling philosophy

When something fails:

- keep the file in a safe state
- explain the failure in plain language
- provide the next possible action
- do not erase context or reset the session unexpectedly

## Motion guidelines

- card movement should feel tactile and responsive
- spring-back on cancelled swipe should be smooth and quick
- milestone celebrations should be brief and occasional
- motion should reinforce intention, not distract from it

## Accessibility principles

- button alternatives for all gestures
- high text contrast over previews
- visible focus or pressed states
- large touch targets
- color plus label or icon support for meaning

## Design review checklist

Before accepting a UI change, ask:

- does the next step feel obvious?
- is the primary action easy to reach one-handed?
- is destructive behavior explicit enough?
- would a first-time user understand the permission implication?
- does the interface reduce friction or just add flair?
