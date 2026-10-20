## ADDED Requirements

### Requirement: Galería exacta por variante habilitada expresamente
The system SHALL enable variant photo activation only for GME enclosure products explicitly opting in through specs.variant_gallery.

#### Scenario: Basic con foto exacta
- **WHEN** a customer manually selects a mapped Basic bathtub distribution and finish
- **THEN** the gallery activates that exact photo while preserving the complete photo list
- **AND** browsing another photo does not change the chosen variant

#### Scenario: Basic sin foto exacta
- **WHEN** a customer chooses one of the seven combinations lacking an exact published photo
- **THEN** the interface states that no exact photograph is available
- **AND** keeps the selected variant valid for quotes without assigning a fabricated photo

#### Scenario: Otras familias
- **WHEN** a product has no opt-in flag
- **THEN** existing family-specific gallery behavior is preserved
