## ADDED Requirements

### Requirement: Distribution participates in the catalog contract
The catalog frontend SHALL represent `distribution` as a typed facet, persist it in catalog URL state, send selected distribution values to the product-list API, and normalize distribution facets and variant values returned by the API.

#### Scenario: Distribution query round trip
- **WHEN** a catalog URL contains one or more `distribution` parameters
- **THEN** the frontend preserves those values through query parsing and serialization and sends them as distribution request filters

#### Scenario: Distribution response normalization
- **WHEN** the API returns distribution facet options with labels and counts and variants with distribution values
- **THEN** the normalized catalog data preserves those API-provided values without deriving them from references, identifiers, attributes, or image paths

### Requirement: Mamparas filters use API-driven commercial facets
When the active catalog context is Mamparas, the filter panel SHALL present each available API facet in the order Tipo (`subcategory`), Modelo (`collection`), Distribución (`distribution`), and Acabado (`finish`). The frontend SHALL use API-provided option values, labels, and counts and SHALL NOT encode model, finish, distribution, or compatibility data in source code.

#### Scenario: Mamparas facet order and labels
- **WHEN** Mamparas facets contain subcategory, collection, distribution, and finish options
- **THEN** the filter panel renders them as Tipo, Modelo, Distribución, and Acabado in that order

#### Scenario: Missing optional facet
- **WHEN** the API omits one of the Mamparas facet groups
- **THEN** the panel omits that group without inventing options and preserves the relative order of the remaining groups

#### Scenario: API counts are displayed
- **WHEN** a Mamparas facet option has an API-provided count
- **THEN** the panel displays that count unchanged beside the corresponding option

### Requirement: Every facet option remains accessible
The filter panel SHALL provide access to every option returned by the API and SHALL NOT permanently hide options after the eighth item.

#### Scenario: Expand a long option list
- **WHEN** a facet contains more than eight options and the user activates Ver todas
- **THEN** every API-provided option becomes visible and the control changes to Ver menos

#### Scenario: Collapse a long option list
- **WHEN** all options are visible and the user activates Ver menos
- **THEN** the list returns to its compact state without losing or concealing an active selection

### Requirement: GME enclosure selection always identifies a real variant
For a GME enclosure model with multiple variants, the product selector SHALL expose Acabado as the primary control followed by Distribución, and every selection state emitted to the product page SHALL correspond to one exact API-provided variant. The selector SHALL NOT generate finish/distribution combinations that are absent from the product variants.

#### Scenario: Initial exact selection
- **WHEN** a GME enclosure detail has multiple variants
- **THEN** the selector initializes from the first source-ordered real variant and emits that exact unit

#### Scenario: Finish change preserves a compatible distribution
- **WHEN** the user changes Acabado and the current Distribución exists for that finish
- **THEN** the selector chooses the exact variant with the new finish and current distribution

#### Scenario: Finish change falls back to a valid distribution
- **WHEN** the user changes Acabado and the current Distribución does not exist for that finish
- **THEN** the selector chooses the first source-ordered real variant for the new finish

#### Scenario: Distribution options depend on finish
- **WHEN** an Acabado is selected
- **THEN** the Distribución control contains only distributions present on real variants with that finish

#### Scenario: Distribution click selects an exact unit
- **WHEN** the user activates a visible Distribución option
- **THEN** the selector emits the exact real variant matching the selected finish and distribution, including its variant identity and reference

### Requirement: Variant controls expose only commercial labels
The GME enclosure selector SHALL display only API-provided finish and distribution display values. It SHALL NOT display `finishCode`, arbitrary technical attributes, or Aluminio in place of the API's commercial Cromo finish.

#### Scenario: Technical fields remain hidden
- **WHEN** a variant contains `finishCode` and additional technical attributes
- **THEN** no selector control or option is rendered for those fields

#### Scenario: Commercial Cromo label is preserved
- **WHEN** the API supplies Cromo as a variant finish while also supplying a different technical finish code
- **THEN** the selector displays Cromo and does not display or translate the technical code

### Requirement: Detail galleries follow API image ownership
The product detail page SHALL use selected-unit images when the exact selected unit has images and SHALL otherwise use the product images, preserving the existing `selectedUnit?.images?.length ? selectedUnit.images : product.images` behavior. The frontend SHALL NOT construct image routes.

#### Scenario: Shower selection changes imagery
- **WHEN** a user changes to a real variant with its own images on `gme-mamparas-ducha-open` or `gme-mamparas-ducha-glass`
- **THEN** the gallery displays the selected variant's API-provided images

#### Scenario: Bath selection preserves product gallery
- **WHEN** a user changes finish or distribution on `gme-mamparas-banera-basic` or `gme-mamparas-banera-screen` and those variants have no images
- **THEN** the gallery continues to display the complete API-provided `product.images` collection

#### Scenario: Image paths are not inferred
- **WHEN** a selected variant or product lacks a usable API-provided image URL
- **THEN** the frontend uses its existing fallback behavior and does not build a URL from model, finish, distribution, slug, or filename conventions

### Requirement: Representative GME behavior is regression tested
The catalog test suite SHALL cover query and normalization behavior, Mamparas filters, dependent finish/distribution combinations, shower image changes, and bath gallery preservation using representative data for the specified GME model slugs.

#### Scenario: Required model coverage
- **WHEN** the catalog test suite runs
- **THEN** its fixtures and assertions cover `gme-mamparas-ducha-open`, `gme-mamparas-ducha-glass`, `gme-mamparas-banera-basic`, and `gme-mamparas-banera-screen` across their applicable filter, selection, and gallery behaviors
