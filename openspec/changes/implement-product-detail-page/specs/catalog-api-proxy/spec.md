## ADDED Requirements

### Requirement: Public relative proxy route
The application SHALL expose `/api/catalog/products/:slug` and SHALL forward it server-side to the configured n8n upstream without exposing the upstream URL to the browser.

#### Scenario: Valid product proxy
- **WHEN** the browser requests `/api/catalog/products/mt-espejos-alba`
- **THEN** the application forwards the encoded slug to the configured upstream and returns the product response without redirecting the browser

#### Scenario: Webhook is hidden
- **WHEN** a product request is observed in browser address or network URLs
- **THEN** it contains `/api/catalog/products/:slug` and no n8n hostname, `/webhook`, or webhookId

### Requirement: Server-only upstream configuration
The proxy SHALL read the n8n upstream base URL for each catalog resource from server-side environment configuration and SHALL fail safely when it is missing.

#### Scenario: Upstream configured
- **WHEN** the resource-specific `N8N_CATALOG_*_UPSTREAM_BASE_URL` variable is present
- **THEN** the proxy forwards requests to that base plus `/products/:slug`

#### Scenario: Upstream missing
- **WHEN** the environment variable is absent
- **THEN** the proxy returns a controlled `500` configuration error without exposing internal configuration

### Requirement: Preserve upstream response contract
The proxy SHALL preserve the upstream status, JSON body, relevant cache headers, and content type for product detail responses.

#### Scenario: Product exists
- **WHEN** upstream returns `200` with a product
- **THEN** the public route returns the same `200` JSON product

#### Scenario: Product does not exist
- **WHEN** upstream returns `200` with `PRODUCT_NOT_FOUND`
- **THEN** the public route returns HTTP `404` with the same error object

### Requirement: Local development proxy
The Vite development server SHALL proxy `/api/catalog` to the configured upstream without changing frontend request code.

#### Scenario: Dev request
- **WHEN** the app runs with the upstream environment variable configured
- **THEN** `GET /api/catalog/products/:slug` resolves through the Vite proxy

### Requirement: Shared proxy strategy
Future catalog endpoints SHALL use the same relative public prefix and server-only upstream configuration rather than direct n8n calls from components.

#### Scenario: Quote endpoint added
- **WHEN** the quote client is implemented
- **THEN** it calls `/api/catalog/quote-requests` and uses the same proxy strategy
