## ADDED Requirements

### Requirement: Frontend public content omits Accesorios de baño
The frontend SHALL not present `Accesorios de baño` as a landing category, catalog fixture, public fixture expectation, or locally authored publishable catalog content.

#### Scenario: Landing categories are rendered
- **WHEN** the landing collection content is rendered
- **THEN** no category has the title `Accesorios de baño`

#### Scenario: Frontend catalog tests are inspected
- **WHEN** catalog fixtures and expectations are used by unit or integration tests
- **THEN** they do not introduce `Accesorios de baño` as a public category or assert it as an expected frontend result

### Requirement: Backend publication data is not modified by this change
This frontend-only change SHALL NOT execute SQL, create migrations, alter PostgreSQL/Neon data, modify n8n, or pretend that frontend omission changes backend publication.

#### Scenario: Backend category remains in an API response
- **WHEN** a real API response still contains `Accesorios de baño`
- **THEN** the frontend change does not rewrite that response and records backend publication as outside this change’s scope

#### Scenario: Implementation is validated
- **WHEN** the change is applied
- **THEN** validation uses frontend behavior and real GET contract checks only, with no database write or migration command
