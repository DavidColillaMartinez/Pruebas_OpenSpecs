## MODIFIED Requirements

### Requirement: Page has a skip-to-content link
The page SHALL provide a "Saltar al contenido" link as the first focusable element. The link SHALL be visually hidden by default and become visible on focus.

#### Scenario: Keyboard user tabs to the first focusable element
- **WHEN** a keyboard user tabs once from the address bar
- **THEN** the "Saltar al contenido" link becomes visible and is activated on Enter, moving focus to the main content

### Requirement: Semantic landmarks and heading order
The page SHALL expose semantic landmarks and a strict heading order. There MUST be one `<h1>` (in the Inicio section). Each chapter section SHALL have exactly one `<h2>`. Heading levels MUST NOT be skipped.

#### Scenario: Screen reader traverses the page
- **WHEN** assistive technology traverses the page
- **THEN** the heading order is `h1` followed by `h2` per section, and each section is exposed as a `<section>` with a heading reference

### Requirement: Focus is visible on every interactive element
The page SHALL keep a visible focus indicator on every interactive element. CSS MUST NOT remove outlines globally. Focus indicators MUST have at least 3:1 contrast against the surrounding surface.

#### Scenario: Keyboard user focuses a link
- **WHEN** a keyboard user focuses a link or button
- **THEN** a visible focus ring appears around the element

### Requirement: Tap targets meet 44px
On viewports below the desktop gate, every interactive element MUST have at least a 44x44 CSS pixel hit area.

#### Scenario: User taps header buttons on mobile
- **WHEN** a user views the header on a mobile viewport
- **THEN** the hamburger, the toggle, and the "Pedir asesoría" CTA each have at least 44x44 CSS pixel hit area

### Requirement: Reduced motion disables autoplay and heavy transitions
The page SHALL respect `prefers-reduced-motion: reduce`. On reduced motion, the Vision section MUST NOT autoplay its video on small viewports, and CSS animations MUST be limited to a safe minimum duration.

#### Scenario: Reduced motion user reaches Vision
- **WHEN** a user with `prefers-reduced-motion: reduce` reaches the Vision section on a mobile/tablet viewport
- **THEN** the video does not autoplay and a poster is shown until the user explicitly starts playback

### Requirement: Forms expose labels
Every form input on the page MUST have a visible `<label>` with a matching `<span>` text. Required fields MUST also be marked with `aria-required="true"` and `required`. The contact form MUST be a real submit form, not an anchor.

#### Scenario: Screen reader reads the contact form
- **WHEN** assistive technology focuses an input in the contact form
- **THEN** the input announces a meaningful label and, if required, its required state

#### Scenario: User submits the contact form
- **WHEN** a user fills in the required fields and submits the form
- **THEN** the browser blocks submission of empty required fields and announces the missing field
