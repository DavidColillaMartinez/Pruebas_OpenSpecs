## ADDED Requirements

### Requirement: Protected quote ingress
The system SHALL authenticate Vercel-to-n8n quote ingress with a dedicated server-only secret and validate bounded quote payloads while preserving commercial rules.

#### Scenario: Enabled ingress lacks configuration
- **WHEN** delivery is enabled but required secrets or origins are absent
- **THEN** the endpoint SHALL fail closed without forwarding the quote

### Requirement: Atomic notification persistence
The system SHALL create the quote and its notification entry atomically and reuse a recently accepted identical request.

#### Scenario: Repeated accepted payload
- **WHEN** the same server-derived fingerprint is submitted within ten minutes
- **THEN** the existing quote SHALL be returned without another outbox entry

### Requirement: Controlled email delivery
The system SHALL send plain-text notifications to the fixed official inbox using persisted product snapshots and lease-controlled attempts.

#### Scenario: Ambiguous provider outcome
- **WHEN** sending may have succeeded but no reliable acknowledgement exists
- **THEN** delivery SHALL become uncertain and require reconciliation before resend

### Requirement: Explicit verification gate
The implementation SHALL remain undeployed and the n8n draft inactive until the owner authorizes execution tests and subsequent rollout.

#### Scenario: Preparation completes
- **WHEN** code and the inactive workflow are prepared
- **THEN** the owner SHALL be notified before executing tests, migrations or real sends
