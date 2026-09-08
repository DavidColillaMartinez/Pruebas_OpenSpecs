## ADDED Requirements

### Requirement: Complete Duplach budget line
The shared budget selection SHALL store every valid Duplach shower-tray line with its real product and variant identity, public attributes and quantity, without prices.

#### Scenario: A conventional Duplach variant is added
- **WHEN** the user adds a valid Stone Zeus, Stone Plus, Stone Smart, Stone Mio, Stone Side, Stone Sorty or Stone Cach variant
- **THEN** the line SHALL retain `productId`, `variantId`, real reference when present, supplier, category, model name, main image, measure, texture, color, grille, valve, orientation, finish family, finish and quantity when those values are delivered by API

#### Scenario: A Stone 3D variant is added
- **WHEN** the user selects a family and a real acabado variant and adds it
- **THEN** the line SHALL retain the real family, finish, variant identity, reference, main image and all other public selected attributes delivered by API

#### Scenario: A budget line contains a commercial field
- **WHEN** a product or variant response contains price-like fields
- **THEN** those fields SHALL NOT be stored in the line or included in the quote payload

### Requirement: Stable variant identity and quantities
The shared selection SHALL identify a line by `productId + variantId`, increment a repeated variant quantity and keep different variants independent.

#### Scenario: The same Duplach variant is added twice
- **WHEN** the same product and real variant are added more than once
- **THEN** one line SHALL remain and its quantity SHALL increase

#### Scenario: Two variants of one model are added
- **WHEN** two real variants share a product ID but have different variant IDs
- **THEN** the selection SHALL contain two independent lines

#### Scenario: A variant is incomplete or nonexistent
- **WHEN** no real `variantId` matches the selected options
- **THEN** the add action SHALL reject the line and SHALL NOT store a generic product-only entry

### Requirement: Shared persistent budget state
The catalog summary, product detail and `/presupuesto` SHALL consume the same persistent generic selection state for Duplach without automatic navigation after adding.

#### Scenario: The user adds from a product detail
- **WHEN** a valid Duplach variant is added
- **THEN** the local selection summary SHALL update without redirecting to `/presupuesto`

#### Scenario: The user navigates and reloads
- **WHEN** the user leaves the catalog and reloads the application
- **THEN** the valid Duplach lines and quantities SHALL be restored from the shared persistent store

#### Scenario: The user edits the catalog summary
- **WHEN** the user changes quantity or removes a Duplach line in the catalog summary
- **THEN** `/presupuesto` SHALL observe the same updated state

### Requirement: Public quote payload preserves all lines and attributes
The budget submission SHALL send all selected lines with their public Duplach attributes and SHALL exclude prices and technical/private fields.

#### Scenario: Multiple Duplach variants are submitted
- **WHEN** the user submits a budget containing multiple Duplach lines
- **THEN** the payload `items` array SHALL contain each independent line with its quantity, identity and selected public attributes

#### Scenario: A payload is inspected for prices
- **WHEN** a valid Duplach budget payload is serialized
- **THEN** it SHALL contain no price, precio, coste, cost, importe or equivalent commercial price field

#### Scenario: Existing providers share the store
- **WHEN** Royo, Espejos, Mamparas/GME or another existing provider is added and submitted through the same store
- **THEN** its current line identity, attributes, persistence and payload behavior SHALL remain unchanged
