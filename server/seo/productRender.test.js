// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { renderProductPage } from '../../src/entry-product-server.jsx';
import { handleProductPageRequest } from './productPage.js';
import { renderProductDocument } from './productPage.js';
import { applyHead } from './head.js';
import kitchen from '../../src/features/catalog/api/fixtures/gme-kitchen-contract.json';

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
  it.each(kitchen.products)('emits unique initial metadata, Product and BreadcrumbList for $slug', (rawProduct) => {
    const result = { status: 'found', rawProduct };
    const rendered = renderProductPage(result, rawProduct.slug);
    const html = renderProductDocument(template, result, rawProduct.slug, rendered);
    expect(rendered.meta.title).toContain('Grifo de cocina');
    expect(rendered.meta.title).toContain('IO by GME');
    expect(rendered.meta.description.length).toBeLessThanOrEqual(160);
    expect(rendered.meta.imageUrl).toBe(rawProduct.main_image_url);
    expect(html).toContain(`<meta property="og:image" content="${rawProduct.main_image_url}" />`);
    expect(html).toContain(`<meta name="twitter:image" content="${rawProduct.main_image_url}" />`);
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toContain(`href="https://arealrmq.es/productos/${rawProduct.slug}"`);
    expect(html).toContain('content="index, follow"');
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toContain(rawProduct.description);
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    expect(scripts).toHaveLength(1);
    const graph = JSON.parse(scripts[0][1]);
    const [product, breadcrumbs] = graph['@graph'];
    expect(product).toMatchObject({ '@type': 'Product', name: rawProduct.name, image: rawProduct.main_image_url, brand: { name: rawProduct.brand } });
    expect(product).not.toHaveProperty('offers');
    expect(product).not.toHaveProperty('aggregateRating');
    expect(product).not.toHaveProperty('availability');
    expect(product).not.toHaveProperty('sku');
    expect(breadcrumbs).toMatchObject({ '@type': 'BreadcrumbList', itemListElement: [
      { position: 1, item: 'https://arealrmq.es/' },
      { position: 2, item: 'https://arealrmq.es/productos' },
      { position: 3, item: `https://arealrmq.es/productos/${rawProduct.slug}` },
    ] });
  });

  it('escapes kitchen JSON-LD and keeps other families and error states free of kitchen data', () => {
    const rawProduct = { ...kitchen.products[0], description: '</script><script>alert("canary")</script>', private_token: 'private-canary' };
    const rendered = renderProductPage({ status: 'found', rawProduct }, rawProduct.slug);
    expect(rendered.markup).not.toContain('</script><script>');
    expect(rendered.markup).toContain('\\u003c/script>');
    expect(rendered.markup).not.toContain('private-canary');
    const generic = renderProductPage({ status: 'found', rawProduct: fixture }, fixture.slug);
    expect(generic.markup).not.toContain('application/ld+json');
    expect(generic.meta).not.toHaveProperty('imageUrl');
    for (const status of ['not-found', 'unavailable']) {
      const failure = renderProductPage({ status }, 'gme-ducha-empotrable-sirio-1-funcion');
      expect(failure.markup).not.toContain('application/ld+json');
      expect(failure.meta.canonicalPath).toBeNull();
    }
  });

  it('adds optional social image tags to older shells and escapes their values', () => {
    const meta = renderProductPage({ status: 'found', rawProduct: kitchen.products[0] }, kitchen.products[0].slug).meta;
    const oldTemplate = template.replace(/<meta (?:property="og:image(?::alt)?"|name="twitter:image(?::alt)?") [^>]*>/g, '');
    const html = applyHead(oldTemplate, { ...meta, imageAlt: 'Portada "<segura>"' });
    expect(html).toContain('content="Portada &quot;&lt;segura&gt;&quot;"');
    expect(html.match(/property="og:image"/g)).toHaveLength(1);
    expect(html.match(/name="twitter:image"/g)).toHaveLength(1);
    expect(() => applyHead(template.replace('</head>', '<meta property="og:image" content="duplicate" /></head>'), meta)).toThrow('SEO_TEMPLATE_TAG_DUPLICATED');
  });
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
