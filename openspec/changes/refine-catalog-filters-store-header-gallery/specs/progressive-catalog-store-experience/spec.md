## ADDED Requirements

### Requirement: Initial filters show only general contexts
The catalog filter surface SHALL show only Categoría and Proveedor when no general filter context is selected. It SHALL hide Acabado, Medida, Colección, Subcategoría, Distribución, and Tipo de producto in that initial state without removing those fields from the API contract or query model.

#### Scenario: First catalog visit
- **WHEN** the catalog opens with no category, supplier, search, or dependent filter selected
- **THEN** the visible filter groups are only Categoría and Proveedor

#### Scenario: General filter values remain API-driven
- **WHEN** the API returns category and supplier options
- **THEN** the initial filter surface displays those API-provided labels and counts without adding local options

### Requirement: General context activates dependent profiles
When a category or supplier is selected, the catalog SHALL activate the dependent filter profile available for that context. A selected category SHALL take precedence when both category and supplier are selected. A selected GME supplier SHALL activate the developed Mamparas profile even before a category is selected, while all option values and counts SHALL remain scoped to the active API response.

#### Scenario: Category activates its profile
- **WHEN** a user selects a category with a developed dependent filter profile
- **THEN** the catalog displays that profile's groups and hides unrelated root-level taxonomy groups

#### Scenario: GME activates Mamparas filters
- **WHEN** a user selects the GME supplier without selecting a category
- **THEN** the catalog activates the developed Mamparas filter profile rather than exposing the full catalog taxonomy

#### Scenario: Category scopes a supplier
- **WHEN** a user selects both a category and GME
- **THEN** the selected category profile is used and its API-provided options are constrained by the supplier query

### Requirement: Mamparas filters stay category-scoped
When the active profile is Mamparas, the catalog SHALL present Tipo (`subcategory`), Modelo (`collection`), Distribución (`distribution`), and Acabado (`finish`) in that order. Each option SHALL come from the active API response and SHALL represent only products in the active Mamparas context.

#### Scenario: Mamparas type options
- **WHEN** Mamparas is the active category context
- **THEN** Tipo contains only API-provided Mamparas de ducha and/or Mamparas de bañera options available in that context

#### Scenario: Mamparas model options
- **WHEN** Mamparas is selected
- **THEN** Modelo contains only API-provided Mamparas models and their active-query counts

#### Scenario: Dependent distribution and finish options
- **WHEN** Mamparas or one of its types is selected
- **THEN** Distribución and Acabado contain only values and counts returned for that active Mamparas query

#### Scenario: No unrelated technical groups
- **WHEN** the Mamparas profile is rendered
- **THEN** Medida and Tipo de producto are not displayed unless a future explicit profile requires them

### Requirement: Category selection is single-context
The catalog SHALL treat category as one active selection. Selecting a category SHALL replace the previous category context, recalculate dependent facets, and SHALL NOT create a multi-category filter state.

#### Scenario: Replace category context
- **WHEN** a user selects a different category
- **THEN** the previous category value is replaced and dependent filters are recalculated for the new category

### Requirement: Invalid dependent state does not remain hidden
When a category or supplier context changes, the catalog SHALL remove dependent query values that are no longer valid for the new active API response. It SHALL preserve valid general selections and SHALL NOT silently apply a hidden dependent filter.

#### Scenario: Change category after selecting a finish
- **WHEN** a user selects a finish under one category and then changes to another category where that finish is absent
- **THEN** the invalid finish selection is cleared and the visible results are not narrowed by that hidden value

### Requirement: Removed source categories are not recreated in frontend code
The catalog SHALL display categories returned by the published API and SHALL NOT add or locally reconstruct `Accesorios de baño`. If the API still returns that category after its source cleanup, the condition SHALL be reported as a data-source blocker.

#### Scenario: Source cleanup removes a category
- **WHEN** the API no longer returns Accesorios de baño
- **THEN** the category is absent from the catalog without a frontend code change

