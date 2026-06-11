## MODIFIED Requirements

### Requirement: Desktop fixed snap narrative
The landing page SHALL provide a desktop-first scroll narrative where primary chapters snap vertically with fixed, intentional transitions. The narrative flow SHALL activate only on viewports that meet both the width and height gates defined by the `responsive-breakpoints` capability.

#### Scenario: Desktop user scrolls between chapters
- **WHEN** a desktop user scrolls past the end of a chapter on a viewport that meets the desktop gate
- **THEN** the page snaps to the next primary chapter rather than stopping midway between chapters

#### Scenario: Mobile or tablet user views the page
- **WHEN** a user views the page on a viewport below the desktop gate
- **THEN** the page MUST render the stacked mobile/tablet experience and MUST NOT activate the chapter controller, the wheel handler, or the `useNarrativeScroll` step model

### Requirement: Vision chapter with sketch video and before-after slider
The Vision chapter SHALL play a supplied sketch-drawing video on entry when allowed by motion preferences, freeze on its final state after playback, and then expose a horizontal slider comparing the sketch to the final image. The chapter MUST NOT render legacy `Boceto` / `Final` corner labels in any viewport.

#### Scenario: User enters Vision on desktop
- **WHEN** a user reaches the Vision chapter on a desktop viewport that meets the desktop gate
- **THEN** the sketch video starts playback automatically when allowed by the browser and reduced motion preferences

#### Scenario: User enters Vision with reduced motion
- **WHEN** a user with `prefers-reduced-motion: reduce` reaches the Vision chapter
- **THEN** the sketch video does not autoplay and a poster or static final image is shown until the user explicitly starts playback

#### Scenario: User drags the Vision slider
- **WHEN** the user moves the slider from left to right
- **THEN** the visible composition transitions from sketch on the left to final image on the right according to the slider position

#### Scenario: User scrolls through Vision after video completion
- **WHEN** the user continues through the Vision chapter after the sketch video completes
- **THEN** supporting text is revealed with a writing or progressive text effect tied to the chapter narrative

#### Scenario: Corner labels are absent in any viewport
- **WHEN** the Vision chapter is rendered
- **THEN** the chapter MUST NOT include `Boceto` or `Final` corner labels

### Requirement: Motion accessibility and fallbacks
The redesigned landing page SHALL preserve accessibility for users with reduced motion preferences, keyboard navigation, and assistive technology. The narrative flow MUST NOT be the only way to access content; the stacked mobile/tablet experience MUST be the primary path on small/medium viewports.

#### Scenario: Reduced-motion user views the narrative
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** the page shows static equivalent states, avoids scroll-dependent animation as the only way to access content, and exposes video controls where relevant

#### Scenario: Keyboard user navigates the page
- **WHEN** the user navigates with keyboard controls
- **THEN** primary navigation, video controls, and slider controls are reachable and operable without a mouse

#### Scenario: Assistive technology reads sections
- **WHEN** assistive technology traverses the page
- **THEN** the primary chapters have semantic structure, meaningful headings, and media labels or alternative text
