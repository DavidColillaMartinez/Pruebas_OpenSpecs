-- Explicit owner request, 2026-10-14: remove stored customer requests and outbox.
-- Run only after publishing the transient workflow. No CASCADE; catalog is preserved.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
DROP FUNCTION IF EXISTS catalog.create_quote_request_secure(text[]);
DROP FUNCTION IF EXISTS catalog.finish_quote_email(text,uuid,text,text,text);
DROP FUNCTION IF EXISTS catalog.begin_quote_email(text,uuid);
DROP FUNCTION IF EXISTS catalog.claim_quote_email(text);
DROP FUNCTION IF EXISTS catalog.quote_email_payload(text,uuid);
DROP TABLE IF EXISTS catalog.quote_request_items;
DROP TABLE IF EXISTS catalog.quote_requests;
DROP TABLE IF EXISTS catalog.quote_email_outbox;
DROP TABLE IF EXISTS catalog.quote_ingress_windows;
COMMIT;
