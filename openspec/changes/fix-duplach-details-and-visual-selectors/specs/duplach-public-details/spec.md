## ADDED Requirements

### Requirement: Collapsed public details container
The product detail SHALL render all public product facts and API-delivered public specification values inside a dedicated `div` content container whose visible title is a `span` inside an accessible disclosure control.

#### Scenario: Product detail opens
- **WHEN** a product detail is first rendered
- **THEN** the public details content SHALL be hidden by default, the title span SHALL be visible, and the disclosure control SHALL expose `aria-expanded="false"` with a valid `aria-controls` reference

#### Scenario: User expands public details
- **WHEN** the user activates the public-details control with a pointer, keyboard or assistive technology
- **THEN** the content `div` SHALL become visible, the control SHALL expose `aria-expanded="true"`, and the public facts and specifications SHALL be readable

#### Scenario: User collapses public details
- **WHEN** the user activates the expanded public-details control again
- **THEN** the same content `div` SHALL be hidden and the control SHALL expose `aria-expanded="false"`

### Requirement: Public details preserve existing product state
Expanding or collapsing public details SHALL NOT change the selected variant, product gallery, budget selection or displayed public values.

#### Scenario: Details toggle after variant selection
- **WHEN** a user selects a valid Duplach variant and toggles public details
- **THEN** the selected real `variantId`, gallery state and budget action SHALL remain unchanged

#### Scenario: Public specification contains structured data
- **WHEN** a product exposes maps, arrays or structured public specifications
- **THEN** the detail SHALL render a readable public representation or omit non-presentational structures and SHALL NOT display `[object Object]`, private fields or prices
