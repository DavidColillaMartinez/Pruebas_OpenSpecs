## ADDED Requirements

### Requirement: Contextual family activation
The catalog SHALL expose only root filters (`Categoría` and `Proveedor`) before a family context is active. The Espejos Manillons Torrent context SHALL activate when `category=espejos` OR `supplier=manillons-torrent`; the Mamparas GME context SHALL continue to activate when `category=mamparas` OR `supplier=gme`.

#### Scenario: No specialized context
- **WHEN** the URL contains neither a family category nor a family supplier
- **THEN** the filter panel shows only the root category and supplier facets and shows no specialized Mamparas or Espejos facet

#### Scenario: Espejos selected by category
- **WHEN** the URL contains `category=espejos` without the Manillons Torrent supplier
- **THEN** the panel shows `Tipo de espejo`, `Modelo`, `Forma`, `LED`, `Tipo de iluminación` and `Acabado` in that order

#### Scenario: Espejos selected by supplier
- **WHEN** the URL contains `supplier=manillons-torrent` without the Espejos category
- **THEN** the panel shows exactly the same six Espejos facets in the same order

#### Scenario: Mamparas behavior remains available
- **WHEN** the URL contains `category=mamparas` OR `supplier=gme`
- **THEN** the panel shows the existing Mamparas-dependent facets, including `Distribución` and `Acabado`, without requiring both root activators

#### Scenario: Multiple family contexts
- **WHEN** the URL activates both the Mamparas and Espejos profiles through category and/or supplier values
- **THEN** the panel shows the union of their relevant facet groups, preserves valid selections, and uses generic labels `Tipo`, `Modelo` and `Acabado` when a shared key would otherwise be ambiguous

### Requirement: API-backed Espejos facets
The catalog query and normalization layers SHALL support `shape`, `has_led` and `lighting_type` in `CATALOG_FACET_KEYS`, URL serialization, API requests, response aliases and labels. Espejos `finish` SHALL be available as a contextual listing facet. Facet options, labels, counts and compatibility SHALL come from the API response and SHALL NOT be derived from a partial page of cards.

#### Scenario: New facets are requested and normalized
- **WHEN** the Espejos listing request includes active family criteria and `include_facets=1`
- **THEN** the request includes the three new facet keys, and the response normalizer exposes their API-provided values, labels and counts without dropping boolean LED values

#### Scenario: API provides the Espejos facet contract
- **WHEN** the API returns `subcategory`, `collection`, `shape`, `has_led`, `lighting_type` and `finish` facets
- **THEN** the UI renders them in the configured Espejos order and does not replace them with values calculated from loaded cards

#### Scenario: Facets are unavailable
- **WHEN** the API does not return a required specialized facet set
- **THEN** the UI does not invent options from the current page and reports the unavailable facet state deterministically

### Requirement: Compatible options and contextual cleanup
Every filter change SHALL recalculate compatible API facets and counts against the remaining selection. The UI SHALL not present a zero-result option as eligible. Removing the last activator of a family SHALL remove that family's dependent filters from both state and URL while retaining shared filters still owned by another active family.

#### Scenario: Compatible counts after a selection
- **WHEN** a user selects a Tipo de espejo, Modelo, Forma, LED, lighting type or Acabado option
- **THEN** the next facet response updates option counts and only options with compatible results remain selectable

#### Scenario: Last Espejos activator removed
- **WHEN** the user removes the last `espejos` category and `manillons-torrent` supplier activator
- **THEN** Espejos-only selections are cleared from in-memory state and URL, and no Espejos facet remains visible with an active invisible value

#### Scenario: One of multiple activators removed
- **WHEN** one family activator is removed while another activator for that family or another family remains
- **THEN** selections owned by the still-active profile remain, and only values without any active owner are cleared

#### Scenario: Invalid dependent URL
- **WHEN** the initial URL contains an Espejos-dependent facet without a valid Espejos activator
- **THEN** parsing removes or ignores that dependent criterion deterministically before the request and serialization

### Requirement: Model-level catalog cards
The listing SHALL represent one card per model, not one card per measure, finish or version. Each card SHALL use the first API image after model gallery ordering and SHALL not display prices.

#### Scenario: Complete Manillons Torrent result
- **WHEN** the API publishes the package described by `mt-espejos-manifest.json`
- **THEN** the listing exposes 53 model cards, with type totals of Camerino 3, Canto recto 11, Canto redondo 9, Circular 15 and Cápsula 15

#### Scenario: Card image and price policy
- **WHEN** a model card is rendered
- **THEN** it uses the first ordered URL supplied by the API, never builds a URL from the slug, and renders no price or commercial amount
