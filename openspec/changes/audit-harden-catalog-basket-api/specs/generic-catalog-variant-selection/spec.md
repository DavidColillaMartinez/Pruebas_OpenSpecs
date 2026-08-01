## ADDED Requirements

### Requirement: Variant controls derive only from real selectable variants
The catalog SHALL build selection controls from complete API variants and declared configurable attributes, and SHALL not derive options from names, descriptions, slugs, images, technical dimensions, or incompatible variants.

#### Scenario: A model has one technical measure
- **WHEN** all real variants expose the same measure and there is no commercial measure choice
- **THEN** the measure is rendered as information and no measure button group is shown

#### Scenario: A model has multiple commercial measures
- **WHEN** at least two complete variants of the same model differ by measure and the measure is part of the quote
- **THEN** the measure selector contains only those real variant values

#### Scenario: A combination has no matching variant
- **WHEN** the user selects attributes that do not identify a complete API variant
- **THEN** incompatible options are disabled, the add action is disabled, and no generic product line can be created

### Requirement: Variant selection is family-independent
The same selection and quote-line pipeline SHALL support Espejos, Mamparas/GME, and other publishable families using their real attributes, without an Espejos-only add-to-budget branch.

#### Scenario: An Espejo variant is selected
- **WHEN** the user chooses available measure, finish, version, and lighting attributes
- **THEN** the selected complete variant resolves its own `variantId`, reference, and attributes

#### Scenario: A GME variant is selected
- **WHEN** the user chooses available measure, finish, glass, opening, orientation, or other declared GME attributes
- **THEN** the same pipeline resolves a complete GME variant and can add it to the budget

#### Scenario: A family exposes different attributes
- **WHEN** another publishable family exposes a different set of API attributes
- **THEN** only that family’s real attributes are shown and the shared pipeline does not add Espejos-only controls

### Requirement: Add-to-budget requires a complete variant
The add action SHALL be disabled until a valid complete variant exists and SHALL provide a concise explanation of any required selection that is missing.

#### Scenario: Required selection is incomplete
- **WHEN** one or more required configurable attributes have no selected compatible value
- **THEN** the add action is disabled and the missing selection is identified

#### Scenario: Valid variant is selected
- **WHEN** all required attributes resolve to one complete API variant
- **THEN** the add action is enabled and adds that exact variant without prices
