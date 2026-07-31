## ADDED Requirements

### Requirement: Complete selected variant line
The individual quote request SHALL send the exact selected real variant, including `productId`, `variantId` when available, reference and `selectedAttributes` containing every public non-empty attribute of that variant. It SHALL reject or prevent a partial product-only selection.

#### Scenario: Manillons Torrent quote
- **WHEN** the user submits a quote for a configured Espejos model
- **THEN** the item identifies the product and exact variant and includes its reference plus all selected public attributes, including measure, finish and version when present

#### Scenario: No synthetic combination
- **WHEN** the current UI state does not map to a complete real variant
- **THEN** the quote action does not submit a partial item and the user receives a recoverable validation state

#### Scenario: Other family attributes remain extensible
- **WHEN** a quote is created for a non-Espejos product
- **THEN** its item can include public attributes such as finish, distribution or other API-provided fields without changing the item contract

### Requirement: Multi-item-ready quote contract
The quote payload SHALL retain `items[]` as the collection boundary and SHALL accept multiple complete lines without reducing validation or serialization to a single product. The joint selection UI SHALL use the same complete item contract.

#### Scenario: Existing individual request
- **WHEN** the current individual quote form is submitted
- **THEN** it sends one complete item inside `items[]` and does not replace the individual request with a basket flow

#### Scenario: Multiple complete items
- **WHEN** a caller constructs a payload with multiple complete item lines
- **THEN** validation and serialization preserve every line, its quantity and its complete selected attributes

### Requirement: Price-free quote snapshot
The quote item and selected attribute snapshot SHALL exclude source prices, commercial prices and currency values while retaining public configuration attributes and reference data.

#### Scenario: Snapshot excludes prices
- **WHEN** a selected Espejos variant contains redacted or excluded price fields in API/raw data
- **THEN** the generated item omits those fields and still includes the complete public configuration snapshot

### Requirement: Safe quote validation tests
Quote payload tests SHALL construct and validate payloads locally and SHALL never POST a real budget request.

#### Scenario: Local payload verification
- **WHEN** the quote payload test suite exercises a selected variant, invalid identifiers, missing contact or missing consent
- **THEN** it asserts the generated item and validation errors without calling the quote endpoint
