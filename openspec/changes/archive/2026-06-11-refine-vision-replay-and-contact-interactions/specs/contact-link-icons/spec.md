## ADDED Requirements

### Requirement: Contact channel links display iconographic marks, not text abbreviations
The four contact links in the contact section (WhatsApp, Tel, Instagram, Map) MUST display a recognizable icon or emoji for each channel. The previous text abbreviations `WA`, `TEL`, `IG`, `MAP` MUST NOT be used as the channel marker.

#### Scenario: WhatsApp link has a recognizable icon
- **WHEN** the user views the contact section
- **THEN** the WhatsApp row shows an icon or emoji (e.g. 💬 or equivalent) inside the green-tinted marker circle, never the literal text "WA"

#### Scenario: Telephone link has a recognizable icon
- **WHEN** the user views the contact section
- **THEN** the telephone row shows an icon or emoji (e.g. 📞 or equivalent) inside the graphite-tinted marker circle, never the literal text "TEL"

#### Scenario: Instagram link has a recognizable icon
- **WHEN** the user views the contact section
- **THEN** the Instagram row shows an icon or emoji (e.g. 📷 or equivalent) inside the clay-tinted marker circle, never the literal text "IG"

#### Scenario: Map link has a recognizable icon
- **WHEN** the user views the contact section
- **THEN** the "Ver ubicación" row shows an icon or emoji (e.g. 📍 or equivalent), never the literal text "MAP"

### Requirement: Contact channel icons keep the existing per-channel tint
The marker background and text color of each channel link MUST continue to communicate the channel: WhatsApp green, Instagram clay, telephone and map graphite. The new icon MUST be rendered in the same color slot as the previous text abbreviation.

#### Scenario: WhatsApp marker stays green
- **WHEN** the user views the WhatsApp row
- **THEN** the marker circle still has the WhatsApp-green tint and the icon is readable against it

#### Scenario: Instagram marker stays clay
- **WHEN** the user views the Instagram row
- **THEN** the marker circle still has the clay/gold tint and the icon is readable against it

### Requirement: Contact channel icons have a hover microanimation
The marker icon of each contact link MUST animate on hover. The animation MUST use transform (rotation and/or scale) and a transition between 200 ms and 500 ms. No external animation libraries are introduced.

#### Scenario: Hover triggers a transform-based animation
- **WHEN** the user hovers a contact channel link
- **THEN** the marker icon animates (rotation up to ~15° and/or scale up to ~110%) using CSS transform and a transition

#### Scenario: Animation respects reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** the hover animation on the contact link icons is suppressed or reduced to opacity/background changes only

### Requirement: Contact links keep the existing 44 px tap target
The replacement of the text abbreviation by an icon MUST NOT shrink the tap target. Each link row MUST continue to meet the 44x44 CSS pixel hit area.

#### Scenario: Icon link is at least 44 px tall
- **WHEN** the user inspects any contact channel link
- **THEN** the link row is at least 44 px tall and the icon is centered within the marker circle
