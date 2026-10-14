-- Read-only catalog lookup. Receives identifiers only, never contact, message or notes.
WITH requested AS (
 SELECT item, ordinality::integer AS position,
 NULLIF(item->>'product_id','') AS product_id,
 NULLIF(item->>'variant_id','') AS variant_id,
 NULLIF(item->>'commercial_offer_variant_id','') AS offer_variant_id,
 '{}'::jsonb AS snapshot
 FROM jsonb_array_elements(convert_from(decode($1,'base64'),'UTF8')::jsonb)
 WITH ORDINALITY q(item,ordinality)
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

)
SELECT position,public_product_id,public_name,supplier_id,category_id,configuration_fields,specs,
 matched_variant_id,matched_offer_variant_id,variant_facts,offer_facts
FROM resolved ORDER BY position;
