## ADDED Requirements

### Requirement: Contacto block has a clearer internal rhythm
The mobile/tablet and desktop Contacto sections MUST present the three blocks — business info (logo + name + address), contact links list, and contact form — with visibly more vertical separation than today. The rhythm is intentional: business block has more air, the contact list and form are clearly its own step.

#### Scenario: Mobile Contacto has increased spacing
- **WHEN** the user views the Contacto section on a phone
- **THEN** the vertical gap between the business block and the contact links list is visibly larger than before, and the gap between the contact links list and the contact form is also visibly larger than before

#### Scenario: Desktop Contacto has increased spacing
- **WHEN** the user views the Contacto chapter on a desktop viewport that meets the desktop gate
- **THEN** the rhythm between business / links / form is consistent with the mobile rhythm and clearly readable

#### Scenario: Minimal (canonical) variant preserves the rhythm
- **WHEN** the user is on the canonical minimal mode
- **THEN** the left-bordered blocks in the minimal Contacto section (business, links) keep their border and the increased vertical spacing above and below them

#### Scenario: Spacing rhythm does not introduce horizontal overflow
- **WHEN** the user views the Contacto section at the smallest supported viewport (375 px)
- **THEN** the page does not scroll horizontally and the contact form is fully reachable without clipping
