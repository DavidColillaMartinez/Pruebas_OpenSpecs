## ADDED Requirements

### Requirement: Royo listing scope is explicit
The catalog SHALL apply Royo-specific behavior only when `supplier_id=royo` and `category_id=muebles-y-lavabos` are both selected.

#### Scenario: Royo modular filter is requested
- **WHEN** the user selects `Modular` within the Royo bathroom-furniture category
- **THEN** the listing request includes `supplier_id=royo`, `category_id=muebles-y-lavabos` and `modularity=modular`

#### Scenario: Royo normal filter is requested
- **WHEN** the user selects `Normal` within the Royo bathroom-furniture category
- **THEN** the listing request includes `supplier_id=royo`, `category_id=muebles-y-lavabos` and `modularity=normal`

#### Scenario: Royo scope is incomplete
- **WHEN** either the supplier or category does not match the required Royo scope
- **THEN** the catalog does not apply the Modular/Normal filter or any Royo-only transformation

### Requirement: Modularity is filtered by the API
The catalog SHALL send the selected `modularity` value to the catalog API and SHALL NOT emulate the Modular/Normal filter by removing products after the response.

#### Scenario: Server returns a filtered page
- **WHEN** the API receives a valid Royo modularity query
- **THEN** the UI renders the returned page, pagination and facets without applying a second client-side modularity filter

#### Scenario: Filter changes
- **WHEN** the user changes from Modular to Normal or vice versa
- **THEN** the catalog performs a new API request with the corresponding `modularity` value and resets the listing page as required by the existing query behavior

### Requirement: Listing media and metadata come from the API
The catalog SHALL use the Royo response fields `modularity`, `main_image_url`, `main_image_path`, `images`, `specs.modular_notice` and `specs.module_configuration` without deriving values from names, slugs, image filenames or interface text.

#### Scenario: Royo product card has a cover
- **WHEN** a Royo card contains `main_image_url` or `main_image_path`
- **THEN** the card uses the API-delivered cover URL and does not construct, split, rename or replace the cover from the slug

#### Scenario: Royo card contains modular information
- **WHEN** the API supplies `modularity` or modular specification fields
- **THEN** the card displays the corresponding API values and does not infer modularity from the model name

#### Scenario: API omits an optional field
- **WHEN** a requested Royo field is absent or null in the response
- **THEN** the normalized value remains `undefined` or `null`, is handled as optional, and is not replaced with `false` or a derived value

### Requirement: Existing catalog families retain their filters
The shared catalog query and filter pipeline SHALL preserve the existing behavior of Espejos, Mamparas/GME and other suppliers when Royo-specific conditions are not satisfied.

#### Scenario: Espejos listing
- **WHEN** the user lists Espejos from the Manillons-Torrent supplier
- **THEN** existing Espejos filters and request parameters continue to work and no Royo modularity parameter is sent

#### Scenario: Mamparas/GME listing
- **WHEN** the user lists Mamparas/GME products
- **THEN** existing Mamparas/GME filters and request parameters continue to work and no Royo modularity transformation is applied

#### Scenario: Other supplier listing
- **WHEN** the user lists a supplier other than Royo
- **THEN** its existing filters, pagination and response handling remain unchanged
