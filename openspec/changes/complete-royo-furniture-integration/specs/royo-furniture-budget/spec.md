## ADDED Requirements

### Requirement: Royo furniture uses the generic selection basket
All Royo modular and normal furniture SHALL be added through the existing generic selection state, with a concrete `productId + variantId` identity and no product-only fallback when a real variant exists.

#### Scenario: Add a valid modular furniture variant
- **WHEN** the user adds a complete modular Royo variant
- **THEN** the basket stores its exact product and variant identifiers through the generic basket

#### Scenario: Add a valid normal furniture variant
- **WHEN** the user adds a complete normal Royo variant
- **THEN** the basket stores its exact product and variant identifiers through the generic basket

#### Scenario: No complete variant exists
- **WHEN** the selected Royo product has no complete real variant
- **THEN** the item cannot be added and no generic product-only line is stored

### Requirement: Budget lines preserve public selected data without prices
A Royo budget line SHALL preserve, when delivered or selected, `productId`, `variantId`, SKU/reference, supplier, category, product name, main image, all real selected attributes, measure, finish, furniture type, module type and quantity, and SHALL NOT contain price fields.

#### Scenario: Complete Royo line is created
- **WHEN** a complete real Royo variant is added
- **THEN** the line contains the available public product and variant data and omits price, source price, cost and equivalent fields

#### Scenario: Optional attribute is absent
- **WHEN** the API does not deliver an optional type, module type, measure or finish
- **THEN** the line omits that attribute or preserves it as undefined according to the existing payload contract rather than inventing a value

### Requirement: Basket identity controls quantity merging
The basket SHALL merge only lines with the same `productId + variantId` and SHALL retain different real variants of the same product as independent lines.

#### Scenario: Same variant is added twice
- **WHEN** the user adds the same Royo product and variant twice
- **THEN** one line remains and its quantity increases

#### Scenario: Different variant of the same model is added
- **WHEN** the user adds another real finish, measure, type or other variant of the same Royo model
- **THEN** a separate line is created with the second variant's identity and attributes

### Requirement: Catalog summary and budget page share persisted state
The catalog summary and `/presupuesto` SHALL read and mutate the same generic basket state, which SHALL survive navigation and reload without reconstructing attributes from a slug or product name.

#### Scenario: Navigate from catalog to budget
- **WHEN** the user adds a Royo line and opens `/presupuesto`
- **THEN** the budget page displays the same line, quantity, image and selected attributes as the catalog summary

#### Scenario: Reload after adding
- **WHEN** the user reloads the catalog or `/presupuesto` after adding Royo lines
- **THEN** all valid lines and quantities are restored from the persisted basket state

#### Scenario: Edit budget lines
- **WHEN** the user changes a quantity or removes a line in `/presupuesto`
- **THEN** the shared state and catalog summary count update consistently

### Requirement: Final budget payload contains all lines and no prices
The final budget request SHALL include every selected line in `items[]`, preserving each line's real identifiers and public attributes, and SHALL exclude prices.

#### Scenario: Submit multiple Royo variants
- **WHEN** the user submits a budget containing two different Royo variants
- **THEN** the payload contains two corresponding entries in `items[]` with their quantities and real attributes

#### Scenario: Submit mixed existing families
- **WHEN** the basket contains Royo lines together with existing Espejos, Mamparas/GME or other-provider lines
- **THEN** the payload includes all complete lines using the existing generic contract without changing those families' behavior

#### Scenario: Price data is present upstream
- **WHEN** an upstream response contains price-like fields
- **THEN** the budget line and final payload omit those fields

### Requirement: Adding provides local feedback without forced navigation
Adding a valid Royo line SHALL provide brief feedback in the current catalog context and SHALL NOT automatically navigate to `/presupuesto`.

#### Scenario: Add from product detail
- **WHEN** the user adds a valid Royo variant
- **THEN** the current catalog/detail page remains open and a concise success or selection feedback is shown

#### Scenario: Existing family add flow
- **WHEN** the user adds an Espejos, Mamparas/GME or other-provider line
- **THEN** its existing basket behavior remains unchanged
