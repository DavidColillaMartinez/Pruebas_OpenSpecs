## ADDED Requirements

### Requirement: Desktop fixed snap narrative
The landing page SHALL provide a desktop-first scroll narrative where primary chapters snap vertically with fixed, intentional transitions.

#### Scenario: Desktop user scrolls between chapters
- **WHEN** a desktop user scrolls past the end of a chapter
- **THEN** the page snaps to the next primary chapter rather than stopping midway between chapters

#### Scenario: Mobile user views the page
- **WHEN** a mobile or narrow-viewport user views the page
- **THEN** the page MUST avoid relying on the same strict desktop mandatory snap behavior as the primary mobile experience

### Requirement: Inicio chapter with full-screen asset and internal method reveal
The Inicio chapter SHALL initially show only a full-viewport bathroom asset and the primary brand heading, then reveal method content through internal scroll progression before the next chapter.

#### Scenario: User first lands on Inicio
- **WHEN** the page first loads at the top
- **THEN** the visible scene shows the hero asset and primary H1 without product cards, metric grids, or competing content blocks

#### Scenario: User scrolls inside Inicio
- **WHEN** the user scrolls through the Inicio chapter before entering Coleccion
- **THEN** method content appears progressively within the Inicio chapter as part of the opening narrative

### Requirement: Collection chapter without cards
The Coleccion chapter SHALL present the collection resources as sequential image/text moments rather than repeated card components.

#### Scenario: User enters Coleccion
- **WHEN** the user reaches the Coleccion chapter
- **THEN** collection items are presented as staged resources with image, title, and copy, not as identical rounded cards

#### Scenario: User scrolls through Coleccion
- **WHEN** the user advances through the Coleccion chapter
- **THEN** collection resources appear in a deliberate order with section-specific motion that communicates layering or arrival

### Requirement: Reformas proof chapter with scroll-scrub video and project story
The Reformas chapter SHALL preserve scroll-controlled video playback while redesigning the layout as a regular proof scene with video on the left and a concrete project narrative on the right.

#### Scenario: User enters Reformas on desktop
- **WHEN** the user reaches the Reformas chapter on desktop
- **THEN** the renovation video appears as the primary left-side resource and the right side explains location, duration, scope, and satisfaction using concrete project copy

#### Scenario: User scrolls through Reformas video
- **WHEN** the user scrolls inside the Reformas chapter
- **THEN** the renovation video advances according to scroll progress and remains controllable by the user

### Requirement: Vision chapter with sketch video and before-after slider
The Vision chapter SHALL play a supplied sketch-drawing video on entry, freeze on its final state after playback, and then expose a horizontal slider comparing the sketch to the final image.

#### Scenario: User enters Vision
- **WHEN** the user reaches the Vision chapter
- **THEN** the sketch video starts playback automatically when allowed by the browser

#### Scenario: Sketch video completes
- **WHEN** the sketch video reaches its end
- **THEN** the final sketch frame remains visible and the before-after slider becomes available

#### Scenario: User drags the Vision slider
- **WHEN** the user moves the slider from left to right
- **THEN** the visible composition transitions from sketch on the left to final image on the right according to the slider position

#### Scenario: User scrolls through Vision after video completion
- **WHEN** the user continues through the Vision chapter after the sketch video completes
- **THEN** supporting text is revealed with a writing or progressive text effect tied to the chapter narrative

### Requirement: Motion accessibility and fallbacks
The redesigned landing page SHALL preserve accessibility for users with reduced motion preferences, keyboard navigation, and assistive technology.

#### Scenario: Reduced-motion user views the narrative
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** the page shows static equivalent states, avoids scroll-dependent animation as the only way to access content, and exposes video controls where relevant

#### Scenario: Keyboard user navigates the page
- **WHEN** the user navigates with keyboard controls
- **THEN** primary navigation, video controls, and slider controls are reachable and operable without a mouse

#### Scenario: Assistive technology reads sections
- **WHEN** assistive technology traverses the page
- **THEN** the primary chapters have semantic structure, meaningful headings, and media labels or alternative text

### Requirement: Brand typography can move away from Inter
The redesigned landing page SHALL support a non-Inter display font direction for the brand title and major headings while allowing the final font asset to be supplied later.

#### Scenario: Final font is not available during implementation
- **WHEN** the final display font asset has not yet been supplied
- **THEN** the implementation uses a clearly isolated display-font token or class so the font can be replaced without redesigning the page structure

#### Scenario: Final font becomes available
- **WHEN** the final display font file or import is supplied
- **THEN** the brand title and major headings can adopt it through the display-font token or class
