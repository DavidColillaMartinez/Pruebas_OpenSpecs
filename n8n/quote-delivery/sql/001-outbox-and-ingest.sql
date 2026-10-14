-- PREPARADO, NO APLICADO: ejecutar únicamente tras autorizar el punto 5.
-- SECURITY INVOKER: no añade privilegios ni modifica solicitudes anteriores.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
CREATE TABLE IF NOT EXISTS catalog.quote_email_outbox (
 quote_request_id text PRIMARY KEY,
 state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','claimed','sending','sent','retry','failed','uncertain')),
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 lease_token uuid,
 lease_until timestamptz,
 provider_message_id text,
 error_class text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (error_class IS NULL OR error_class ~ '^[a-z0-9_]{1,64}$')
);
CREATE INDEX IF NOT EXISTS quote_email_outbox_pending_idx
 ON catalog.quote_email_outbox(next_attempt_at) WHERE state IN ('pending','retry');
CREATE INDEX IF NOT EXISTS quote_delivery_fingerprint_idx
 ON catalog.quote_requests ((metadata->>'delivery_fingerprint'),created_at)
 WHERE metadata ? 'delivery_fingerprint';
CREATE TABLE IF NOT EXISTS catalog.quote_ingress_windows (
 client_key text PRIMARY KEY,
 window_until timestamptz NOT NULL,
 count integer NOT NULL CHECK (count>=0)
);

CREATE OR REPLACE FUNCTION catalog.create_quote_request_secure(p_encoded text[])
RETURNS TABLE(status integer,body jsonb)
LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path = pg_catalog,catalog,public
AS $quote_ingest$
DECLARE
 v_metadata jsonb;
 v_fingerprint text;
 v_client text;
 v_row record;
 v_count integer;
BEGIN
 IF cardinality(p_encoded)<>8 THEN RAISE EXCEPTION 'INVALID_QUOTE_PARAMETERS'; END IF;
 v_metadata := substr(convert_from(decode(p_encoded[8],'base64'),'UTF8'),3)::jsonb;
 v_fingerprint := v_metadata->>'delivery_fingerprint';
 v_client := v_metadata->>'delivery_client_key';
 IF v_fingerprint IS NULL OR v_fingerprint !~ '^v1:[a-f0-9]{64}$'
 OR v_client IS NULL OR v_client !~ '^v1:[a-f0-9]{64}$' THEN
  RETURN QUERY SELECT 400,jsonb_build_object('error','VALIDATION_ERROR','message','La solicitud no es válida.'); RETURN;
 END IF;
 -- Separate statements inside a VOLATILE function take fresh snapshots after
 -- the lock, avoiding the stale-snapshot race of a lock inside one CTE.
 PERFORM pg_advisory_xact_lock(hashtext('lrmq:quote-rate-limit'));
 SELECT q.id::text AS id,q.status,q.created_at,
  (SELECT count(*) FROM catalog.quote_request_items i WHERE i.quote_request_id=q.id) AS item_count
 INTO v_row FROM catalog.quote_requests q
 WHERE q.metadata->>'delivery_fingerprint'=v_fingerprint
 AND q.created_at>=now()-interval '10 minutes'
 ORDER BY q.created_at DESC LIMIT 1;
 IF FOUND THEN
  -- The database lifecycle status is `new`; the public API contract reports
  -- receipt independently so the approved basket flow can confirm delivery.
  RETURN QUERY SELECT 201,jsonb_build_object('id',v_row.id,'status','received',
   'created_at',v_row.created_at,'item_count',v_row.item_count);
  RETURN;
 END IF;
 INSERT INTO catalog.quote_ingress_windows(client_key,window_until,count)
 VALUES('global',now()+interval '1 minute',1)
 ON CONFLICT(client_key) DO UPDATE SET
 count=CASE WHEN catalog.quote_ingress_windows.window_until<=now() THEN 1 ELSE least(catalog.quote_ingress_windows.count+1,31) END,
 window_until=CASE WHEN catalog.quote_ingress_windows.window_until<=now() THEN now()+interval '1 minute' ELSE catalog.quote_ingress_windows.window_until END
 RETURNING count INTO v_count;
 IF v_count>30 THEN
  RETURN QUERY SELECT 429,jsonb_build_object('error','RATE_LIMITED','message','Espera unos minutos antes de enviar otra solicitud.'); RETURN;
 END IF;
 INSERT INTO catalog.quote_ingress_windows(client_key,window_until,count)
 VALUES(v_client,now()+interval '1 minute',1)
 ON CONFLICT(client_key) DO UPDATE SET
 count=CASE WHEN catalog.quote_ingress_windows.window_until<=now() THEN 1 ELSE least(catalog.quote_ingress_windows.count+1,7) END,
 window_until=CASE WHEN catalog.quote_ingress_windows.window_until<=now() THEN now()+interval '1 minute' ELSE catalog.quote_ingress_windows.window_until END
 RETURNING count INTO v_count;
 IF v_count>6 THEN
  RETURN QUERY SELECT 429,jsonb_build_object('error','RATE_LIMITED','message','Espera unos minutos antes de enviar otra solicitud.'); RETURN;
 END IF;
 FOR v_row IN
