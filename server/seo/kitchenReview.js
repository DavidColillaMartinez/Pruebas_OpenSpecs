// Public GET audit + local candidate browser review. Never sends a quote/chat.
// SEO_REFERENCE_ORIGIN points to the isolated build of the starting commit.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = process.env.SEO_CANDIDATE_ORIGIN || 'http://127.0.0.1:4202';
const reference = process.env.SEO_REFERENCE_ORIGIN;
const publicOrigin = 'https://arealrmq.es';
const retired = 'gme-ducha-empotrable-sirio-1-funcion';
const fixture = JSON.parse(await readFile(new URL('../../src/features/catalog/api/fixtures/gme-kitchen-contract.json', import.meta.url), 'utf8'));
const slugs = fixture.products.map(product => product.slug);
const report = { origin, reference, at: new Date().toISOString(), documents: [], browser: [], visual: [] };
const get = async (base, path) => {
  const response = await fetch(`${base}${path}`);
  return { status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() };
};
const tag = (html, key) => html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];
const dataGraph = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));

const inventory = [];
for (let offset = 0; ;) {
  const response = await get(publicOrigin, `/api/catalog/products?limit=60&offset=${offset}&include_facets=false`);
  assert.equal(response.status, 200);
  const page = JSON.parse(response.body);
  assert.equal(page.pagination.offset, offset);
  inventory.push(...page.items);
  if (!page.pagination.has_more) break;
  assert.ok(page.items.length > 0);
  offset += page.items.length;
}
const expected = new Set([`${publicOrigin}/`, `${publicOrigin}/productos`, ...inventory.filter(p => p.publication_status === 'publishable' && p.quality_status === 'approved').map(p => `${publicOrigin}/productos/${p.slug}`)]);
assert.equal(inventory.filter(p => slugs.includes(p.slug)).length, 11);
assert.ok(!inventory.some(p => p.slug === retired));
const sitemap = await get(origin, '/sitemap.xml');
assert.equal(sitemap.status, 200);
assert.match(sitemap.headers['content-type'], /application\/xml/);
const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(urls.length, new Set(urls).size);
assert.deepEqual(new Set(urls), expected);
const robots = await get(origin, '/robots.txt');
assert.equal(robots.status, 200);
assert.match(robots.body, /Sitemap: https:\/\/arealrmq.es\/sitemap.xml/);
report.inventory = { products: inventory.length, sitemapUrls: urls.length, retiredAbsent: true };

const details = new Map();
for (const slug of slugs) {
  const api = await get(publicOrigin, `/api/catalog/products/${slug}`);
  assert.equal(api.status, 200);
  const detail = JSON.parse(api.body);
  details.set(slug, detail);
  const page = await get(origin, `/productos/${slug}`);
  assert.equal(page.status, 200);
  assert.match(page.body, new RegExp(`<link rel="canonical" href="${publicOrigin}/productos/${slug}"`));
  assert.equal(tag(page.body, 'robots'), 'index, follow');
  assert.match(page.body, /id="lrmq-page-data"/);
  const graphs = dataGraph(page.body);
  assert.equal(graphs.length, 1);
  const product = graphs[0]['@graph'].find(node => node['@type'] === 'Product');
  const breadcrumbs = graphs[0]['@graph'].find(node => node['@type'] === 'BreadcrumbList');
  assert.equal(product.name, detail.name);
  assert.equal(product.image, detail.main_image_url);
  assert.equal(product.description, detail.description);
  assert.equal(breadcrumbs.itemListElement[2].item, `${publicOrigin}/productos/${slug}`);
  for (const key of ['offers', 'aggregateRating', 'availability', 'sku']) assert.ok(!(key in product));
  assert.equal(tag(page.body, 'og:image'), detail.main_image_url);
  assert.equal(tag(page.body, 'twitter:image'), detail.main_image_url);
  assert.equal((await fetch(detail.main_image_url, { method: 'HEAD' })).status, 200);
  report.documents.push({ slug, status: page.status, title: page.body.match(/<title>(.*?)<\/title>/)?.[1], description: tag(page.body, 'description'), productAndBreadcrumbs: true });
}
assert.equal(new Set(report.documents.map(p => p.title)).size, 11);
assert.equal(new Set(report.documents.map(p => p.description)).size, 11);
for (const [slug, status] of [[retired, 404], ['gme-ducha-empotrable-sirio', 200]]) {
  const page = await get(origin, `/productos/${slug}`);
  assert.equal(page.status, status);
  if (status === 404) {
    assert.equal(tag(page.body, 'robots'), 'noindex, follow');
    assert.ok(!page.body.includes('rel="canonical"'));
    assert.equal(dataGraph(page.body).length, 0);
  }
  report.documents.push({ slug, status });
}
if (process.env.SEO_FAILURE_ORIGIN) {
  const failedSitemap = await get(process.env.SEO_FAILURE_ORIGIN, '/sitemap.xml');
  assert.equal(failedSitemap.status, 503);
  assert.equal(failedSitemap.headers['retry-after'], '300');
  assert.equal(failedSitemap.headers['cache-control'], 'no-store');
  assert.ok(!failedSitemap.body.includes('<urlset'), 'Never publish a partial sitemap');
  for (const slug of [slugs[0], retired]) {
    const page = await get(process.env.SEO_FAILURE_ORIGIN, `/productos/${slug}`);
    assert.equal(page.status, 503, 'A service outage is not proof of retirement');
    assert.equal(page.headers['retry-after'], '300');
    assert.equal(page.headers['cache-control'], 'no-store');
    assert.ok(!page.body.includes('rel="canonical"'));
    assert.equal(dataGraph(page.body).length, 0);
  }
  report.failureContract = '503, Retry-After 300, no-store, no Product/canonical';
}
const alias = await fetch(`${origin}/productos/${slugs[0]}/`, { redirect: 'manual' });
assert.equal(alias.status, 308);

