## ADDED Requirements

### Requirement: Reformas section renders between Method and Vision
The page SHALL render a "Reformas" section with id `reformas` between the Method section (`#metodo`) and the Vision section (`#vision`). The section background SHALL use the mist color (#d9e4e2) from the design system.

#### Scenario: Section appears in page flow
- **WHEN** the landing page loads
- **THEN** the Reformas section is visible between Method and Vision in the scroll order

#### Scenario: Section has correct spacing
- **WHEN** the section renders
- **THEN** it uses `px-4 py-20 sm:px-6` outer padding and `max-w-7xl mx-auto` inner container, consistent with all other page sections

### Requirement: Stopmotion video renders with scroll-driven playback
The section SHALL display the renovation stopmotion video from `assets/Reformas/Baño/`. The video element SHALL have `muted`, `playsInline`, and `preload="auto"` attributes. As the user scrolls through the section, the scroll position SHALL map to `video.currentTime` so that advancing scroll position advances the video and reversing scroll position reverses the video.

#### Scenario: Scrolling forward advances the renovation
- **WHEN** the user scrolls down while the video container is sticky in the viewport
- **THEN** the video `currentTime` increases proportionally to scroll distance at approximately 150px of scroll per second of video

#### Scenario: Scrolling backward reverses the renovation
- **WHEN** the user scrolls up while the video container is sticky in the viewport
- **THEN** the video `currentTime` decreases proportionally, showing the renovation in reverse

#### Scenario: Video completes when user scrolls past the section
- **WHEN** the user scrolls past the full virtual height of the scroll-driven area
- **THEN** `video.currentTime` equals the video duration (13.7 seconds) and the section releases the sticky behavior, resuming normal scroll

#### Scenario: Video starts from beginning on re-entry
- **WHEN** the user scrolls back up and re-enters the section from above
- **THEN** `video.currentTime` maps from the beginning of the video again

### Requirement: Progress indicator shows playback position
A horizontal progress bar SHALL be displayed below the video container. The bar SHALL fill from left to right as the video progresses, visually reflecting the current scroll-driven playback position.

#### Scenario: Progress bar fills with scroll
- **WHEN** the user scrolls through the section
- **THEN** the progress bar fill width matches the ratio of `video.currentTime / video.duration`

#### Scenario: Progress bar reverses on scroll up
- **WHEN** the user scrolls upward
- **THEN** the progress bar fill retracts proportionally

### Requirement: Reduced motion fallback
Under `prefers-reduced-motion: reduce`, the section SHALL NOT use scroll-driven playback. The video SHALL render with standard browser controls (`controls` attribute) and the user SHALL use the native play/pause to view the video.

#### Scenario: Reduced motion preference detected
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** the video renders with `controls` attribute and scroll-driven playback is disabled

#### Scenario: Reduced motion video is accessible
- **WHEN** the reduced-motion fallback is active
- **THEN** the video element responds to standard keyboard controls (Space for play/pause, arrow keys for seek)

### Requirement: Video container follows design system
The video container SHALL use `rounded-[2rem]` corners, `shadow-soft` elevation, and `overflow-hidden` to clip the video to the rounded corners. It SHALL be contained within the `max-w-7xl` grid and have a subtle border (`border border-white/70`).

#### Scenario: Video container visual styling
- **WHEN** the section renders
- **THEN** the video is clipped to rounded-[2rem] corners with shadow-soft and a white border

### Requirement: Section presents renovation content
The section SHALL display a heading introducing Bath Studio renovation work, body copy describing the specific bathroom renovation shown in the video, and a list of materials/products used in the project.

#### Scenario: Heading and copy render
- **WHEN** the section is visible
- **THEN** the heading and body copy are displayed above and below the video with proper typographic hierarchy (Inter 600 for heading, Inter 400 for body, tracking -0.04em on heading, text-wrap-balance)

#### Scenario: Material callouts render
- **WHEN** the section renders
- **THEN** a list of materials used in the renovation (mampara a medida, plato de ducha texturizado, griferia premium) is displayed as subtle tag-like elements below the video
