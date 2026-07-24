## ADDED Requirements

### Requirement: Stable product routes
The application SHALL provide `/productos` and `/productos/:slug` through React Router while preserving the landing at `/`.

#### Scenario: Navigate from product list
- **WHEN** the user activates a product card containing a public slug
- **THEN** the application navigates to `/productos/:slug` using that slug

#### Scenario: Open detail directly
- **WHEN** the user opens or reloads a valid product URL
- **THEN** the router resolves the slug and reloads the product without relying on ephemeral catalog state

#### Scenario: Invalid route
- **WHEN** no application route matches the requested path
- **THEN** the application renders a controlled not-found page with navigation back to a valid route

### Requirement: Catalog entry point
The application SHALL expose a minimal functional product listing sourced from the public list endpoint so a user can enter the detail flow without bundling the local catalog JSON.

#### Scenario: Catalog list succeeds
- **WHEN** the product list endpoint returns public items
- **THEN** the page renders semantic product links using each returned slug

#### Scenario: Catalog list fails
- **WHEN** the listing request fails
- **THEN** the page renders a recoverable error and retry action rather than a blank screen

### Requirement: Product request state machine
The detail page SHALL explicitly represent loading, success, not-found, technical error, and invalid-contract states.

#### Scenario: Initial loading
- **WHEN** a detail route starts loading
- **THEN** the page displays and announces a loading state without leaving a blank screen

#### Scenario: Product loaded
- **WHEN** normalized product data is available
- **THEN** the page renders the product detail and removes the loading state

#### Scenario: Product not found
- **WHEN** the API client classifies the response as not-found
- **THEN** the page displays a product-specific not-found state with a path back to the catalog

#### Scenario: Network or server error
- **WHEN** the API client reports network, timeout, or `5xx`
- **THEN** the page displays a recoverable error with retry

#### Scenario: Contract invalid
- **WHEN** the API client reports a contract error for a `200` response
- **THEN** the page displays a controlled data error distinct from not-found

### Requirement: Conditional public product content
The page SHALL render available public identity, classification, description, features, attributes, measures, finishes, commercial information, media, and documents without exposing empty or internal values.

#### Scenario: Complete product
- **WHEN** the normalized product contains all supported public sections
- **THEN** each section is rendered with semantic headings and readable values

#### Scenario: Optional content absent
- **WHEN** description, documents, attributes, offers, or other optional content is empty
- **THEN** the corresponding label or section is omitted without rendering null, undefined, serialized arrays, or placeholder business claims

#### Scenario: Internal data present upstream
- **WHEN** the raw response contains unmapped technical or internal fields
- **THEN** those fields are not rendered to the user

### Requirement: Variant edge states
The page SHALL remain functional when a product has no variants, exactly one variant, or multiple variants.

#### Scenario: Product without variants
- **WHEN** the normalized product has no selectable variants or offers
- **THEN** the page renders product-level information and can request a quote using only confirmed product identifiers

#### Scenario: Single variant
- **WHEN** exactly one valid option exists
- **THEN** it is selected automatically without forcing an unnecessary choice

#### Scenario: Multiple variants
- **WHEN** multiple valid options exist
- **THEN** the page renders accessible controls for the selection logic defined by the variant capability

### Requirement: Semantic and accessible structure
The detail page SHALL provide semantic HTML, one product-name `h1`, keyboard-operable controls, associated labels, accessible errors, live status announcements, and focus management for critical results.

#### Scenario: Keyboard-only use
- **WHEN** a user navigates the page without a pointer
- **THEN** gallery controls, variant controls, links, and quote controls are reachable and visibly focused

#### Scenario: Important result appears
- **WHEN** a product error or quote confirmation is rendered
- **THEN** the result is announced and focus moves according to the established accessible pattern

### Requirement: Responsive native-scroll layout
The product route SHALL use native document scrolling and remain usable on mobile and desktop without activating the landing narrative controller.

#### Scenario: Desktop product route
- **WHEN** a desktop viewport opens a detail route
- **THEN** the page scrolls natively and no wheel-jacking narrative handler is active

#### Scenario: Mobile product route
- **WHEN** a narrow viewport opens a detail route
- **THEN** content, controls, gallery, and form fit without horizontal overflow

### Requirement: Product metadata
The page SHALL set a document title and meta description derived only from public product data and SHALL restore previous metadata when leaving the route.

#### Scenario: Product metadata available
- **WHEN** a product loads with name and description or public classification
- **THEN** title and description are updated using safe fallbacks

### Requirement: SPA deployment support
The project SHALL document and configure the target hosting rewrite required for direct product URL reloads.

#### Scenario: Reload deployed detail URL
- **WHEN** a deployed `/productos/:slug` URL is requested directly
- **THEN** the hosting layer serves the SPA entry and React Router resolves the route
