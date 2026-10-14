# Design

Keep the existing Vite/React frontend and Vercel Node.js API. The protected v2 n8n route validates server-supplied metadata, invokes the original commercial persistence rules inside a transaction, and creates an outbox row atomically with the quote.

Claim and begin are separate lease-controlled steps. Persisted pending rows recover a lost execution before sending. A lost or ambiguous send becomes uncertain, requiring reconciliation rather than blind retry. Gmail acknowledgement records acceptance by the provider, not inbox receipt.

Rollout is feature-gated and coordinated. The legacy unauthenticated quote webhook must be retired or protected after cutover. Prepared SQL requires real-schema verification and isolated tests; it has not been applied. Credentials, privacy settings, observability and retention remain pending.

The owner authorized point 5 on 2026-10-13. Local unit/regression tests, typecheck, build and lint were run; the n8n delivery branch was also exercised once with synthetic data and pinned PostgreSQL/Gmail outputs. No real webhook, database write, migration or email was executed. The autoassigned chat Header Auth must be replaced; the draft webhook remains disabled. Real database and provider tests still require a safe staging target, credentials and execution-data privacy settings.
