## ADDED Requirements

### Requirement: Minimal is the canonical default on first paint
The page MUST load in the Minimal visual mode on first paint. The `cardless` state MUST be `true` at the initial render. The header toggle MUST reflect this by displaying the label "Tarjetas" (i.e. "switch to Tarjetas") on first paint, not "Minimal".

#### Scenario: First-time visitor
- **WHEN** a visitor lands on the page for the first time
- **THEN** the page renders in Minimal mode and the header toggle label is "Tarjetas"

#### Scenario: Visitor re-loads the page
- **WHEN** a visitor reloads the page
- **THEN** the page renders in Minimal mode regardless of any prior session state stored in the browser

### Requirement: The Tarjetas toggle stays available as a comparison switch
The header MUST continue to expose the "Tarjetas" / "Minimal" toggle. Toggling it MUST switch the visual mode of the page. The "Tarjetas" mode MUST NOT be the canonical or default state, but MUST be reachable in one click for comparison purposes.

#### Scenario: User switches to Tarjetas
- **WHEN** a user clicks the toggle while the page is in Minimal mode
- **THEN** the page transitions to the Tarjetas mode and the toggle label becomes "Minimal"

#### Scenario: User switches back to Minimal
- **WHEN** a user clicks the toggle while the page is in Tarjetas mode
- **THEN** the page transitions to the Minimal mode and the toggle label becomes "Tarjetas"
