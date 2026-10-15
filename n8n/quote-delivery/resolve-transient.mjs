const PUBLIC_KEYS = new Set(['reference','measure','dimension','finish','version','has_led','lighting_type','lighting_technology','light_temp','distribution','glass','opening','orientation','shape','furniture_finish','handle_finish','countertop_finish','presentation_type','furniture_type','module_type','type','configuration','tap_type','installation','mechanism','color','texture','grille','valve','finish_family','length_cm','width_cm','offer','finishCode']);
const LIGHTING_KEYS = new Set(['has_led','lighting_type','lighting_technology','light_temp']);

export function resolveTransientQuote(input, rows) {
  const errors = [];
  const items = input.items.map((item, index) => {
    const row = rows.find(value => value.position === index + 1);
    const snapshot = item.variant_snapshot || {};
    const specs = row?.specs || {};
    const compactTray = !item.variant_id && !item.commercial_offer_variant_id;
    const selectedSize = (specs.size_options || []).find(size => `${size.length_cm}x${size.width_cm}` === snapshot.measure);
    let error = '';
    if (!row?.public_product_id) error = 'El producto ya no está disponible.';
    else if (item.variant_id && item.commercial_offer_variant_id) error = 'Selecciona una variante o una oferta, no ambas.';
    else if (item.variant_id && !row.matched_variant_id) error = 'La variante no pertenece al producto o ya no está disponible.';
    else if (item.commercial_offer_variant_id && !row.matched_offer_variant_id) error = 'La oferta no pertenece al producto o ya no está disponible.';
    else if (!item.variant_id && !item.commercial_offer_variant_id) {
      if (row.supplier_id !== 'duplach' || row.category_id !== 'platos-de-ducha') error = 'La variante completa es obligatoria.';
      else if ((row.configuration_fields || []).some(key => !String(snapshot[key] ?? '').trim())) error = 'Completa todas las opciones del plato de ducha.';
      else if (!selectedSize) error = 'La medida del plato de ducha no está disponible.';
      else if ('texture' in snapshot && !(specs.texture_options || []).includes(snapshot.texture)) error = 'La textura no está disponible.';
      else if ('texture' in snapshot && selectedSize.textures?.length && !selectedSize.textures.includes(snapshot.texture)) error = 'La textura no está disponible para esta medida.';
      else if ('color' in snapshot && !(specs.color_options || []).some(value => value.name === snapshot.color)) error = 'El color no está disponible.';
      else if ('grille' in snapshot && !(specs.grille_options || []).includes(snapshot.grille)) error = 'La rejilla no está disponible.';
      else if ('orientation' in snapshot && !(specs.orientation_options || []).includes(snapshot.orientation)) error = 'La orientación no está disponible.';
      else if ('valve' in snapshot && specs.valve?.type !== snapshot.valve) error = 'La válvula no está disponible.';
      else if ('finish_family' in snapshot && !(specs.finish_families || []).some(value => value.key === snapshot.finish_family)) error = 'La familia de acabado no está disponible.';
      else if ('finish' in snapshot && !(specs.finish_options || []).some(value => value.name === snapshot.finish && value.family_key === snapshot.finish_family)) error = 'El acabado no pertenece a la familia seleccionada.';
    }
    if (error) errors.push({ field: `items[${index}].variantId`, message: error });
    const facts = item.variant_id ? row?.variant_facts : item.commercial_offer_variant_id ? row?.offer_facts : {};
    const lightingApplies = row?.category_id === 'espejos' || (row?.category_id !== 'mamparas' && row?.specs?.LED !== undefined);
    // Real variant facts are authoritative. A stale/client-provided snapshot
    // must not invent a manufacturer reference or cross-category features.
    // Compact trays have no SKU: only validated configuration options pass.
    const trayKeys = new Set([...(row?.configuration_fields || []), 'texture', 'color', 'grille', 'orientation', 'finish_family', 'finish']);
    const selectedFacts = compactTray
      ? Object.fromEntries(Object.entries(snapshot).filter(([key]) => trayKeys.has(key)))
      : facts || {};
    const attributes = Object.fromEntries(Object.entries(selectedFacts)
      .filter(([key, value]) => PUBLIC_KEYS.has(key) && (lightingApplies || !LIGHTING_KEYS.has(key)) && ['string', 'number', 'boolean'].includes(typeof value) && value !== ''));
    if (compactTray) {
      const family = (specs.finish_families || []).find(value => value.key === snapshot.finish_family);
      if (family?.name) attributes.finish_family = family.name;
      if (specs.valve?.type) attributes.valve = specs.valve.type;
    }
    const productTypes = { espejos: 'Espejo', 'platos-de-ducha': 'Plato de ducha', 'muebles-y-lavabos': 'Mueble de baño' };
    const tapTypes = { bide: 'Grifo de bidé', lavabo: 'Grifo de lavabo', lavabo_alto: 'Grifo de lavabo de caño alto', lavabo_bajo: 'Grifo de lavabo de caño bajo' };
    const productType = specs.Tipo || tapTypes[attributes.tap_type] || productTypes[row?.category_id] || row?.category_name;
    const confirmations = [];
    const configLabels = { finish: 'Acabado del mueble', handle_finish: 'Acabado del tirador', countertop_finish: 'Acabado de encimera' };
    if (row?.category_id === 'muebles-y-lavabos') {
      const optionLists = { finish: specs.furniture_finishes, handle_finish: specs.handle_finishes, countertop_finish: specs.countertop_finishes };
      for (const key of row.configuration_fields || []) {
        if (attributes[key] !== undefined || !configLabels[key]) continue;
        // Only retain a preference missing from the SKU when the published
        // option list supports it. It remains explicitly subject to confirmation.
        if (snapshot[key] && (optionLists[key] || []).includes(snapshot[key])) {
          attributes[key] = snapshot[key];
          confirmations.push(`${configLabels[key]}: ${snapshot[key]} solicitado por el cliente. Confirmar compatibilidad con la variante; el catálogo no vincula esta opción a su referencia.`);
        } else confirmations.push(`${configLabels[key]}: no especificado en la variante de catálogo. Confirmarlo con el cliente y el proveedor.`);
      }
    }
    const conflictLabels = { finish: 'acabado', measure: 'medida', dimension: 'dimensiones' };
    for (const [key, sourceValue] of Object.entries(row?.source_facts || {})) {
      if (attributes[key] && sourceValue && String(attributes[key]) !== String(sourceValue)) {
        confirmations.push(`El catálogo contiene datos contradictorios de ${conflictLabels[key] || key}: la variante publicada indica ${attributes[key]} y sus datos complementarios indican ${sourceValue}. Verificarlo con el proveedor antes de presupuestar.`);
      }
    }
    if (row?.category_id === 'mamparas' && !attributes.measure && !attributes.dimension) {
      confirmations.push('Confirmar las medidas de instalación con el cliente. La selección de la web recoge distribución y acabado; revisar las observaciones si ha indicado medidas.');
    }
    const modular = row?.supplier_id === 'royo' && (specs.modularity === 'modular' || specs.Modularidad === 'Modular');
    if (modular) confirmations.push('Confirmar la composición modular y sus medidas con el cliente antes de presupuestar. Los acabados elegidos orientan la composición y no identifican un conjunto cerrado.');
    if (row?.reference_shared === true) confirmations.push('La referencia también figura en otros modelos del mismo proveedor. Verificar modelo y configuración con el proveedor antes de presupuestar.');
    return {
      productName: row?.public_name, supplier: row?.supplier_name, category: row?.category_name,
      productType, categoryId: row?.category_id, productId: row?.public_product_id,
      variantLabel: row?.variant_label, confirmations,
      variantId: row?.matched_variant_id || row?.matched_offer_variant_id,
      productUrl: row?.public_slug ? `https://arealrmq.es/productos/${encodeURIComponent(row.public_slug)}` : undefined,
      quantity: item.quantity, attributes, notes: item.notes,
    };
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
