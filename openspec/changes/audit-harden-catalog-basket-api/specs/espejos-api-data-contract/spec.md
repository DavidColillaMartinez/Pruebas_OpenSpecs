## ADDED Requirements

### Requirement: Espejos listing projects stored characteristics and facets
When the Espejos context is active, the public listing contract SHALL expose stored values and valid facets for `shape`, `has_led`, `lighting_type`, `lighting_technology`, `light_temp`, `finish`, `collection`, and `subcategory`, while retaining existing fields.

#### Scenario: Category activates Espejos context
- **WHEN** the request contains `category=espejos`
- **THEN** the response includes the contextual Espejos filters and counts based on returned products/variants

#### Scenario: Supplier activates Espejos context
- **WHEN** the request contains `supplier=manillons-torrent` without a category
- **THEN** the same Espejos characteristics and facets are available when the API data supports them

#### Scenario: Facet has no matching results
- **WHEN** a dependent facet value would return zero results under the active filters
- **THEN** that value is not offered as an enabled option

### Requirement: LED and lighting filters use explicit API values
The API and frontend SHALL distinguish explicit LED values from absent values and SHALL filter `Con LED`, `Sin LED`, and lighting types using stored product or variant data only.

#### Scenario: Explicit LED true is filtered
- **WHEN** the user selects `Con LED`
- **THEN** only products or variants with an explicit LED-enabled value are returned

#### Scenario: Explicit LED false is filtered
- **WHEN** the user selects `Sin LED`
- **THEN** only products or variants with an explicit LED-disabled value are returned

#### Scenario: LED value is absent
- **WHEN** a product or variant does not provide `has_led`
- **THEN** it is not silently converted to `false` and is not included in either boolean result solely because the field is absent

### Requirement: Contextual filters clean up outside Espejos
Espejos-only filter values and URL parameters SHALL be removed when the active context no longer supports them, while GME/Mamparas contextual filters SHALL continue to function.

#### Scenario: User leaves Espejos context
- **WHEN** category and supplier no longer identify the Espejos context
- **THEN** shape, LED, lighting, and Espejos-only URL parameters are cleared

#### Scenario: GME context remains active
- **WHEN** a GME/Mamparas context is selected
- **THEN** its existing filter profiles and result behavior remain intact

### Requirement: Variant-specific specification data is authoritative
Product detail and quote snapshots SHALL prefer the active variant’s explicit attributes and SHALL omit unavailable values instead of using generic or inferred text.

#### Scenario: Variant changes lighting technology
- **WHEN** the active variant changes to one with a different technology or light temperature
- **THEN** the detail specification and snapshot update to that variant’s values

#### Scenario: Variant has no LED
- **WHEN** the active variant explicitly indicates no LED
- **THEN** the detail displays a coherent no-LED value and does not show unrelated lighting values
