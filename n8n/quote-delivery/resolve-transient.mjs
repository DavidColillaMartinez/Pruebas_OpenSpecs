const PUBLIC_KEYS = new Set(['reference','measure','dimension','finish','version','has_led','lighting_type','lighting_technology','light_temp','distribution','glass','opening','orientation','shape','furniture_finish','handle_finish','countertop_finish','presentation_type','furniture_type','module_type','type','configuration','tap_type','installation','mechanism','color','texture','grille','valve','finish_family','length_cm','width_cm','offer','finishCode']);

export function resolveTransientQuote(input, rows) {
  const errors = [];
  const items = input.items.map((item, index) => {
    const row = rows.find(value => value.position === index + 1);
    const snapshot = item.variant_snapshot;
    let error = '';
    if (!row?.public_product_id) error = 'El producto ya no está disponible.';
    else if (item.variant_id && item.commercial_offer_variant_id) error = 'Selecciona una variante o una oferta, no ambas.';
    else if (item.variant_id && !row.matched_variant_id) error = 'La variante no pertenece al producto o ya no está disponible.';
    else if (item.commercial_offer_variant_id && !row.matched_offer_variant_id) error = 'La oferta no pertenece al producto o ya no está disponible.';
    else if (!item.variant_id && !item.commercial_offer_variant_id) {
      const specs = row.specs || {};
      if (row.supplier_id !== 'duplach' || row.category_id !== 'platos-de-ducha') error = 'La variante completa es obligatoria.';
      else if ((row.configuration_fields || []).some(key => !String(snapshot[key] ?? '').trim())) error = 'Completa todas las opciones del plato de ducha.';
      else if (!(specs.size_options || []).some(size => `${size.length_cm}x${size.width_cm}` === snapshot.measure)) error = 'La medida del plato de ducha no está disponible.';
      else if ('texture' in snapshot && !(specs.texture_options || []).includes(snapshot.texture)) error = 'La textura no está disponible.';
      else if ('color' in snapshot && !(specs.color_options || []).some(value => value.name === snapshot.color)) error = 'El color no está disponible.';
      else if ('grille' in snapshot && !(specs.grille_options || []).includes(snapshot.grille)) error = 'La rejilla no está disponible.';
      else if ('orientation' in snapshot && !(specs.orientation_options || []).includes(snapshot.orientation)) error = 'La orientación no está disponible.';
      else if ('valve' in snapshot && specs.valve?.type !== snapshot.valve) error = 'La válvula no está disponible.';
      else if ('finish_family' in snapshot && !(specs.finish_families || []).some(value => value.key === snapshot.finish_family)) error = 'La familia de acabado no está disponible.';
      else if ('finish' in snapshot && !(specs.finish_options || []).some(value => value.name === snapshot.finish && value.family_key === snapshot.finish_family)) error = 'El acabado no pertenece a la familia seleccionada.';
    }
    if (error) errors.push({ field: `items[${index}].variantId`, message: error });
    const facts = item.variant_id ? row?.variant_facts : item.commercial_offer_variant_id ? row?.offer_facts : {};
    const attributes = Object.fromEntries(Object.entries({ ...snapshot, ...facts })
      .filter(([key, value]) => PUBLIC_KEYS.has(key) && ['string', 'number', 'boolean'].includes(typeof value) && value !== ''));
    return { productName: row?.public_name, quantity: item.quantity, attributes, notes: item.notes };
  });
  if (errors.length) return { valid: 'false', status: 400, body: { error: 'VALIDATION_ERROR', errors } };
  // Dates are provided by Resend. Keeping the mail payload deterministic means
  // an explicit retry uses the same body and idempotency key, without a stored job.
  return { valid: 'true', job: { quoteId: input.quoteId, ...input.contact, items } };
}

export function transientConfirmation(result, prepared, now = new Date().toISOString()) {
  const code = Number(result?.statusCode);
  if (code >= 200 && code < 300 && typeof result?.body?.id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(result.body.id)) {
    return { status: 201, body: { id: prepared.job.quoteId, status: 'received', created_at: now, item_count: prepared.job.items.length } };
  }
  if (code === 429) return { status: 429, body: { error: 'RATE_LIMITED', message: 'No se pudo enviar el correo. Inténtalo más tarde.' } };
  return { status: 503, body: { error: 'QUOTE_UNAVAILABLE', message: 'No se pudo confirmar el envío. La web no guarda una copia. Contacta con la empresa antes de repetirlo.' } };
}
