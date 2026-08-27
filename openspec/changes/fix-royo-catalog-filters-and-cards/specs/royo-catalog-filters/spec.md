## ADDED Requirements

### Requirement: Royo filters activate from the bathroom-furniture category
The catalog SHALL activate the Royo furniture filter profile when the exact category `muebles-y-lavabos` is selected and the supplier filter is empty or contains only `royo`.

#### Scenario: Category selected without a supplier
- **WHEN** the URL contains `category=muebles-y-lavabos` and no supplier
- **THEN** the catalog shows the Royo-specific filters together with Categoría and Proveedor

#### Scenario: Exact Royo supplier and category selected
- **WHEN** the URL contains `category=muebles-y-lavabos&supplier=royo`
- **THEN** the catalog shows the same Royo-specific filter profile

#### Scenario: Different supplier selected
- **WHEN** the URL contains `category=muebles-y-lavabos&supplier=gme`
- **THEN** the catalog does not show or apply Royo-specific filters

#### Scenario: Multiple suppliers selected
- **WHEN** the URL contains `category=muebles-y-lavabos` and more than one supplier value
- **THEN** the catalog does not apply Royo-specific rules to the mixed supplier context

### Requirement: Royo filter order and labels are stable
The Royo profile SHALL render `modularity`, `collection`, `subcategory`, `finish`, `measure` and `product_kind` in that order, followed by the general Category and Supplier filters, with labels `Modularidad`, `Modelo`, `Tipo de mueble`, `Acabado`, `Medida` and `Tipo de producto`.

#### Scenario: Royo filter groups are rendered
- **WHEN** the active context is the Royo furniture profile and the API returns the corresponding facets
- **THEN** the filter groups appear in the specified order and use the specified labels

#### Scenario: Missing optional facet
- **WHEN** the API does not return an optional Royo facet
- **THEN** no invented group or option is rendered for that facet

### Requirement: Royo filters use API requests and preserve URL state
The catalog SHALL send selected Royo filter values to the catalog API, preserve them in the URL, and SHALL NOT filter the returned page only in React.

#### Scenario: Modular filter changes
- **WHEN** the user selects `Modular`
- **THEN** the URL preserves `modularity=modular` and the next catalog request includes the corresponding API parameter

#### Scenario: Normal filter changes
- **WHEN** the user selects `Normal`
- **THEN** the URL preserves `modularity=normal` and the next catalog request includes the corresponding API parameter

#### Scenario: Server-filtered page is returned
- **WHEN** the API returns a page for a valid Royo filter request
- **THEN** the UI renders that returned page, total, pagination and facets without removing products by modularity in React

#### Scenario: Royo filter sent to another supplier
- **WHEN** the supplier changes from the Royo context to an unrelated supplier
- **THEN** the request does not include `modularity` or stale Royo-only filter values

### Requirement: Facets and counts come from real data
The catalog SHALL use API-delivered facet values and counts when available, and SHALL derive fallback facets only from products already normalized by the frontend.

#### Scenario: API facets are available
- **WHEN** the active response includes Royo facets with counts
- **THEN** the panel renders those exact values and counts

#### Scenario: API facets are absent
- **WHEN** the active response omits a supported facet
- **THEN** the fallback may expose only values observed in normalized products and does not invent options

#### Scenario: Selected option has zero results
- **WHEN** a selected option is returned with count zero
- **THEN** the selected option remains visible and checked

### Requirement: Incompatible catalog filters are removed on context changes
The catalog SHALL remove filter values that no longer belong to the active family when category or supplier context changes, while retaining valid root and family filters.

#### Scenario: Royo supplier changes to another supplier
- **WHEN** the user changes from the exact Royo context to another supplier
- **THEN** Royo-only filters are removed from state and URL before the next request

#### Scenario: Category context is cleared
- **WHEN** the user removes `muebles-y-lavabos` from the query
- **THEN** Royo-specific filters are removed and only valid general filters remain
