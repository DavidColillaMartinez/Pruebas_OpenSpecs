## ADDED Requirements

### Requirement: Selection uses only real API units
The system SHALL derive selectable units from variants, offers, or commercial offer variants present in the normalized detail and SHALL NOT generate a Cartesian product of attributes.

#### Scenario: Attributes imply impossible combination
- **WHEN** no returned selectable unit contains a partial attribute combination
- **THEN** the UI disables or removes that combination

#### Scenario: Real combination selected
- **WHEN** the user selects attributes matching a returned unit
- **THEN** the system stores that unit's persistent identifiers rather than array indexes

### Requirement: Deterministic initial selection
The system SHALL choose an initial selection using the only valid unit, then an API default, then the first public complete unit in API order.

#### Scenario: One valid unit
- **WHEN** exactly one valid selectable unit exists
- **THEN** it is selected automatically

#### Scenario: Default unit exists
- **WHEN** multiple units exist and one is marked as default by the confirmed contract
- **THEN** the marked unit is initially selected

#### Scenario: No default unit exists
- **WHEN** multiple units exist without a confirmed default
- **THEN** the first public complete unit is selected

### Requirement: Compatible option controls
Attribute controls SHALL expose only public selected attributes and SHALL recompute compatible choices from the real units after each change.

#### Scenario: User changes one attribute
- **WHEN** the current selection becomes incompatible with the new attribute
- **THEN** the system selects a deterministic compatible unit or asks for the remaining required choice without creating a new unit

#### Scenario: Option unavailable
- **WHEN** an attribute value has no compatible unit under the current partial selection
- **THEN** its control is disabled and communicates unavailability accessibly

### Requirement: Selection updates dependent product data
Changing the selected unit SHALL update only data that the confirmed contract associates with that unit.

#### Scenario: Variant changes reference and media
- **WHEN** the user selects a unit with its own reference and images
- **THEN** the visible reference and gallery update to those values

#### Scenario: Product-level field does not vary
- **WHEN** a public field has no variant-specific value
- **THEN** the product-level value remains visible

### Requirement: Persistent selection identifiers
The current selection SHALL preserve `product_id` and, when present, `variant_id` and `commercial_offer_variant_id` from the API.

#### Scenario: Quote item is constructed
- **WHEN** the user opens or submits the quote form
- **THEN** the item uses the persistent identifiers from the current real unit

### Requirement: Minimal readable variant snapshot
The system SHALL build a `variant_snapshot` containing only visible selected attributes and SHALL NOT include the complete API object.

#### Scenario: Selected unit has public attributes
- **WHEN** a quote item is built
- **THEN** the snapshot includes public values such as reference, measure, finish, color, or confirmed dynamic attributes

#### Scenario: Attribute is absent
- **WHEN** a conceptual attribute is not present in the selected unit
- **THEN** it is omitted from the snapshot rather than sent as null or invented
