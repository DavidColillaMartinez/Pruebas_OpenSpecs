import { describe, expect, it } from 'vitest';
import { resolveTransientQuote, transientConfirmation } from './resolve-transient.mjs';
import { resendRequest } from './format-mail.mjs';

const input = { quoteId: 'q-123', contact: { customerName: 'Cliente de ejemplo', email: 'example@example.test' }, items: [{ product_id: 'gme-example', variant_id: 'variant-1', quantity: 2, variant_snapshot: { finish: 'Inventado', price: 999 }, notes: 'Observación' }] };
const row = { position: 1, public_product_id: 'gme-example', public_name: 'Mampara', matched_variant_id: 'variant-1', variant_facts: { finish: 'Cromo', reference: 'ABC' } };

describe('quote delivery without a stored request', () => {
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
