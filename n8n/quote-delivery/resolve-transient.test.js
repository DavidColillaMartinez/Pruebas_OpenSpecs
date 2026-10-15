import { describe, expect, it } from 'vitest';
import { resolveTransientQuote, transientConfirmation } from './resolve-transient.mjs';
import { resendRequest } from './format-mail.mjs';

const input = { quoteId: 'q-123', contact: { customerName: 'Cliente de ejemplo', email: 'example@example.test' }, items: [{ product_id: 'gme-example', variant_id: 'variant-1', quantity: 2, variant_snapshot: { finish: 'Inventado', price: 999 }, notes: 'Observación' }] };
const row = { position: 1, public_product_id: 'gme-example', public_name: 'Mampara', matched_variant_id: 'variant-1', variant_facts: { finish: 'Cromo', reference: 'ABC' } };

describe('quote delivery without a stored request', () => {
  it('uses canonical facts only for real variants and identifies missing screen measurements', () => {
    const request = { ...input, items: [{ ...input.items[0], variant_snapshot: { reference: 'invented', measure: '200x100', has_led: true, finish: 'Inventado' } }] };
    const screenRow = { ...row, supplier_id: 'gme', category_id: 'mamparas', category_name: 'Mamparas', public_name: 'Basic', variant_label: 'Angular al vértice - Blanco', specs: { Tipo: 'Mampara de ducha' }, variant_facts: { reference: null, finish: 'Blanco', distribution: 'Angular al vértice', has_led: false } };
    const result = resolveTransientQuote(request, [screenRow]);
    expect(result.valid).toBe('true');
    expect(result.job.items[0].attributes).toEqual({ finish: 'Blanco', distribution: 'Angular al vértice' });
    const mail = resendRequest(result.job).body.text;
    expect(mail).toContain('Selección de catálogo: Angular al vértice - Blanco');
    expect(mail).toContain('Confirmar las medidas de instalación con el cliente');
    expect(mail).not.toContain('invented');
    expect(mail).not.toContain('200x100');
    expect(mail).not.toContain('LED:');
  });
  it('flags supplier-shared references without replacing the published manufacturer code', () => {
    const tap = { ...row, public_name: 'Persio', category_id: 'griferia', category_name: 'Grifería', supplier_id: 'gme', reference_shared: true, variant_facts: { reference: '3265', tap_type: 'bide', finish: 'Cromo' } };
    const mail = resendRequest(resolveTransientQuote(input, [tap]).job).body.text;
    expect(mail).toContain('Persio — Grifo de bidé');
    expect(mail).toContain('Tipo de grifo: Bidé');
    expect(mail).toContain('Referencia del fabricante: 3265');
    expect(mail).toContain('La referencia también figura en otros modelos del mismo proveedor');
    expect(resolveTransientQuote(input, [{ ...tap, reference_shared: false }]).job.items[0].confirmations).toEqual([]);
  });
  it('makes modular Royo selections explicit without fabricating composition, size or a reference', () => {
    const furniture = { ...row, public_name: 'Vida · Mueble de baño modular', supplier_id: 'royo', category_id: 'muebles-y-lavabos', specs: { modularity: 'modular' }, variant_facts: { reference: null, finish: 'Nogal', furniture_finish: 'Nogal', handle_finish: 'Cromo', configuration_status: 'composition_requires_confirmation' } };
    const result = resolveTransientQuote(input, [furniture]);
    const text = resendRequest(result.job).body.text;
    expect(text).toContain('Confirmar la composición modular y sus medidas con el cliente antes de presupuestar');
    expect(text).toContain('Acabado del mueble: Nogal');
    expect(text).not.toContain('  Acabado: Nogal');
    expect(text).not.toContain('configuration_status');
    expect(result.job.items[0].attributes).not.toHaveProperty('reference');
  });
  it('preserves supported furniture preferences missing from the SKU as subject to confirmation', () => {
    const furniture = { ...row, supplier_id: 'royo', category_id: 'muebles-y-lavabos', configuration_fields: ['finish', 'handle_finish'], specs: { handle_finishes: ['Cromo', 'Negro'] }, variant_facts: { reference: 'R1', finish: 'Nogal', furniture_finish: 'Nogal' } };
    const result = resolveTransientQuote({ ...input, items: [{ ...input.items[0], variant_snapshot: { handle_finish: 'Negro' } }] }, [furniture]);
    expect(result.job.items[0].attributes.handle_finish).toBe('Negro');
    expect(resendRequest(result.job).body.text).toContain('Confirmar compatibilidad con la variante');
    const unsupported = resolveTransientQuote({ ...input, items: [{ ...input.items[0], variant_snapshot: { handle_finish: 'Inventado' } }] }, [furniture]);
    expect(unsupported.job.items[0].attributes).not.toHaveProperty('handle_finish');
    expect(resendRequest(unsupported.job).body.text).toContain('Acabado del tirador: no especificado');
  });
  it('reports contradictory canonical and complementary catalog facts instead of silently choosing an orderable configuration', () => {
    const furniture = { ...row, supplier_id: 'royo', category_id: 'muebles-y-lavabos', variant_facts: { reference: 'C0076756', finish: 'Roble Eternity', furniture_finish: 'Roble Eternity' }, source_facts: { finish: 'Verde Pure' } };
    const mail = resendRequest(resolveTransientQuote(input, [furniture]).job).body.text;
    expect(mail).toContain('Acabado del mueble: Roble Eternity');
    expect(mail).toContain('datos contradictorios de acabado');
    expect(mail).toContain('datos complementarios indican Verde Pure');
  });
  it('validates compact trays and resolves family, valve and readable measurements from catalog options', () => {
    const trayInput = { ...input, items: [{ product_id: 'duplach-stone-3d', quantity: 1, variant_snapshot: { measure: '100x70', finish_family: 'maderas-rusticas', finish: 'Roble', reference: 'fake-ref', has_led: true } }] };
    const tray = { position: 1, public_product_id: 'duplach-stone-3d', category_id: 'platos-de-ducha', category_name: 'Platos de ducha', supplier_id: 'duplach', public_name: 'Stone 3D', configuration_fields: ['measure', 'finish_family', 'finish'], specs: { size_options: [{ length_cm: 100, width_cm: 70 }], finish_families: [{ key: 'maderas-rusticas', name: 'Maderas rústicas' }], finish_options: [{ family_key: 'maderas-rusticas', name: 'Roble' }], valve: { type: 'Sifón' } } };
    const result = resolveTransientQuote(trayInput, [tray]);
    expect(result.valid).toBe('true');
    expect(result.job.items[0].attributes).toEqual({ measure: '100x70', finish_family: 'Maderas rústicas', finish: 'Roble', valve: 'Sifón' });
    expect(resendRequest(result.job).body.text).toContain('Medida: 100 × 70 cm');
    const textured = { ...tray, configuration_fields: ['measure', 'texture'], specs: { size_options: [{ length_cm: 100, width_cm: 70, textures: ['Pizarra'] }], texture_options: ['Pizarra', 'Piedra'] } };
    expect(resolveTransientQuote({ ...trayInput, items: [{ ...trayInput.items[0], variant_snapshot: { measure: '100x70', texture: 'Piedra' } }] }, [textured]).status).toBe(400);
  });
  it('distinguishes the Basic shower screen from the Basic mirror and removes lighting from screens', () => {
    const context = { ...input, items: [input.items[0], input.items[0]] };
    const rows = [
      { ...row, public_name: 'Basic', public_slug: 'gme-mamparas-ducha-basic', supplier_name: 'GME División Baños', category_id: 'mamparas', category_name: 'Mamparas', specs: { Tipo: 'Mampara de ducha' }, variant_facts: { has_led: false, lighting_type: 'Sin luz', lighting_technology: 'Sin LED', reference: null } },
      { ...row, position: 2, public_name: 'Basic', supplier_name: 'Manillons Torrent', category_id: 'espejos', category_name: 'Espejos', variant_facts: { has_led: false, reference: '7049' } },
    ];
    const result = resolveTransientQuote(context, rows);
    const screen = result.job.items[0];
    expect(screen).toMatchObject({ supplier: 'GME División Baños', productType: 'Mampara de ducha', variantId: 'variant-1', productUrl: 'https://arealrmq.es/productos/gme-mamparas-ducha-basic' });
    expect(screen.attributes).not.toHaveProperty('has_led');
    expect(screen.attributes).not.toHaveProperty('lighting_type');
    const mirror = result.job.items[1];
    expect(mirror).toMatchObject({ productType: 'Espejo', supplier: 'Manillons Torrent', attributes: { has_led: false, reference: '7049' } });
    const text = resendRequest(result.job).body.text;
    expect(text).toContain('1. Basic — Mampara de ducha');
    expect(text).toContain('2. Basic — Espejo');
    expect(text).toContain('Referencia del fabricante: No disponible en el catálogo');
    expect(text).toContain('Identificador de variante/oferta: variant-1');
  });
  it('resolves catalog facts and strips unsupported attributes before sending', () => {
    const result = resolveTransientQuote(input, [row]);
    expect(result.valid).toBe('true');
    expect(result.job.items[0]).toMatchObject({ productName: 'Mampara', quantity: 2, attributes: { finish: 'Cromo', reference: 'ABC' } });
    expect(result.job.items[0].attributes).not.toHaveProperty('price');
  });
  it('rejects missing products and mismatched variants', () => {
    expect(resolveTransientQuote(input, []).status).toBe(400);
    expect(resolveTransientQuote(input, [{ ...row, matched_variant_id: null }]).status).toBe(400);
  });
  it('keeps retries deterministic without a timestamp or stored job', () => {
    const job = resolveTransientQuote(input, [row]).job;
    expect(resendRequest(job)).toEqual(resendRequest(job));
    expect(resendRequest(job).body.reply_to).toBe(input.contact.email);
    expect(resendRequest(job).body.text).not.toContain('Recibida:');
  });
  it('confirms only an acknowledged provider send and reports ambiguity', () => {
    const prepared = resolveTransientQuote(input, [row]);
    expect(transientConfirmation({ statusCode: 200, body: { id: 'mail-1' } }, prepared).body).toMatchObject({ status: 'received', item_count: 1 });
    expect(transientConfirmation({ statusCode: 500 }, prepared).status).toBe(503);
    expect(transientConfirmation({ statusCode: 200, body: {} }, prepared).status).toBe(503);
    expect(transientConfirmation({ statusCode: 429 }, prepared).status).toBe(429);
  });
});