### Requirement: Filter panels have independent scroll regions
The desktop filter panel SHALL have a viewport-bounded scroll region independent from the results page. The mobile filter drawer SHALL remain independently scrollable and SHALL prevent background page scrolling while open.

#### Scenario: Long desktop filter profile
- **WHEN** a dependent profile contains more options than fit in the viewport
- **THEN** the filter column scrolls internally while the results page retains its own document scroll

#### Scenario: Mobile filter drawer
- **WHEN** the mobile filter drawer is open and its contents exceed the viewport
- **THEN** the drawer scrolls internally, the page behind it does not scroll, and focus remains usable inside the dialog

### Requirement: Catalog has a distinct Tienda masthead
The catalog SHALL present a dedicated masthead that identifies AREA LRMQ DESIGN S.L., labels the route as Tienda, introduces the catalog, and uses an approved image source. The masthead SHALL share brand language with the landing without reusing the landing navigation/header behavior.

#### Scenario: Desktop store masthead
- **WHEN** a visitor opens the catalog on desktop
- **THEN** the masthead presents brand, Tienda context, catalog title, orientation copy, and image in a distinct editorial composition before the results

#### Scenario: Mobile store masthead
- **WHEN** a visitor opens the catalog on a narrow viewport
- **THEN** the masthead stacks without clipping its content or pushing the filter and results controls unreasonably far below the fold

### Requirement: Large galleries expose a five-thumbnail navigation window
The product gallery SHALL display at most five thumbnails below the main image and SHALL provide previous/next navigation through every API-provided image in stable API order. The enlarged image view SHALL provide the same navigation.

#### Scenario: Product with more than five images
- **WHEN** a product has 23 API-provided images and no variant has been selected
- **THEN** the gallery initially shows the first image and five thumbnails, and navigation can reach all 23 images in order

#### Scenario: Main image navigation
- **WHEN** the user activates the next or previous gallery control
- **THEN** the active image and visible thumbnail window move by one ordered image without constructing a new image URL

#### Scenario: Enlarged image navigation
- **WHEN** the user opens the active image in the enlarged dialog
- **THEN** previous/next controls remain available in the dialog and update the same gallery position

#### Scenario: Gallery with no selected variant images
- **WHEN** a bath variant has no images and the product has a multi-image gallery
- **THEN** the gallery continues to use product.images and provides the five-thumbnail navigation without requiring a variant selection

### Requirement: Catalog interactions are accessible and responsive
Catalog filters, results, masthead, and gallery SHALL use meaningful landmarks and labels, announce relevant state changes, support keyboard operation, expose focus-visible controls, and remain usable across desktop, tablet, and mobile layouts.

#### Scenario: Skip to results
- **WHEN** a keyboard user activates the catalog skip link
- **THEN** focus moves to the results region without traversing every filter option first

#### Scenario: Accessible facet counts
- **WHEN** a screen reader user focuses a facet option
- **THEN** the option name and its API-provided result count are understandable without relying on visual placement

#### Scenario: Keyboard gallery navigation
- **WHEN** a keyboard user focuses a gallery arrow
- **THEN** the control has an accessible name, visible focus state, and changes the active image without requiring hover

#### Scenario: Responsive results
- **WHEN** the catalog is viewed at desktop, tablet, or mobile widths
- **THEN** filters, search, results, masthead, and gallery controls remain readable, reachable, and free of horizontal overflow

### Requirement: The catalog regression suite covers progressive contexts and gallery navigation
The catalog test suite SHALL cover initial root filters, supplier/category profile activation, Mamparas scoping, single-category behavior, stale dependent state, independent filter scrolling semantics, masthead landmarks, five-thumbnail gallery navigation, enlarged-view navigation, responsive accessibility semantics, and the published data-source blocker boundary.

#### Scenario: Required regression coverage
- **WHEN** the catalog test suite runs
- **THEN** it covers no-filter state, GME supplier state, Mamparas category/type state, products with more than five images, and bath galleries without variant images
