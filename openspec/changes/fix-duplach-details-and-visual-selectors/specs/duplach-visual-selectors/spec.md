## ADDED Requirements

### Requirement: Closed native measure selector
Every Duplach shower-tray detail whose API configuration includes `measure` SHALL expose its real compatible measures through a labelled native select control that is closed by default.

#### Scenario: Conventional Duplach detail opens
- **WHEN** Stone Zeus, Stone Plus, Stone Smart, Stone Mio, Stone Side, Stone Sorty or Stone Cach is rendered
- **THEN** the measure control SHALL be a closed native select containing only API-delivered measures and SHALL NOT render the full measure list as individual buttons

#### Scenario: Stone 3D detail opens
- **WHEN** Stone 3D is rendered
- **THEN** its measure control SHALL also be a closed native select containing only API-delivered measures

#### Scenario: Measure changes
- **WHEN** the user chooses a different real measure
- **THEN** incompatible texture, color, grille, orientation, family or finish values SHALL be hidden or disabled and the selector SHALL never create a synthetic combination

### Requirement: API-backed conventional color swatches
Conventional Duplach models SHALL show one visual color option for each available API color using `specs.selector_images.colors[].filename` and SHALL NOT use `color_image_map` gallery images as color swatches.

#### Scenario: Color has a published swatch
- **WHEN** an API color has a matching `name` or `code` and a relative `filename`
- **THEN** the selector SHALL resolve that filename with the public asset base URL, display the swatch as the dominant part of its card, and preserve the API color value

#### Scenario: Color has no published swatch
- **WHEN** an available API color has no usable swatch filename
- **THEN** the selector SHALL preserve the real color name with an accessible text fallback and SHALL NOT derive an image from a gallery, CSS color or another option

#### Scenario: User selects a color
- **WHEN** the user activates a compatible color swatch for the first time
- **THEN** the swatch SHALL become selected, expose `aria-pressed="true"`, and resolve the corresponding real variant identity

#### Scenario: User enlarges a selected color
- **WHEN** the user activates the already selected color swatch a second time
- **THEN** only that swatch card SHALL enter its enlarged visual state, expose the corresponding expanded state, and leave the variant identity unchanged

### Requirement: Accessible visual color cards
Color swatch cards SHALL remain understandable and operable without relying on hover-only text.

#### Scenario: Pointer hovers a color card
- **WHEN** the pointer hovers a swatch card
- **THEN** a label containing the API color name SHALL appear without replacing the image

#### Scenario: Keyboard focuses a color card
- **WHEN** a keyboard user focuses a swatch card
- **THEN** the API color name, selected state and enlarged state SHALL be available through its accessible name and ARIA state, with a visible focus indicator

### Requirement: Stone 3D finish swatches
Stone 3D SHALL show only API-delivered finishes belonging to the selected family as visual swatch cards using `finish_image_map[familyKey:finish]` when a swatch is published.

#### Scenario: No Stone 3D family is selected
- **WHEN** Stone 3D first renders without an active family
- **THEN** no finish from any family SHALL be selected or shown as the active finish choice

#### Scenario: A Stone 3D family is selected
- **WHEN** the user selects an API-delivered finish family
- **THEN** the selector SHALL show only the real finishes associated with that family and SHALL not show finishes from another family

#### Scenario: User selects and enlarges a finish
- **WHEN** the user activates a finish swatch and then activates the same selected swatch again
- **THEN** the first activation SHALL select the real finish variant and the second SHALL enlarge only the swatch card without changing the selected variant or inserting the swatch into the main gallery
