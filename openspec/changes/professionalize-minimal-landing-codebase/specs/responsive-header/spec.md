## ADDED Requirements

### Requirement: Header has two distinct render branches per viewport
The header MUST render two distinct layouts based on the viewport gate: a desktop branch (active on `width >= 1024` AND `height >= 720`) and a mobile/tablet branch (active on every other viewport). The mobile/tablet branch MUST NOT include the horizontal navigation or the desktop "Pedir asesoría" pill.

#### Scenario: Desktop viewport
- **WHEN** the viewport meets the desktop gate
- **THEN** the header shows the desktop layout: brand name, horizontal nav, "Tarjetas / Minimal" toggle, and a "Pedir asesoría" pill

#### Scenario: Mobile or tablet viewport
- **WHEN** the viewport does not meet the desktop gate
- **THEN** the header shows the mobile layout: compact brand mark, hamburger control, and a "Tarjetas / Minimal" toggle. The horizontal nav and the desktop pill MUST NOT be visible.

### Requirement: Hamburger drawer is the only navigation on mobile/tablet
On mobile/tablet, the hamburger control MUST be the only entry point to navigation, the visual mode toggle, and the WhatsApp CTA. Tapping the control MUST open a drawer that exposes the same four sections (`Inicio`, `Colección`, `Reformas`, `Visión`, `Contacto`) plus the visual mode toggle and a primary "Pedir asesoría" action.

#### Scenario: User opens the drawer
- **WHEN** a user taps the hamburger control
- **THEN** the drawer opens, body scroll is locked, and the user can dismiss the drawer with the Escape key, with an outside click, or with the close button

#### Scenario: User navigates from the drawer
- **WHEN** a user taps a section link in the drawer
- **THEN** the page navigates to the section and the drawer closes

### Requirement: Header derives "is Inicio" from the actual active section
The header MUST compute its "is Inicio" state from the current active section, on every viewport. On mobile/tablet, the active section MUST reflect the section currently in view (not always Inicio).

#### Scenario: User scrolls past Inicio on mobile
- **WHEN** a user on mobile scrolls past the Inicio section
- **THEN** the header's "is Inicio" state is `false` and any Inicio-specific styles are no longer applied to the header

### Requirement: All interactive header controls meet accessibility on mobile
On the mobile/tablet header, every interactive control MUST be reachable by keyboard, have a visible focus ring (clay) on focus, expose an accessible name, and have a hit area of at least 44x44 CSS pixels.

#### Scenario: Keyboard user tabs through the header
- **WHEN** a keyboard user tabs through the mobile header
- **THEN** the hamburger control, the toggle, and any primary action are reachable in a logical order with a visible focus ring
