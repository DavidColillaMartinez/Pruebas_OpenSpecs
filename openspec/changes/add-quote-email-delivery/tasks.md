> Cambio histórico sustituido por remove-quote-storage. Las casillas conservan su estado original; no autorizan reinstalar almacenamiento retirado. La configuración operativa se mantiene privada.

# Tasks

- [x] Inspect existing quote endpoint and live workflow; preserve definition.
- [x] Prepare feature-gated authenticated ingress and contact validation.
- [x] Prepare transactional quote/outbox and delivery lease SQL, unapplied.
- [x] Prepare fixed-recipient plain-text mail formatting and execute local unit tests.
- [x] Create structurally valid inactive n8n draft; disable incorrectly autoassigned webhook pending dedicated credential.
- [x] Document configuration, rollout, uncertainty recovery and explicit test boundary.
- [x] Obtain owner authorization to begin point 5.
- [ ] Verify real schema and privileges; test migrations in isolation.
- [x] Configure dedicated Header Auth, Resend Bearer credential (selected by owner) and execution-data privacy; actual provider authentication not yet verified.
- [x] Execute unit/regression suite, typecheck, build and lint locally (426 passed, 1 skipped on final full run; 10 existing UI lint warnings).
- [ ] Run strict OpenSpec validation (CLI unavailable in the current environment).
- [x] Run a mocked n8n delivery-branch test with PostgreSQL and Gmail pinned; no provider calls made.
- [x] Fix ambiguous SQL status reference and include renovation type in mail payload/template.
- [x] Run 47 targeted endpoint/mail tests and mocked n8n execution [ejecución simulada] after corrections.
- [x] Prepare transactional staging SQL verification and exact owner setup guide.
- [x] Install 001/002 and run 003 in Neon staging branch quote-delivery-test ([rama privada omitida]): PASS with ROLLBACK, counts unchanged.
- [ ] Test concurrency, validation, rate limits, leases and provider failure fixtures.
- [x] Confirm owner-controlled real request reaches [buzón de pruebas omitido]: Resend Delivered and actual inbox screenshots; outbox sent after 1 attempt. Official Gmail configuration follows at client launch.
- [ ] Obtain rollout approval, activate v2 and retire/protect legacy quote webhook.
- [ ] Verify end-to-end production flow and operational monitoring/retention.
