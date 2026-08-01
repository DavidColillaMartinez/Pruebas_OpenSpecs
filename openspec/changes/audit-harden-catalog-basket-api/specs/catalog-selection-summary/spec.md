## ADDED Requirements

### Requirement: Catalog summary shares the persistent basket state
The in-catalog selection summary and `/presupuesto` SHALL read and mutate the same versioned selection store, including immediate count, quantity, removal, and variant identity changes.

#### Scenario: A line is added from the catalog
- **WHEN** the user adds a complete variant without leaving the catalog
- **THEN** the summary and header counter show the new line immediately

#### Scenario: The same variant is added twice
- **WHEN** the same `productId` and `variantId` are added again
- **THEN** the shared line quantity increases rather than creating a duplicate line

#### Scenario: A different variant is added
- **WHEN** another `variantId` of the same product is added
- **THEN** the summary shows an independent line with its own attributes and quantity

### Requirement: Desktop catalog includes a compact right-hand summary
At desktop widths the catalog SHALL retain filters on the left, results in the main area, and a compact sticky summary on the right when sufficient space exists; the summary SHALL not cover content or replace `/presupuesto`.

#### Scenario: Summary contains selections
- **WHEN** one or more lines exist
- **THEN** each compact entry shows a small image, product name, relevant variant attributes, quantity controls, removal action, and a clear link to `/presupuesto`

#### Scenario: Summary is empty
- **WHEN** no lines exist
- **THEN** the right-hand area shows a useful unobtrusive empty state without competing with filters or the product grid

### Requirement: Tablet and mobile summary is an accessible panel
At tablet and mobile widths the summary SHALL become a compact button or bar that opens an accessible panel without navigating away from the catalog.

#### Scenario: Panel opens from the catalog
- **WHEN** the user activates the summary control
- **THEN** the panel opens with an accessible name, traps or manages focus appropriately, supports internal scrolling, and exposes quantity/removal actions

#### Scenario: Panel closes
- **WHEN** the user presses Escape, activates close, or completes a close action
- **THEN** the panel closes and focus returns to the control that opened it

### Requirement: Persisted selections survive compatible navigation and reloads
The basket SHALL persist valid lines across route navigation and page reloads, and SHALL safely ignore or migrate incompatible legacy localStorage records.

#### Scenario: Catalog-to-detail-to-catalog navigation
- **WHEN** a user adds a line, opens a detail page, and returns to the catalog
- **THEN** the line, quantity, selected attributes, and counter remain available

#### Scenario: Legacy record is incompatible
- **WHEN** the store hydrates an old record without a valid variant identity or required snapshot fields
- **THEN** the record is migrated only when safe or discarded without crashing or creating a generic line