const browser = await chromium.launch();
const xmlPage = await browser.newPage();
assert.equal(await xmlPage.evaluate(xml => new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('parsererror').length, sitemap.body), 0);
await xmlPage.close();

for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
  const geometries = [];
  for (const [name, base] of [['reference', reference], ['candidate', origin]]) {
    if (!base) continue;
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
    await context.addInitScript(theme => { localStorage.setItem('lrmq:theme:v1', theme); sessionStorage.setItem('lrmq:assistant:welcome:v1', 'dismissed'); }, theme);
    const page = await context.newPage();
    const errors = [], reads = [], posts = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /hydration|Minified React error/i.test(message.text())) errors.push(message.text()); });
    await context.route('**/api/**', route => {
      if (route.request().method() !== 'GET') { posts.push(route.request().url()); return route.abort(); }
      if (/\/api\/catalog\/products\//.test(route.request().url())) reads.push(route.request().url());
      return route.continue();
    });
    const visual = [];
    for (const slug of ['gme-cocina-noah', 'gme-cocina-osmosis-extraible']) {
      await page.goto(`${base}/productos/${slug}`);
      await page.getByRole('heading', { name: details.get(slug).name, exact: true }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.locator('#product-content img').evaluateAll(images => Promise.all(images.filter(i => i.src.includes('/catalogo/') && i.loading !== 'lazy').map(i => i.decode().catch(() => {}))));
      await page.screenshot({ path: `/tmp/opencode/kitchen-${name}-${width}-${theme}-${slug}.png`, fullPage: true, animations: 'disabled' });
      visual.push(await page.locator('#product-content h1, #product-content h2, #product-content img').evaluateAll(elements => elements.map(e => { const box = e.getBoundingClientRect(); return { tag: e.tagName, text: e.tagName === 'IMG' ? e.getAttribute('src') : e.textContent, x: box.x, y: box.y, width: box.width, height: box.height }; })));
      if (name === 'candidate') {
        assert.equal(await page.locator('script[type="application/ld+json"]').count(), 1);
        assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), details.get(slug).main_image_url);
        if (slug === 'gme-cocina-noah') {
          await page.reload();
          await page.getByRole('heading', { name: details.get(slug).name, exact: true }).waitFor();
          assert.equal(await page.locator('script[type="application/ld+json"]').count(), 1);
        }
      }
    }
    assert.deepEqual(reads, [], 'Direct hydration reuses the initial detail without a browser API read');
    geometries.push({ name, visual });

    if (name === 'candidate' && theme === 'light') {
      // Every real published reference remains selectable and can be kept in
      // the private quote selection. All POSTs are blocked above.
      for (const slug of slugs) {
        const detail = details.get(slug);
        await page.goto(`${base}/productos/${slug}`);
        await page.getByRole('heading', { name: detail.name, exact: true }).waitFor();
        for (const variant of detail.variants) {
          if (detail.variants.length > 1) await page.getByRole('button', { name: variant.finish, exact: true }).click();
          await page.getByRole('button', { name: 'Añadir al presupuesto', exact: true }).click();
          await page.waitForFunction(id => JSON.parse(localStorage.getItem('lrmq:quote-selection:v3') || '{}').lines?.some(line => line.variantId === id), variant.id);
          const saved = await page.evaluate(id => JSON.parse(localStorage.getItem('lrmq:quote-selection:v3')).lines.find(line => line.variantId === id), variant.id);
          assert.equal(saved.reference, variant.reference);
          assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), detail.main_image_url, 'Social cover does not track selected finish');
        }
      }
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('lrmq:quote-selection:v3')).lines.length), 23);
      assert.deepEqual(reads, []);
      await page.getByRole('link', { name: 'Ver presupuesto', exact: true }).click();
      await page.locator('#quote-selection-content').waitFor();
      assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow');
      assert.ok((await page.locator('meta[property="og:image"]').getAttribute('content')).endsWith('/logopng.png'));
      const filters = '?category=griferia&supplier=gme&catalog_section=griferia&tap_scope=cocina';
      await page.goto(`${base}/productos${filters}`);
      await page.locator('a[href="/productos/gme-cocina-noah"]').first().click();
      await page.getByRole('heading', { name: details.get('gme-cocina-noah').name, exact: true }).waitFor();
      assert.equal(reads.length, 1, 'Client navigation makes one ordinary detail GET');
      await page.goBack();
      await page.locator('#catalog-items').waitFor();
      assert.ok((await page.title()).includes('baño y grifería de cocina'));
      assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0);
      report.browser.push({ width, theme, variantsSelected: 23, directHydrationReads: 0, clientNavigationReads: reads.length, quoteSelectionOnly: true });
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(posts, []);
    await context.close();
  }
  if (geometries.length === 2) {
    const [before, after] = geometries.map(g => g.visual.flat());
    assert.equal(before.length, after.length);
    for (let i = 0; i < before.length; i++) {
      assert.equal(before[i].text, after[i].text);
      assert.ok(Math.abs(before[i].x - after[i].x) <= 1);
      assert.ok(Math.abs(before[i].y - after[i].y) <= 1);
      assert.ok(Math.abs(before[i].width - after[i].width) <= 1);
      assert.ok(Math.abs(before[i].height - after[i].height) <= 1);
    }
    report.visual.push({ width, theme, geometryWithinOnePixel: true });
  }
}
await browser.close();
await writeFile('/tmp/opencode/kitchen-seo-review.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
