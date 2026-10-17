// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { renderProductPage } from '../../src/entry-product-server.jsx';
import { handleProductPageRequest } from './productPage.js';

const template = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const fixture = JSON.parse(await readFile(new URL('../../src/features/catalog/api/fixtures/product-detail.mt-espejos-alba.json', import.meta.url), 'utf8'));

function response() {
  return {
    headers: {}, status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    send(body) { this.body = body; }, end() {},
  };
}

describe('shared product renderer', () => {
  it('renders public content in Node without browser globals or a POST and embeds only the normalized model', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ...fixture, private_token: 'secret-canary', customer_email: 'private@example.test', publication_status: 'publishable' }), { status: 200 }));
    const res = response();
    await handleProductPageRequest({ method: 'GET', query: { slug: fixture.slug } }, res, {
      readShell: async () => template,
      renderPage: renderProductPage,
      fetchImpl,
      env: { N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL: 'https://upstream.example.test/catalog' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatch(/<h1[^>]*>Alba<\/h1>/);
    expect(res.body).toContain('id="lrmq-page-data"');
    expect(res.body).not.toContain('secret-canary');
    expect(res.body).not.toContain('private@example.test');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][1].method).toBe('GET');
  });

  it('isolates successive renders and escapes markup-like product text', () => {
    const hostile = '</template><script>alert("x")</script>';
    const first = renderProductPage({ status: 'found', rawProduct: { ...fixture, name: hostile } }, fixture.slug);
    const second = renderProductPage({ status: 'not-found' }, 'missing');
    expect(first.markup).not.toContain('<script>alert');
    expect(first.markup).toContain('&lt;/template&gt;');
    expect(second.markup).not.toContain(hostile);
    expect(second.initialPage).toEqual({ slug: 'missing', state: { status: 'not-found' } });
  });

  it('uses the existing recovery button for service failure and rejects mismatched product identity', () => {
    const unavailable = renderProductPage({ status: 'unavailable' }, 'unavailable');
    expect(unavailable.markup).toContain('Reintentar');
    expect(unavailable.markup).not.toContain('Producto no encontrado');
    expect(() => renderProductPage({ status: 'found', rawProduct: fixture }, 'other-slug')).toThrow('PRODUCT_SLUG_MISMATCH');
  });
});
