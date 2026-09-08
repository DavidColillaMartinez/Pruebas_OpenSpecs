## ADDED Requirements

### Requirement: Real Duplach variant selection
The Duplach detail SHALL expose only selector values and combinations represented by real API variants or API-backed facets, including measure, texture, color, grille, valve, orientation, finish family and finish when present.

#### Scenario: Measures are selected
- **WHEN** the product has multiple API variants with different measures
- **THEN** the measure options SHALL be taken from those variants and selecting one SHALL resolve its real `variantId`

#### Scenario: An incompatible texture is encountered
- **WHEN** the active measure has no API variant for a texture
- **THEN** that texture SHALL be disabled or absent and the impossible combination SHALL NOT be addable

#### Scenario: Stone Plus has measure-specific textures
- **WHEN** a Stone Plus measure only has Pizarra variants in the API
- **THEN** Liso SHALL NOT be offered for that measure

#### Scenario: A selectable attribute is absent from the API
- **WHEN** the API does not provide a requested attribute for the product or its variants
- **THEN** the selector SHALL omit that control and the implementation SHALL document the absent field without inventing a value

### Requirement: API-backed conventional color swatches
Conventional Duplach models SHALL use API-delivered color values and SHALL show an API swatch image when associated, while retaining the real color value when no swatch image exists.

#### Scenario: A color has a published swatch
- **WHEN** the API associates a swatch URL with the selected color
- **THEN** the selector SHALL use that URL as the swatch and SHALL preserve the API color name/code

#### Scenario: A color has no published swatch
- **WHEN** the API returns a color value without an associated image
- **THEN** the selector SHALL show the real color name or value without inventing an image or deriving it from another image

### Requirement: Stone 3D family-first selection
Stone 3D SHALL require a family selection before an acabado selection and SHALL derive families and acabados from `finish_families`, `family_image_map`, `finish_family`, `finish` and `variants` delivered by the API.

#### Scenario: Stone 3D opens without a selected family
- **WHEN** the Stone 3D detail is first rendered
- **THEN** no acabado from any family SHALL be selected and the budget action SHALL remain unavailable until a complete real variant is selected

#### Scenario: A family is selected
- **WHEN** the user selects one API-delivered finish family
- **THEN** only acabados belonging to that family SHALL be displayed as selectable

#### Scenario: An acabado from another family exists in the product response
- **WHEN** a different family contains another acabado
- **THEN** that acabado SHALL NOT appear while the current family is active

#### Scenario: A family has one or more demonstration images
- **WHEN** the selected family has API-delivered demonstration images
- **THEN** those images SHALL be navigable in a family gallery separate from the main product gallery

#### Scenario: A finish swatch is shown
- **WHEN** an API-delivered acabado has a swatch image
- **THEN** the swatch SHALL be used for the selector and SHALL NOT replace or be mixed into the main product gallery

### Requirement: Complete non-destructive product gallery
The detail SHALL keep the complete `product.images` gallery, open with its API cover first, and add quick variant imagery only as a deduplicated first item when the API provides an associated product image.

#### Scenario: The detail opens
- **WHEN** a Duplach product is loaded
- **THEN** the first main image SHALL be the API cover and every unique `product.images` entry SHALL remain navigable without changing a selector

#### Scenario: A color, texture or acabado has a quick image
- **WHEN** the user manually selects a variant with an API-associated quick product image
- **THEN** that image SHALL become first while the complete original gallery remains available and duplicate URLs are removed

#### Scenario: A selected option has no quick image
- **WHEN** the user changes to a real option with no API-associated quick image
- **THEN** the current active image SHALL be preserved when it remains available and the original gallery SHALL not be replaced

#### Scenario: A swatch is the only associated image
- **WHEN** the API provides a swatch but no quick product image
- **THEN** the swatch SHALL NOT become the main product image

#### Scenario: Initial variant selection is automatic
- **WHEN** the first real variant is selected internally during initial render
- **THEN** the main cover SHALL remain first until the user manually changes a selector

### Requirement: Duplach selection emits real identity and public attributes
Changing a valid selector SHALL update the real `variantId`, reference and public attributes used by the detail and budget flows, and an invalid combination SHALL not be addable.

#### Scenario: A valid option changes
- **WHEN** the user changes measure, texture, color, grille, valve, orientation, family or finish to a compatible API value
- **THEN** the selected unit SHALL contain the matching API `variantId` and all available public selected attributes

#### Scenario: A combination has no real variant
- **WHEN** the selected values do not match any API variant
- **THEN** the UI SHALL leave the selection incomplete or disable the action and SHALL NOT create a synthetic variant
