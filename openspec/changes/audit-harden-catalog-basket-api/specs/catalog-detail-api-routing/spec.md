## ADDED Requirements

### Requirement: Detail requests use the published listing slug
The detail client SHALL use the exact slug returned by the public listing contract and SHALL not construct a slug from a product name, image name, or assumed legacy identifier.

#### Scenario: Listing returns a detail slug
- **WHEN** a product card is opened
- **THEN** the detail request uses the listing-provided slug or product identifier required by the documented API contract

#### Scenario: Legacy assumed slug differs
- **WHEN** the listing publishes a slug different from `mt-espejos-alba`
- **THEN** the client tests and uses the published slug rather than the assumed value

### Requirement: Production detail contract is verified across families
The production detail endpoint SHALL be checked with one real Espejo, another real Espejo, and one real GME product, and successful responses SHALL match the documented product/variant contract.

#### Scenario: Detail endpoint is registered
- **WHEN** each real published slug is requested with GET
- **THEN** the endpoint responds `200` with the expected product and variant fields

#### Scenario: Detail endpoint is unavailable
- **WHEN** a real request returns an unregistered webhook or another infrastructure error
- **THEN** the implementation records the exact URL, method, status, and response and does not claim the production contract is verified

### Requirement: Detail failures have a stable user state
The frontend SHALL expose loading, not-found/error, retry, and successful detail states without inventing product or variant data.

#### Scenario: Detail request fails
- **WHEN** the production detail request returns a non-success response
- **THEN** the page shows an actionable error/retry state and does not create a selectable generic variant
