import { afterEach, describe, expect, it } from 'vitest';
import { prepareQuoteIngress, resetQuoteBurstGuard, QUOTE_AUTH_HEADER, QUOTE_FINGERPRINT_HEADER, QUOTE_CLIENT_HEADER } from './quoteIngress.js';

const env = { N8N_QUOTE_DELIVERY_ENABLED: 'true', N8N_QUOTE_WEBHOOK_SECRET: 'test-only-secret-never-use-in-production-0123456789', QUOTE_ALLOWED_ORIGINS: 'https://web.example', VERCEL: '1' };
const request = { headers: { origin: 'https://web.example', 'sec-fetch-site': 'same-origin', 'x-vercel-forwarded-for': '192.0.2.4' } };
const body = { customerName: 'Ana', email: 'ana@example.test', items: [] };
afterEach(resetQuoteBurstGuard);
describe('quote delivery ingress (execution pending owner approval)', () => {
  it('does not change the legacy route before cutover', () => {
    expect(prepareQuoteIngress({}, body, {})).toEqual({ headers: {} });
  });
  it('fails closed without configuration or trusted client metadata', () => {
    expect(prepareQuoteIngress(request, body, { ...env, N8N_QUOTE_WEBHOOK_SECRET: '' }).status).toBe(503);
    expect(prepareQuoteIngress({ headers: { origin: 'https://web.example' } }, body, env).status).toBe(503);
  });
  it('rejects missing, foreign and non-origin URLs', () => {
    for (const origin of ['', 'https://evil.example', 'https://web.example/path']) {
      expect(prepareQuoteIngress({ headers: { ...request.headers, origin } }, body, env).status).toBe(403);
    }
  });
  it('creates server-owned keyed metadata, independent of property order', () => {
    const first = prepareQuoteIngress(request, body, env, 1000);
    const second = prepareQuoteIngress(request, { email: 'ANA@example.test', items: [], customerName: ' Ana ' }, env, 1000);
    expect(first.headers[QUOTE_AUTH_HEADER]).toBe(env.N8N_QUOTE_WEBHOOK_SECRET);
    expect(first.headers[QUOTE_FINGERPRINT_HEADER]).toBe(second.headers[QUOTE_FINGERPRINT_HEADER]);
    expect(first.headers[QUOTE_CLIENT_HEADER]).toMatch(/^v1:[a-f0-9]{64}$/);
    expect(JSON.stringify(first.headers)).not.toContain('192.0.2.4');
  });
  it('applies only a bounded local burst guard and expires its bucket', () => {
    for (let i = 0; i < 6; i++) expect(prepareQuoteIngress(request, body, env, 1000).status).toBeUndefined();
    expect(prepareQuoteIngress(request, body, env, 1000).status).toBe(429);
    expect(prepareQuoteIngress(request, body, env, 61000).status).toBeUndefined();
  });
});
