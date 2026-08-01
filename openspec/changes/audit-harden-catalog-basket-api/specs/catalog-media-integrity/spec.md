## ADDED Requirements

### Requirement: Catalog media uses only API-provided URLs
The frontend SHALL render the image URL supplied by the API and SHALL not construct legacy filenames from a slug or product name.

#### Scenario: API returns an `mt26-esp-*.webp` URL
- **WHEN** a card or gallery renders the product
- **THEN** it requests that exact API URL without renaming or replacing it

#### Scenario: API omits an image URL
- **WHEN** no valid image URL is provided
- **THEN** the UI renders a stable fallback state and does not guess a filename

### Requirement: Media loading and errors do not destabilize layout
Image loading SHALL reserve the final frame, use lazy loading where appropriate, and keep card/gallery dimensions stable when an image is delayed or fails.

#### Scenario: Image is loading
- **WHEN** an image has not completed loading
- **THEN** the reserved frame remains in place with a discreet loading state

#### Scenario: Image fails
- **WHEN** an API-provided image returns an error
- **THEN** a discreet fallback replaces the image inside the same frame without changing grid row height or breaking neighboring cards

#### Scenario: Image is outside the viewport
- **WHEN** a catalog image is not initially visible and the browser supports native lazy loading
- **THEN** the image uses an appropriate lazy-loading hint without delaying above-the-fold content
