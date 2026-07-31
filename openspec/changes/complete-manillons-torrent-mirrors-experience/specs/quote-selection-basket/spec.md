## ADDED Requirements

### Requirement: Persistent complete selections
The catalog SHALL persist complete selected variants across navigation and reload. A selection SHALL include product identity, variant identity, reference, model name, quantity and all public selected attributes without prices.

#### Scenario: Add a selected variant
- **WHEN** the user clicks `Añadir al presupuesto` on a configured product
- **THEN** the selection stores the exact `productId`, `variantId`, reference, model name, quantity and selected attributes

#### Scenario: Duplicate selected variant
- **WHEN** the user adds the same `productId + variantId` twice
- **THEN** the existing line quantity increases and no duplicate line is created

#### Scenario: Different variants of one model
- **WHEN** the user adds two different measures, finishes or versions of the same model
- **THEN** the selection retains two independent lines identified by their different variant IDs

#### Scenario: Reload selection
- **WHEN** the user reloads the catalog after adding valid lines
- **THEN** the lines and quantities are restored from local storage without reconstructing attributes from the slug

### Requirement: Review and joint quote
The application SHALL expose a visible `Presupuesto (N)` or `Mis selecciones (N)` access from the landing page and catalog header. The review view SHALL edit quantities, remove lines and submit all complete lines in `items[]` without replacing the individual quote action.

#### Scenario: Review lines
- **WHEN** the user opens the selection access
- **THEN** the view shows every line with model, reference, measure, finish, version, lighting attributes and quantity

#### Scenario: Edit quantity and remove
- **WHEN** the user changes a line quantity or removes a line
- **THEN** the persisted selection and visible count update immediately

#### Scenario: Joint quote payload
- **WHEN** the user submits the joint quote with two complete lines
- **THEN** the request contains both exact lines in `items[]` and no price fields