WITH rate_limit_lock AS MATERIALIZED (
 SELECT pg_advisory_xact_lock(hashtext('lrmq:quote-rate-limit')) AS acquired
), params AS (
 SELECT substr(convert_from(decode(p_encoded[1],'base64'),'UTF8'),3) AS customer_name,
 substr(convert_from(decode(p_encoded[2],'base64'),'UTF8'),3) AS phone,
 substr(convert_from(decode(p_encoded[3],'base64'),'UTF8'),3) AS email,
 substr(convert_from(decode(p_encoded[4],'base64'),'UTF8'),3) AS renovation_type,
 substr(convert_from(decode(p_encoded[5],'base64'),'UTF8'),3) AS message,
 substr(convert_from(decode(p_encoded[6],'base64'),'UTF8'),3) AS source_page,
 substr(convert_from(decode(p_encoded[7],'base64'),'UTF8'),3)::jsonb AS items,
 substr(convert_from(decode(p_encoded[8],'base64'),'UTF8'),3)::jsonb AS metadata
), requested AS (
 SELECT item,ordinality::integer AS position,
 NULLIF(item->>'product_id','') AS product_id,
 NULLIF(item->>'variant_id','') AS variant_id,
 NULLIF(item->>'commercial_offer_variant_id','') AS offer_variant_id,
 COALESCE(item->'variant_snapshot','{}'::jsonb) AS snapshot
 FROM params CROSS JOIN LATERAL jsonb_array_elements(items) WITH ORDINALITY q(item,ordinality)
), resolved AS (
 SELECT r.*,p.id AS public_product_id,p.name AS public_name,p.collection,
 p.supplier_id,p.supplier_name,p.category_id,p.category_name,p.main_image_url,
 p.specs,p.configuration_fields,v.id AS matched_variant_id,
 ov.id AS matched_offer_variant_id,
 v.reference AS variant_reference,ov.reference AS offer_reference,
 COALESCE(v.attributes,'{}'::jsonb) || jsonb_build_object(
  'reference',v.reference,'measure',v.measure,'dimension',v.dimension,'finish',v.finish,
  'version',COALESCE(v.attributes->>'version',v.raw_data->>'fixed_version'),
  'has_led',COALESCE(v.raw_data->'has_led',CASE lower(p.specs->>'LED') WHEN 'sí' THEN 'true'::jsonb WHEN 'si' THEN 'true'::jsonb WHEN 'no' THEN 'false'::jsonb ELSE NULL END),
  'lighting_type',COALESCE(v.attributes->>'lighting_type',v.raw_data->>'lighting_type',p.specs->>'Tipo de iluminación'),
  'lighting_technology',COALESCE(v.attributes->>'lighting_technology',v.raw_data->>'lighting_technology',p.specs->>'Tecnología de iluminación'),
  'light_temp',COALESCE(v.raw_data->>'light_temp',v.light_temp,p.specs->>'Temperatura de luz'),
  'shape',COALESCE(p.specs->>'Forma',p.specs->>'shape')
 ) AS variant_facts,
 jsonb_build_object('reference',ov.reference,'finish',ov.finish_name,'finishCode',ov.finish_code,'offer',o.offer_type) AS offer_facts
 FROM requested r
 LEFT JOIN LATERAL (
  SELECT p.* FROM catalog.v_product_cards_grouped p
  WHERE p.publication_status='publishable'
    AND (p.id=r.product_id OR r.product_id=ANY(p.grouped_product_ids))
  ORDER BY (p.id=r.product_id) DESC LIMIT 1
 ) p ON true
 LEFT JOIN catalog.product_variants v
  ON v.id=r.variant_id AND v.product_id=ANY(p.grouped_product_ids) AND v.is_active
 LEFT JOIN catalog.commercial_offers o
  ON o.product_id=ANY(p.grouped_product_ids) AND EXISTS(SELECT 1 FROM catalog.commercial_offer_variants selected_offer WHERE selected_offer.id=r.offer_variant_id AND selected_offer.offer_id=o.id)
 LEFT JOIN catalog.commercial_offer_variants ov
  ON ov.id=r.offer_variant_id AND ov.offer_id=o.id
 WHERE o.id IS NULL OR r.offer_variant_id IS NULL OR ov.id IS NOT NULL
), checked AS (
 SELECT r.*,
 CASE
  WHEN public_product_id IS NULL THEN 'El producto ya no está disponible.'
  WHEN variant_id IS NOT NULL AND offer_variant_id IS NOT NULL THEN 'Selecciona una variante o una oferta, no ambas.'
  WHEN variant_id IS NOT NULL AND matched_variant_id IS NULL THEN 'La variante no pertenece al producto o ya no está disponible.'
  WHEN offer_variant_id IS NOT NULL AND matched_offer_variant_id IS NULL THEN 'La oferta no pertenece al producto o ya no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND NOT (supplier_id='duplach' AND category_id='platos-de-ducha') THEN 'La variante completa es obligatoria.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND EXISTS(
   SELECT 1 FROM unnest(COALESCE(configuration_fields,ARRAY[]::text[])) key
   WHERE NULLIF(snapshot->>key,'') IS NULL
  ) THEN 'Completa todas las opciones del plato de ducha.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND NOT EXISTS (
   SELECT 1 FROM jsonb_array_elements(COALESCE(specs->'size_options','[]'::jsonb)) size
   WHERE concat(size->>'length_cm','x',size->>'width_cm')=snapshot->>'measure'
  ) THEN 'La medida del plato de ducha no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND snapshot ? 'texture' AND NOT EXISTS (
   SELECT 1 FROM jsonb_array_elements_text(COALESCE(specs->'texture_options','[]'::jsonb)) value WHERE value=snapshot->>'texture'
  ) THEN 'La textura del plato de ducha no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND snapshot ? 'color' AND NOT EXISTS (
   SELECT 1 FROM jsonb_array_elements(COALESCE(specs->'color_options','[]'::jsonb)) value WHERE value->>'name'=snapshot->>'color'
  ) THEN 'El color del plato de ducha no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND snapshot ? 'grille' AND NOT EXISTS (
   SELECT 1 FROM jsonb_array_elements_text(COALESCE(specs->'grille_options','[]'::jsonb)) value WHERE value=snapshot->>'grille'
  ) THEN 'La rejilla del plato de ducha no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND snapshot ? 'orientation' AND NOT EXISTS (
   SELECT 1 FROM jsonb_array_elements_text(COALESCE(specs->'orientation_options','[]'::jsonb)) value WHERE value=snapshot->>'orientation'
  ) THEN 'La orientación del plato de ducha no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND snapshot ? 'valve' AND COALESCE(specs->'valve'->>'type','')<>snapshot->>'valve' THEN 'La válvula del plato de ducha no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND snapshot ? 'finish_family' AND NOT EXISTS (
   SELECT 1 FROM jsonb_array_elements(COALESCE(specs->'finish_families','[]'::jsonb)) value WHERE value->>'key'=snapshot->>'finish_family'
  ) THEN 'La familia de acabado no está disponible.'
  WHEN variant_id IS NULL AND offer_variant_id IS NULL AND snapshot ? 'finish' AND NOT EXISTS (
   SELECT 1 FROM jsonb_array_elements(COALESCE(specs->'finish_options','[]'::jsonb)) value
   WHERE value->>'name'=snapshot->>'finish' AND value->>'family_key'=snapshot->>'finish_family'
  ) THEN 'El acabado no pertenece a la familia seleccionada.'
  ELSE NULL
 END AS validation_error
 FROM resolved r
), prepared AS (
 SELECT c.*,
 COALESCE((
  SELECT jsonb_object_agg(key,value) FROM jsonb_each(
   CASE WHEN variant_id IS NOT NULL THEN snapshot||variant_facts
        WHEN offer_variant_id IS NOT NULL THEN snapshot||offer_facts
        ELSE snapshot END
  ) e(key,value)
  WHERE key IN ('reference','measure','dimension','finish','version','has_led','lighting_type','lighting_technology','light_temp','distribution','glass','opening','orientation','shape','furniture_finish','handle_finish','countertop_finish','presentation_type','furniture_type','module_type','type','configuration','tap_type','installation','mechanism','color','texture','grille','valve','finish_family','length_cm','width_cm','offer','finishCode') AND value<>'null'::jsonb AND value<>'""'::jsonb
 ),'{}'::jsonb) AS clean_snapshot
 FROM checked c
), decision AS (
 SELECT
 (SELECT count(*) FROM prepared)=(SELECT count(*) FROM requested)
 AND NOT EXISTS(SELECT 1 FROM prepared WHERE validation_error IS NOT NULL) AS valid,
 NOT EXISTS(
  SELECT 1 FROM catalog.quote_requests q CROSS JOIN params x
  WHERE q.created_at>=now()-interval '2 minutes'
   AND ((x.email<>'' AND lower(q.email)=lower(x.email)) OR (x.phone<>'' AND q.phone=x.phone))
 ) AND (SELECT count(*)<30 FROM catalog.quote_requests WHERE created_at>=now()-interval '1 minute') AS can_insert
 FROM params CROSS JOIN rate_limit_lock
), new_request AS (
 INSERT INTO catalog.quote_requests AS saved_request(customer_name,phone,email,renovation_type,message,source_page,consent_privacy,metadata)
 SELECT x.customer_name,NULLIF(x.phone,''),NULLIF(x.email,''),NULLIF(x.renovation_type,''),NULLIF(x.message,''),NULLIF(x.source_page,''),true,
 x.metadata||jsonb_build_object('items_context',(
  SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
   'position',position,'product_id',product_id,'variant_id',variant_id,'commercial_offer_variant_id',offer_variant_id,
   'supplier_id',supplier_id,'supplier',supplier_name,'category_id',category_id,'category',category_name,
   'model',COALESCE(collection,public_name),'reference',COALESCE(variant_reference,offer_reference),
   'image_url',main_image_url
  )) ORDER BY position) FROM prepared
 ))
 FROM params x CROSS JOIN decision d WHERE d.valid AND d.can_insert
 RETURNING saved_request.id,saved_request.status,saved_request.created_at
), inserted_items AS (
 INSERT INTO catalog.quote_request_items(quote_request_id,product_id,variant_id,commercial_offer_variant_id,quantity,product_name_snapshot,variant_snapshot,notes)
 SELECT q.id,p.product_id,p.variant_id,p.offer_variant_id,(p.item->>'quantity')::integer,p.public_name,p.clean_snapshot,NULLIF(p.item->>'notes','')
 FROM new_request q CROSS JOIN prepared p
 RETURNING id
)
SELECT CASE WHEN NOT d.valid THEN 400 WHEN d.can_insert THEN 201 ELSE 429 END AS status,
 CASE WHEN NOT d.valid THEN jsonb_build_object('error','VALIDATION_ERROR','errors',COALESCE((
  SELECT jsonb_agg(jsonb_build_object('field','items['||(position-1)||'].variantId','message',validation_error) ORDER BY position)
  FROM prepared WHERE validation_error IS NOT NULL
 ),jsonb_build_array(jsonb_build_object('field','items','message','Una variante u oferta no pertenece al producto.'))))
 WHEN d.can_insert THEN (
  SELECT jsonb_build_object('id',q.id::text,'status','received','created_at',q.created_at,'item_count',(SELECT count(*) FROM inserted_items))
  FROM new_request q
 ) ELSE jsonb_build_object('error','RATE_LIMITED','message','Espera unos minutos antes de enviar otra solicitud.') END AS body
FROM decision d
 LOOP
  IF v_row.status=201 THEN
   INSERT INTO catalog.quote_email_outbox(quote_request_id) VALUES(v_row.body->>'id')
   ON CONFLICT(quote_request_id) DO NOTHING;
  END IF;
  RETURN QUERY SELECT v_row.status::integer,v_row.body::jsonb;
 END LOOP;
END;
$quote_ingest$;

COMMIT;
