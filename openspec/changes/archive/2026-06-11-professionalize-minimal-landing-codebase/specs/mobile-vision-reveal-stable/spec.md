## ADDED Requirements

### Requirement: Mobile Visión is a state machine
The mobile Visión section MUST be implemented as a state machine with four states: `idle`, `playing`, `reveal`, `compare`. The section MUST start in `idle` on first render. State transitions MUST be deterministic.

#### Scenario: Initial state
- **WHEN** a user first reaches the Visión section on mobile
- **THEN** the section is in the `idle` state: the video is paused, a poster is shown, and a "Reproducir boceto" button is visible

#### Scenario: User starts playback
- **WHEN** a user taps "Reproducir boceto"
- **THEN** the section transitions to `playing`, the video plays, and the button is hidden

#### Scenario: Video ends
- **WHEN** the video reaches its end
- **THEN** the section transitions to `reveal`, the video is paused on its last frame, and a "Revelar" overlay button is shown

#### Scenario: User reveals the compare
- **WHEN** a user taps "Revelar"
- **THEN** the section transitions to `compare`, the slider becomes visible and operable, and the "Revelar" overlay is hidden

### Requirement: The video never autoplays on mobile
The mobile Visión video MUST NOT autoplay under any circumstance. The user MUST press "Reproducir boceto" (or rely on the video `controls`) before the video starts.

#### Scenario: Page load
- **WHEN** a user loads the page on mobile
- **THEN** the Visión video is paused on first paint, even if the user scrolls past the section

### Requirement: Reduced motion is respected on mobile Visión
On `prefers-reduced-motion: reduce`, the mobile Visión section MUST NOT autoplay the video. The section MUST start in the `idle` state with a poster and a "Reproducir boceto" button. The user MAY still play the video manually and progress through the same state machine.

#### Scenario: Reduced motion user reaches Visión
- **WHEN** a user with `prefers-reduced-motion: reduce` reaches the Visión section
- **THEN** the section is in the `idle` state, the video is paused, and the user can still play it manually

### Requirement: The slider is only present in the compare state
The slider MUST only be in the DOM and only be exposed as a focusable element while the section is in the `compare` state. The slider MUST be operable with pointer drag and with the keyboard arrow keys (Left/Right).

#### Scenario: Slider appears after reveal
- **WHEN** the section transitions to `compare`
- **THEN** the slider becomes visible and the user can drag it or use the arrow keys to move it

#### Scenario: Slider is absent in other states
- **WHEN** the section is in any state other than `compare`
- **THEN** the slider is not focusable and is not visible
