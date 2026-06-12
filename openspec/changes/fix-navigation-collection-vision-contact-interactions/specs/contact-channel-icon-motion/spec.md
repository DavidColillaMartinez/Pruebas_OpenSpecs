## ADDED Requirements

### Requirement: Contact channel icons are visually recognizable
The Contacto section SHALL use recognizable SVG icons for WhatsApp, telephone, Instagram, and map/location channels. The icons MUST remain legible at the sizes used in desktop and mobile.

#### Scenario: WhatsApp icon is recognizable
- **WHEN** the user views a WhatsApp contact link
- **THEN** the icon reads as WhatsApp/chat/phone and does not contain duplicated or confusing strokes

#### Scenario: Instagram icon is recognizable
- **WHEN** the user views an Instagram contact link
- **THEN** the icon reads as an Instagram camera and is not visually reduced to a solid square

#### Scenario: Map icon is recognizable
- **WHEN** the user views a location contact link
- **THEN** the icon reads as a map/pin and the map and pin are visually separated

### Requirement: Contact channel hover animations work per channel
Each contact channel icon SHALL animate on hover and keyboard focus using a channel-specific microinteraction. The animations MUST be transform and/or opacity based and MUST not move the link layout.

#### Scenario: WhatsApp hover animation works
- **WHEN** the user hovers a WhatsApp link
- **THEN** the WhatsApp icon performs a short message/pop style animation

#### Scenario: Telephone hover animation works
- **WHEN** the user hovers a telephone link
- **THEN** the telephone icon performs a short vibration animation

#### Scenario: Instagram hover animation works
- **WHEN** the user hovers an Instagram link
- **THEN** the Instagram icon performs a camera/shutter or flash animation without obscuring the icon at rest

#### Scenario: Map hover animation works
- **WHEN** the user hovers a location link
- **THEN** the map icon performs a map-opening or pin-lift animation

#### Scenario: Reduced motion suppresses contact icon animations
- **WHEN** the user has reduced motion enabled
- **THEN** contact icon hover/focus animations are removed or reduced to non-motion styling
