## ADDED Requirements

### Requirement: Duplach catalog scope
The catalog SHALL apply Duplach-specific behavior only when the active query has `supplier_id=duplach` and `category_id=platos-de-ducha`.

#### Scenario: Exact Duplach scope is requested
- **WHEN** the catalog query contains `supplier=duplach` and `category=platos-de-ducha`
- **THEN** the request SHALL include `supplier_id=duplach` and `category_id=platos-de-ducha`

#### Scenario: A different provider is selected
- **WHEN** the query contains Royo, Espejos, Mamparas/GME or another supplier/category
- **THEN** Duplach-specific filters and presentation rules SHALL NOT be applied

### Requirement: Server-side Duplach filters
The catalog SHALL send Duplach filters to the public products endpoint using `product_id`, `measure`, `texture`, `color`, `grille`, `valve`, `orientation`, `finish_family` and `finish`, and SHALL NOT filter a generic downloaded list in React.

#### Scenario: Model and dependent filters are active
- **WHEN** the user selects a model, measure, texture, color, grille, valve, orientation, finish family or finish
- **THEN** the next request SHALL contain the corresponding API query parameter and the returned response SHALL determine the visible products

#### Scenario: Model filter uses a real product identifier
- **WHEN** the user selects Stone Zeus
- **THEN** the request SHALL use `product_id=duplach-stone-zeus` only if that identifier is delivered by the API

#### Scenario: A parameter is absent from the API contract
- **WHEN** the endpoint does not expose one of the requested filter parameters or facets
- **THEN** the implementation SHALL document the exact missing parameter and SHALL NOT create fake options or claim that the filter works

### Requirement: API-backed model options and titles
The catalog SHALL derive model options and displayed Duplach titles from API-delivered identifiers and model/name fields, displaying only the official model name and never appending selectable options.

#### Scenario: All supported Duplach models are returned
- **WHEN** the API returns products with the supported IDs
- **THEN** cards SHALL display only Stone Zeus, Stone Plus, Stone Smart, Stone Mio, Stone Side, Stone Sorty, Stone Cach or Stone 3D as delivered by the API

#### Scenario: A selectable option is present
- **WHEN** a product has a texture, color, grille, valve, measure, orientation, finish family or finish
- **THEN** that value SHALL appear in its filter or selector and SHALL NOT be appended to the card title

#### Scenario: The model title field is missing
- **WHEN** the API does not provide a usable official model field
- **THEN** the implementation SHALL preserve the missing value and document the contract gap instead of deriving a title from slug, image or option text

### Requirement: Dependent facets and existing discovery optimizations
Duplach facets SHALL reflect the active server response, and the catalog SHALL preserve the existing cache, request deduplication, abort/timeout, pagination, prefetch and facet-loading optimizations.

#### Scenario: An incompatible dependent value is returned with zero availability
- **WHEN** the active API response reports zero results for a non-selected option
- **THEN** that option SHALL be hidden or disabled and SHALL NOT be selectable as a new combination

#### Scenario: The same optimized request is repeated
- **WHEN** an identical Duplach catalog request is made while its cached response is valid or a request is already in flight
- **THEN** the existing client optimization SHALL avoid an unnecessary second network request

#### Scenario: A later catalog page is loaded
- **WHEN** the user requests another Duplach page
- **THEN** the client SHALL request the needed server page and preserve earlier results without downloading and filtering the full catalog in React

### Requirement: Shared catalog card structure remains stable
Duplach cards SHALL use the existing catalog card template with a coherent image block and text block without changing the global appearance of other suppliers.

#### Scenario: A Duplach card is rendered beside other suppliers
- **WHEN** Duplach, Royo, Espejos or Mamparas/GME cards are rendered together
- **THEN** each card SHALL retain the common image/text block structure and each non-Duplach title SHALL remain unchanged
