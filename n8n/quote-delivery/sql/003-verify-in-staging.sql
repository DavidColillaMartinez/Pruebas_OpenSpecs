-- SOLO EN RAMA DE PRUEBAS NEON. Instalar 001 y 002 primero.
-- No llama a n8n ni a Gmail. Todas las solicitudes sintéticas se revierten.
-- Este archivo está preparado, pero NO se ha ejecutado en PostgreSQL.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $verify_quote_delivery$
DECLARE
 v_product record;
 v_params text[];
 v_items jsonb;
 v_metadata jsonb;
 v_response record;
 v_id text;
 v_job jsonb;
 v_token uuid;
 v_old_token uuid;
 v_before bigint;
 v_count bigint;
 v_state text;
 v_attempts integer;
 v_index integer;
BEGIN
 IF EXISTS (SELECT 1 FROM catalog.quote_email_outbox) THEN
  RAISE EXCEPTION 'Usa una rama aislada con outbox vacía; no ejecutar sobre notificaciones existentes.';
 END IF;
 SELECT v.product_id,v.id AS variant_id,p.name INTO v_product
 FROM catalog.v_product_cards_grouped p
 JOIN catalog.product_variants v ON v.product_id=ANY(p.grouped_product_ids) AND v.is_active
 WHERE p.publication_status='publishable'
 ORDER BY v.product_id,v.id LIMIT 1;
 IF NOT FOUND THEN RAISE EXCEPTION 'No hay una variante pública activa para probar.'; END IF;
 SELECT count(*) INTO v_before FROM catalog.quote_requests;
 v_items:=jsonb_build_array(jsonb_build_object('product_id',v_product.product_id,
  'variant_id',v_product.variant_id,'quantity',1,'product_name_snapshot',v_product.name,
  'variant_snapshot','{}'::jsonb,'notes','Fixture sin envío'));
 v_metadata:=jsonb_build_object('delivery_fingerprint','v1:'||repeat('a',64),'delivery_client_key','v1:'||repeat('b',64));
 v_params:=ARRAY['Fixture sin envío','',gen_random_uuid()::text||'@example.test',
  'Reforma integral','Prueba transaccional','/fixture',v_items::text,v_metadata::text];
 FOR v_index IN 1..8 LOOP
  v_params[v_index]:=encode(convert_to('v:'||v_params[v_index],'UTF8'),'base64');
 END LOOP;

 SELECT * INTO v_response FROM catalog.create_quote_request_secure(v_params);
 IF v_response.status IS DISTINCT FROM 201 OR v_response.body->>'status' IS DISTINCT FROM 'received'
 OR (v_response.body->>'item_count')::integer IS DISTINCT FROM 1 OR v_response.body->>'id' IS NULL THEN
  RAISE EXCEPTION 'Fallo contrato de alta: %',v_response;
 END IF;
 v_id:=v_response.body->>'id';
 SELECT count(*) INTO v_count FROM catalog.quote_email_outbox o WHERE o.quote_request_id=v_id;
 IF v_count<>1 THEN RAISE EXCEPTION 'No se creó exactamente una entrada de outbox.'; END IF;
 SELECT * INTO v_response FROM catalog.create_quote_request_secure(v_params);
 SELECT count(*) INTO v_count FROM catalog.quote_requests;
 IF v_response.status IS DISTINCT FROM 201 OR v_response.body->>'id' IS DISTINCT FROM v_id OR v_count<>v_before+1 THEN
  RAISE EXCEPTION 'La solicitud idéntica se duplicó o falló.';
 END IF;

 SELECT t.job INTO v_job FROM catalog.claim_quote_email(v_id) t;
 IF v_job IS NULL OR v_job->>'renovationType' IS DISTINCT FROM 'Reforma integral' THEN
  RAISE EXCEPTION 'Payload de entrega incompleto.';
 END IF;
 v_token:=(v_job->>'leaseToken')::uuid;
 SELECT count(*) INTO v_count FROM catalog.claim_quote_email(v_id);
 IF v_count<>0 THEN RAISE EXCEPTION 'Un trabajo reclamado volvió a ser reclamado.'; END IF;
 SELECT t.job INTO v_job FROM catalog.begin_quote_email(v_id,v_token) t;
 IF (v_job->>'attempts')::integer IS DISTINCT FROM 1 THEN RAISE EXCEPTION 'No se contabilizó el intento.'; END IF;
 SELECT count(*) INTO v_count FROM catalog.finish_quote_email(v_id,gen_random_uuid(),'sent','fixture_ack',NULL);
 IF v_count<>0 THEN RAISE EXCEPTION 'Se aceptó un lease ajeno.'; END IF;
 PERFORM * FROM catalog.finish_quote_email(v_id,v_token,'retry',NULL,'provider_rate_limited');
 SELECT count(*) INTO v_count FROM catalog.claim_quote_email(v_id);
 IF v_count<>0 THEN RAISE EXCEPTION 'Se ignoró la espera de reintento.'; END IF;
 UPDATE catalog.quote_email_outbox o SET next_attempt_at=now()-interval '1 second' WHERE o.quote_request_id=v_id;
 SELECT t.job INTO v_job FROM catalog.claim_quote_email(v_id) t;
 v_token:=(v_job->>'leaseToken')::uuid;
 PERFORM * FROM catalog.begin_quote_email(v_id,v_token);
 PERFORM * FROM catalog.finish_quote_email(v_id,v_token,'sent','fixture_ack',NULL);
 SELECT o.state,o.attempts INTO v_state,v_attempts FROM catalog.quote_email_outbox o WHERE o.quote_request_id=v_id;
 IF v_state IS DISTINCT FROM 'sent' OR v_attempts IS DISTINCT FROM 2 THEN RAISE EXCEPTION 'No se persistió el acuse simulado.'; END IF;
 SELECT count(*) INTO v_count FROM catalog.claim_quote_email(v_id);
 IF v_count<>0 THEN RAISE EXCEPTION 'Se reencoló un correo confirmado.'; END IF;

 -- El envío empezado y perdido debe quedar incierto, sin reenvío automático.
 v_params[3]:=encode(convert_to('v:'||gen_random_uuid()::text||'@example.test','UTF8'),'base64');
 v_params[8]:=encode(convert_to('v:'||jsonb_build_object('delivery_fingerprint','v1:'||repeat('c',64),
  'delivery_client_key','v1:'||repeat('d',64))::text,'UTF8'),'base64');
 SELECT * INTO v_response FROM catalog.create_quote_request_secure(v_params);
 IF v_response.status IS DISTINCT FROM 201 THEN RAISE EXCEPTION 'No se creó fixture de incertidumbre.'; END IF;
 v_id:=v_response.body->>'id';
 SELECT t.job INTO v_job FROM catalog.claim_quote_email(v_id) t;
 PERFORM * FROM catalog.begin_quote_email(v_id,(v_job->>'leaseToken')::uuid);
 UPDATE catalog.quote_email_outbox o SET lease_until=now()-interval '1 second' WHERE o.quote_request_id=v_id;
 SELECT count(*) INTO v_count FROM catalog.claim_quote_email(v_id);
 SELECT o.state INTO v_state FROM catalog.quote_email_outbox o WHERE o.quote_request_id=v_id;
 IF v_count<>0 OR v_state IS DISTINCT FROM 'uncertain' THEN RAISE EXCEPTION 'Un envío incierto podría reenviarse.'; END IF;

 -- Un lease caducado antes del envío puede recuperarse, pero el dueño antiguo
 -- no puede empezar. El quinto rechazo temporal termina en failed.
 v_params[3]:=encode(convert_to('v:'||gen_random_uuid()::text||'@example.test','UTF8'),'base64');
 v_params[8]:=encode(convert_to('v:'||jsonb_build_object('delivery_fingerprint','v1:'||repeat('7',64),
  'delivery_client_key','v1:'||repeat('8',64))::text,'UTF8'),'base64');
 SELECT * INTO v_response FROM catalog.create_quote_request_secure(v_params);
 IF v_response.status IS DISTINCT FROM 201 THEN RAISE EXCEPTION 'No se creó fixture de lease caducado.'; END IF;
 v_id:=v_response.body->>'id';
 SELECT t.job INTO v_job FROM catalog.claim_quote_email(v_id) t;
 v_old_token:=(v_job->>'leaseToken')::uuid;
 UPDATE catalog.quote_email_outbox o SET lease_until=now()-interval '1 second' WHERE o.quote_request_id=v_id;
 SELECT t.job INTO v_job FROM catalog.claim_quote_email(v_id) t;
 v_token:=(v_job->>'leaseToken')::uuid;
 IF v_token IS NULL OR v_token=v_old_token THEN RAISE EXCEPTION 'No se renovó el lease caducado.'; END IF;
 SELECT count(*) INTO v_count FROM catalog.begin_quote_email(v_id,v_old_token);
 IF v_count<>0 THEN RAISE EXCEPTION 'El dueño del lease antiguo pudo empezar el envío.'; END IF;
 UPDATE catalog.quote_email_outbox o SET attempts=4 WHERE o.quote_request_id=v_id AND o.state='claimed';
 PERFORM * FROM catalog.begin_quote_email(v_id,v_token);
 PERFORM * FROM catalog.finish_quote_email(v_id,v_token,'retry',NULL,'provider_rate_limited');
 SELECT o.state,o.attempts INTO v_state,v_attempts FROM catalog.quote_email_outbox o WHERE o.quote_request_id=v_id;
 IF v_state IS DISTINCT FROM 'failed' OR v_attempts IS DISTINCT FROM 5 THEN RAISE EXCEPTION 'No se aplicó el máximo de intentos.'; END IF;

 -- Un rechazo definitivo de variante no puede insertar un presupuesto parcial.
 SELECT count(*) INTO v_before FROM catalog.quote_requests;
 v_params[7]:=encode(convert_to('v:'||jsonb_build_array(jsonb_build_object('product_id',v_product.product_id,
  'variant_id','fixture-variant-does-not-exist','quantity',1,'variant_snapshot','{}'::jsonb))::text,'UTF8'),'base64');
 v_params[8]:=encode(convert_to('v:'||jsonb_build_object('delivery_fingerprint','v1:'||repeat('e',64),
  'delivery_client_key','v1:'||repeat('f',64))::text,'UTF8'),'base64');
 SELECT * INTO v_response FROM catalog.create_quote_request_secure(v_params);
 SELECT count(*) INTO v_count FROM catalog.quote_requests;
 IF v_response.status IS DISTINCT FROM 400 OR v_count<>v_before THEN RAISE EXCEPTION 'La variante inválida insertó datos.'; END IF;

 -- Seis admisiones por cliente; la séptima debe rechazarse.
 v_params[7]:=encode(convert_to('v:'||v_items::text,'UTF8'),'base64');
 FOR v_index IN 1..7 LOOP
  v_params[3]:=encode(convert_to('v:'||gen_random_uuid()::text||'@example.test','UTF8'),'base64');
  v_params[8]:=encode(convert_to('v:'||jsonb_build_object('delivery_fingerprint','v1:'||lpad(v_index::text,64,'0'),
   'delivery_client_key','v1:'||repeat('1',64))::text,'UTF8'),'base64');
  SELECT * INTO v_response FROM catalog.create_quote_request_secure(v_params);
  IF (v_index<=6 AND v_response.status IS DISTINCT FROM 201) OR (v_index=7 AND v_response.status IS DISTINCT FROM 429) THEN
   RAISE EXCEPTION 'Fallo límite de admisión en intento %: %',v_index,v_response.status;
  END IF;
 END LOOP;
END;
$verify_quote_delivery$;

SELECT 'PASS: alta, contrato, duplicado, payload, leases, reintento, acuse, incertidumbre, máximo de intentos, variante inválida y admisión. Fixtures revertidos al terminar.' AS result;
ROLLBACK;
