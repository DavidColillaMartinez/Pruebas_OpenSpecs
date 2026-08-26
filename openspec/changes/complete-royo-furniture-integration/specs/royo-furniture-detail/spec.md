## ADDED Requirements

### Requirement: Royo detail uses the public API contract
The Royo product detail SHALL consume only API-delivered `modularity`, `images`, `variants`, real variant attributes and the supported `specs` fields, and SHALL activate these rules only for `supplier_id=royo` and `category_id=muebles-y-lavabos`.

#### Scenario: Modular detail is loaded
- **WHEN** the detail endpoint returns a modular Royo product
- **THEN** the page uses its `modularity`, `specs.modular_notice`, `specs.module_configuration`, `specs.finish_image_map` and real variants as provided

#### Scenario: Normal detail is loaded
- **WHEN** the detail endpoint returns a normal Royo product
- **THEN** the page uses its real variants and optional presentation/type data without applying modular-only assumptions

#### Scenario: Detail data is absent
- **WHEN** an optional Royo field is missing from the endpoint response
- **THEN** the detail keeps that field `undefined` or `null` and does not derive a replacement from the slug, name or image path

### Requirement: Selectors represent only real variant combinations
The detail SHALL derive selectors and selected units exclusively from complete API variants and their real attributes, and SHALL never generate a Cartesian product of finishes, measures, types, versions or modules.

#### Scenario: Real finish and measure combination exists
- **WHEN** a finish and measure identify a complete API variant
- **THEN** the selector can choose that variant and stores its real `variantId` and reference

#### Scenario: Combination does not exist
- **WHEN** a partial selection has no matching complete API variant
- **THEN** incompatible options are disabled or excluded, the add action remains disabled, and no synthetic variant is created

#### Scenario: One measure is available
- **WHEN** all real variants expose only one commercial measure or the measure is not a commercial choice
- **THEN** the measure is shown as information and no unnecessary measure button group is rendered

#### Scenario: Several measures are available
- **WHEN** at least two complete API variants expose different commercial measures
- **THEN** the measure selector contains only those real API values

#### Scenario: Finish or measure changes
- **WHEN** the user selects another compatible finish or measure
- **THEN** the detail resolves the corresponding real `variantId`, reference and attributes rather than retaining the previous variant identity

### Requirement: Modular and normal configuration data is not fictional commerce
The detail SHALL render module types, measures, depths and other configuration values as information unless the API associates them with exact commercial references or real variant choices.

#### Scenario: Modular configuration has no exact references
- **WHEN** `specs.module_configuration` provides module information without exact commercial variant references
- **THEN** the page displays the information and confirmation context without turning it into selectable variant buttons

#### Scenario: Normal product has real presentation types
- **WHEN** the API provides real variants or options for types such as suspended, floor-standing or reduced depth
- **THEN** only those API-backed types are selectable and incompatible types are disabled

### Requirement: Finish and type images are non-destructive shortcuts
The detail SHALL use an API-delivered finish or type image as a quick activation only when its association is unambiguous, while retaining the complete product gallery.

#### Scenario: Finish has an associated image
- **WHEN** the selected real variant or `specs.finish_image_map` provides an unambiguous finish image
- **THEN** that image becomes the first active image and all images in `product.images` remain navigable

#### Scenario: Finish has no associated image
- **WHEN** the selected finish has no unambiguous API image association
- **THEN** the active image remains unchanged, the full product gallery remains available, and the finish selection is still retained for the budget

#### Scenario: Type and finish combination has an image
- **WHEN** the API explicitly provides an image for the selected real type plus finish combination
- **THEN** that combination image is prioritized without hiding any other product gallery image

#### Scenario: No API image association exists
- **WHEN** a finish or type has no image URL delivered by the API
- **THEN** the page does not invent or reconstruct an asset URL

### Requirement: Complete product gallery remains navigable
The detail SHALL build a deduplicated gallery by placing an available quick image first and then preserving every unique API-delivered product image in order.

#### Scenario: Variant has one quick image
- **WHEN** `selectedUnit.images` contains a valid API image
- **THEN** the gallery starts with that image followed by all unique `product.images`, including the product cover

#### Scenario: Variant has no quick image
- **WHEN** `selectedUnit.images` is empty or absent
- **THEN** the gallery uses all unique `product.images` in their API order without replacing them with an empty variant image list

#### Scenario: User navigates the gallery
- **WHEN** the user chooses a thumbnail or next/previous control
- **THEN** every retained gallery image can be displayed independently of the selected finish shortcut

### Requirement: Add action requires a valid real variant
The detail SHALL keep the add-to-budget action disabled until the current selection resolves to a complete real variant with a persistent identity.

#### Scenario: Selection is incomplete
- **WHEN** a required real attribute has no compatible selected value
- **THEN** the add action is disabled and the missing or incompatible selection is communicated

#### Scenario: Selection is complete
- **WHEN** the current selection resolves to a real API variant
- **THEN** the add action is enabled and uses that variant's `variantId`, reference and selected attributes
