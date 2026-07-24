## ADDED Requirements

### Requirement: Relative public API configuration
The browser SHALL define the catalog API base URL as the relative `/api/catalog` path and SHALL never construct or expose an n8n `/webhook` URL.

#### Scenario: Browser request
- **WHEN** the frontend requests product or quote data
- **THEN** the request URL starts with `/api/catalog` and contains no n8n hostname, webhook path, or webhookId

#### Scenario: Internal upstream configuration
- **WHEN** the server-side proxy handles a request
- **THEN** the server-side proxy reads the corresponding `N8N_CATALOG_*_UPSTREAM_BASE_URL` variable

### Requirement: Real detail contract prerequisite
The implementation SHALL derive `ProductDetail` from a real `200` response for a slug returned by the public product list and SHALL NOT invent JSON keys from conceptual field names.

#### Scenario: Detail workflow is not operational
- **WHEN** every public slug tested against `/products/:slug` fails to return a usable product object
- **THEN** contract-dependent implementation tasks remain blocked and record the n8n incompatibility

#### Scenario: Detail workflow becomes operational
- **WHEN** n8n returns a public `200` detail response for a listed slug
- **THEN** the response is anonymized as a test fixture and used to define runtime validation and TypeScript types

### Requirement: Product retrieval and error classification
The client SHALL retrieve a detail by encoded slug and SHALL distinguish not-found, transport, timeout, server, parse, and contract errors.

#### Scenario: Valid detail response
- **WHEN** the endpoint returns `200` with a structurally usable product
- **THEN** the client returns a normalized `ProductDetail`

#### Scenario: Product not found
- **WHEN** the public proxy returns `404` with `PRODUCT_NOT_FOUND` (while upstream n8n may incorrectly return `200`)
- **THEN** the client returns or throws the dedicated not-found result

#### Scenario: Server failure
- **WHEN** the endpoint returns a `5xx` response
- **THEN** the client exposes a recoverable server error rather than not-found

#### Scenario: Invalid successful response
- **WHEN** the endpoint returns `200` with invalid JSON or without the required product identity
- **THEN** the client exposes a controlled contract error

#### Scenario: Request timeout
- **WHEN** the detail request exceeds the configured timeout
- **THEN** the client aborts it and exposes a timeout error

### Requirement: Obsolete response protection
Product requests SHALL be cancellable or ignored after the slug changes or the consuming view unmounts.

#### Scenario: Slug changes during loading
- **WHEN** a response for the previous slug arrives after a newer request starts
- **THEN** the previous response does not replace the current page state

### Requirement: Public asset URL resolution
The normalization layer SHALL use resolved URLs from the API or `asset_base_url` from public config and SHALL NOT infer supplier folders.

#### Scenario: Absolute image URL
- **WHEN** an image already contains a valid absolute public URL
- **THEN** normalization preserves that URL

#### Scenario: Relative image path
- **WHEN** an image contains a relative path and public config provides `asset_base_url`
- **THEN** normalization resolves the URL against the configured asset base

#### Scenario: Unresolvable path
- **WHEN** no valid URL or asset base can resolve an image
- **THEN** normalization omits that image without throwing

### Requirement: Central normalization
The API layer SHALL centralize normalization of optional values and arrays without changing their business meaning.

#### Scenario: Missing optional arrays
- **WHEN** images, variants, offers, or documents are absent or null
- **THEN** the normalized model exposes safe empty collections where the confirmed contract allows them

#### Scenario: Unknown public field
- **WHEN** the API adds a field that is not mapped by the presentation model
- **THEN** the application does not automatically display or reinterpret it

### Requirement: Safe API operation
The API layer SHALL NOT log complete quote payloads, personal data, secrets, or internal endpoint details to the user interface.

#### Scenario: Request fails
- **WHEN** a product or quote request fails
- **THEN** the user receives a safe actionable message and no PII payload is written to browser logs or storage
