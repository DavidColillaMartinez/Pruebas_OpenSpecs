# Remove stored quote requests

Owner request, 2026-10-14: the website forwards requests through Resend to the company email, without maintaining a customer database or outbox. Supersedes persistence and scheduled recovery in add-quote-email-delivery.

Keep authentication, origin/body validation, catalog-backed resolution, sanitization and Reply-To. Return success only after provider acceptance. Remove stored requests, items, outbox and admission windows in primary and the existing test branch. Use a read-only query receiving catalog identifiers only. Do not recreate deleted customer records for audit or rollback.

Remove chat transcripts from browser session storage and free-text notes from persisted catalog selections. Preserve transient UI state. A reload starts a new chat. Provider logs, company mailbox, database historical restore windows and chat workflow execution settings are distinct and must not be described as nonexistent.

No claim of global zero retention until chat execution retention and provider policies are resolved. No ecommerce exemption for required corporate registry information. Owner commits/pushes repository changes; no Vercel deployment performed here.
