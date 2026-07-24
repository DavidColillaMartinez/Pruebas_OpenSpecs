## ADDED Requirements

### Requirement: Quote form carries current product context
The quote form SHALL preserve and display the current product and selected configuration while open.

#### Scenario: Open quote form
- **WHEN** the user starts a quote from a product detail
- **THEN** the form summary shows the product name, current readable configuration, and quantity that will be sent

#### Scenario: Selection changes before submit
- **WHEN** the user changes the selected variant before submitting
- **THEN** the quote item reflects the latest valid selection

### Requirement: Canonical quote payload
The system SHALL construct `QuoteRequestPayload` with canonical customer fields, `consentPrivacy: true`, an empty honeypot, current route as `sourcePage`, and one valid `QuoteRequestItem`.

#### Scenario: Valid product quote
- **WHEN** the user submits valid data
- **THEN** the payload includes `productId`, optional persistent variant IDs, quantity, product name, minimal variant snapshot, and no internal product object

#### Scenario: Product without variant
- **WHEN** the product has no selectable variant
- **THEN** the payload omits variant IDs and still includes the valid product item

### Requirement: Client validation and contract limits
The form SHALL validate required fields and contract limits before sending while treating server validation as authoritative.

#### Scenario: Missing contact method
- **WHEN** neither email nor phone is provided
- **THEN** submission is blocked and an accessible field error requests at least one contact method

#### Scenario: Privacy not accepted
- **WHEN** `consentPrivacy` is not true
- **THEN** submission is blocked and focus can reach the consent error

#### Scenario: Field exceeds limit
- **WHEN** a field, quantity, identifier, or serialized body violates the documented limit
- **THEN** submission is blocked with a specific accessible error

#### Scenario: Honeypot populated
- **WHEN** the hidden website field contains a value
- **THEN** the request is not submitted as a normal user quote

### Requirement: Prevent duplicate submissions
The form SHALL prevent a second submission while the current request is pending.

#### Scenario: User activates submit twice
- **WHEN** the first request is still in progress
- **THEN** only one POST is issued and the submit control communicates the pending state

### Requirement: Handle created response
The form SHALL handle HTTP `201` as success and SHALL only clear editable personal fields after that response.

#### Scenario: Quote created
- **WHEN** n8n returns a valid `201` response
- **THEN** the form displays an accessible confirmation with the public request identifier when appropriate

### Requirement: Handle validation response
The form SHALL preserve entered data and associate HTTP `400 VALIDATION_ERROR` entries with fields when possible.

#### Scenario: Field validation errors returned
- **WHEN** n8n returns `400` with field errors
- **THEN** matching controls receive accessible errors and unmatched errors appear in a form-level summary

### Requirement: Handle rate limit response
The form SHALL preserve entered data and display the server message for HTTP `429 RATE_LIMITED`.

#### Scenario: Repeat request limited
- **WHEN** n8n returns `429`
- **THEN** the form remains populated and explains that the user must wait before retrying

### Requirement: Handle recoverable submission failures
Network, timeout, and `5xx` quote failures SHALL keep user input and provide an explicit retry path.

#### Scenario: Network fails during submit
- **WHEN** the POST cannot complete because of network or timeout
- **THEN** the form shows a recoverable error without clearing values

#### Scenario: Server returns 5xx
- **WHEN** n8n returns a server error
- **THEN** the form shows a recoverable service error and allows retry

### Requirement: Protect personal data
The frontend SHALL NOT place quote PII in URLs, local storage, analytics, or logs.

#### Scenario: Form is edited or submitted
- **WHEN** personal fields contain values
- **THEN** those values remain in component state and the HTTPS request body only

### Requirement: Automated tests do not create real quotes
Automated tests SHALL intercept or mock the quote endpoint and SHALL NOT POST test personal data to production n8n.

#### Scenario: Quote integration test runs
- **WHEN** the test simulates `201`, `400`, `429`, network, or `5xx`
- **THEN** the response is provided by a mock and no real quote is created
