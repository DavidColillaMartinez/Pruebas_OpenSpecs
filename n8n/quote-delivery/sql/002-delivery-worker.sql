-- PREPARADO, NO APLICADO. Requiere 001 y autorización para migración/pruebas.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
CREATE OR REPLACE FUNCTION catalog.quote_email_payload(p_id text,p_token uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path=pg_catalog,catalog,public AS $payload$
 SELECT jsonb_build_object(
  'quoteId',q.id::text,'leaseToken',p_token::text,'attempts',o.attempts,
  'createdAt',q.created_at,'customerName',q.customer_name,'email',q.email,
  'phone',q.phone,'renovationType',q.renovation_type,'message',q.message,'sourcePage',q.source_page,
  'items',COALESCE((SELECT jsonb_agg(jsonb_build_object(
   'productName',i.product_name_snapshot,'quantity',i.quantity,
   'attributes',i.variant_snapshot,'notes',i.notes
  ) ORDER BY i.id) FROM catalog.quote_request_items i WHERE i.quote_request_id=q.id),'[]'::jsonb)
 ) FROM catalog.quote_requests q JOIN catalog.quote_email_outbox o ON o.quote_request_id=q.id::text
 WHERE q.id::text=p_id AND o.lease_token=p_token;
$payload$;

CREATE OR REPLACE FUNCTION catalog.claim_quote_email(p_id text DEFAULT NULL)
RETURNS TABLE(job jsonb) LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path=pg_catalog,catalog,public AS $claim$
DECLARE v_row record;
BEGIN
 -- A crashed worker that already began sending is ambiguous. Never resend it
 -- automatically: the provider may have accepted the message before the crash.
 UPDATE catalog.quote_email_outbox SET state='uncertain',error_class='sending_lease_expired',updated_at=now(),lease_until=NULL
 WHERE state='sending' AND lease_until<=now();
 UPDATE catalog.quote_email_outbox SET state='pending',lease_token=NULL,lease_until=NULL,updated_at=now()
 WHERE state='claimed' AND lease_until<=now();
 UPDATE catalog.quote_email_outbox o SET state='failed',error_class='request_missing',updated_at=now()
 WHERE o.state IN ('pending','retry') AND NOT EXISTS(SELECT 1 FROM catalog.quote_requests q WHERE q.id::text=o.quote_request_id);
 WITH candidate AS (
  SELECT quote_request_id FROM catalog.quote_email_outbox
  WHERE state IN ('pending','retry') AND next_attempt_at<=now() AND attempts<5
  AND (p_id IS NULL OR quote_request_id=p_id)
  ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1
 )
 UPDATE catalog.quote_email_outbox o SET state='claimed',lease_token=gen_random_uuid(),
  lease_until=now()+interval '5 minutes',updated_at=now()
 FROM candidate c WHERE o.quote_request_id=c.quote_request_id
 RETURNING o.quote_request_id,o.lease_token INTO v_row;
 IF FOUND THEN RETURN QUERY SELECT catalog.quote_email_payload(v_row.quote_request_id,v_row.lease_token); END IF;
END;
$claim$;

CREATE OR REPLACE FUNCTION catalog.begin_quote_email(p_id text,p_token uuid)
RETURNS TABLE(job jsonb) LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path=pg_catalog,catalog,public AS $begin_send$
BEGIN
 UPDATE catalog.quote_email_outbox SET state='sending',attempts=attempts+1,updated_at=now()
 WHERE quote_request_id=p_id AND state='claimed' AND lease_token=p_token AND lease_until>now() AND attempts<5;
 IF FOUND THEN RETURN QUERY SELECT catalog.quote_email_payload(p_id,p_token); END IF;
END;
$begin_send$;

CREATE OR REPLACE FUNCTION catalog.finish_quote_email(p_id text,p_token uuid,p_state text,p_provider text,p_error text)
RETURNS TABLE(quote_request_id text,state text) LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path=pg_catalog,catalog,public AS $finish_send$
BEGIN
 IF p_state IS NULL OR p_state NOT IN ('sent','retry','failed','uncertain')
 OR (p_state='sent' AND (p_provider IS NULL OR p_provider !~ '^[A-Za-z0-9_-]{1,128}$'))
 OR (p_error IS NOT NULL AND p_error !~ '^[a-z0-9_]{1,64}$') THEN
  RAISE EXCEPTION 'INVALID_DELIVERY_RESULT';
 END IF;
 RETURN QUERY UPDATE catalog.quote_email_outbox o SET
 state=CASE WHEN p_state='retry' AND o.attempts>=5 THEN 'failed' ELSE p_state END,
 provider_message_id=CASE WHEN p_state='sent' THEN p_provider ELSE NULL END,
 error_class=p_error,lease_until=NULL,
 next_attempt_at=CASE WHEN p_state='retry' THEN now()+make_interval(mins=>power(2,greatest(0,o.attempts-1))::integer) ELSE o.next_attempt_at END,
 updated_at=now()
 WHERE o.quote_request_id=p_id AND o.state='sending' AND o.lease_token=p_token
 RETURNING o.quote_request_id,o.state;
END;
$finish_send$;

COMMIT;
