import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const origin = process.env.SEO_CANDIDATE_ORIGIN || 'http://127.0.0.1:4182';
const report = { origin, documents: [], redirects: [], browser: [] };
const cases = [
  ['/', 200, '/', false],
  ['/productos', 200, '/productos', false],
  ['/productos?page=2', 200, '/productos?page=2', false],
  ['/productos?search=Alba&sort=name_asc&utm_source=tracking-canary', 200, '/productos?search=Alba&sort=name_asc', true],
  ['/productos?page=8', 404, null, true],
  ['/productos/mt-espejos-alba', 200, '/productos/mt-espejos-alba', false],
  ['/productos/zz-inexistente-seo-review', 404, null, true],
  ['/presupuesto', 200, '/presupuesto', true],
  ['/aviso-legal', 200, '/aviso-legal', true],
  ['/privacidad', 200, '/privacidad', true],
  ['/cookies', 200, '/cookies', true],
];
for (const [path, status, canonical, noindex] of cases) {
  const response = await fetch(`${origin}${path}`);
  const html = await response.text();
  assert.equal(response.status, status, path);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const href = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&') || null;
  assert.equal(href, canonical === null ? null : `https://arealrmq.es${canonical}`, path);
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1];
  assert.equal(robots, noindex ? 'noindex, follow' : 'index, follow', path);
  assert.ok(!html.includes('<!--$!-->'), path);
  assert.ok(!html.includes('tracking-canary'), path);
  if (status === 200) assert.match(html, /<h1[ >]/, path);
  if (path === '/') {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const business = JSON.parse(json);
    assert.equal(business.legalName, 'ÁREA LRMQ DESING S.L');
    assert.equal(business.address.streetAddress, 'C/ Aquitania, 69, local 1');
    assert.equal(business.priceRange, undefined);
  }
  if (path === '/presupuesto') {
    assert.ok(html.includes('Aún no hay selecciones'));
    assert.ok(!html.includes('Alba'));
    assert.ok(!html.includes('joint-name'));
  }
  report.documents.push({ path, status, canonical: href, robots, bytes: Buffer.byteLength(html) });
}
for (const path of ['/productos/', '/presupuesto/', '/aviso-legal/', '/privacidad/', '/cookies/', '/productos/mt-espejos-alba/']) {
  const response = await fetch(`${origin}${path}?utm_source=review`, { redirect: 'manual' });
  assert.equal(response.status, 308);
  const location = response.headers.get('location');
  assert.equal(location, `${path.slice(0, -1)}?utm_source=review`);
  assert.equal((await fetch(new URL(location, origin), { redirect: 'manual' })).status, 200);
  report.redirects.push({ path, status: 308, location, hops: 1 });
}
for (const [path, type] of [['/api/unknown-review', /application\/json/], ['/assets/missing-review.js', /text\/plain/], ['/unknown-review', /text\/html/]]) {
  const response = await fetch(`${origin}${path}`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), type);
}
for (const [path, destination] of [['/index.html', '/'], ['/presupuesto.html', '/presupuesto'], ['/aviso-legal.html', '/aviso-legal'], ['/privacidad.html', '/privacidad'], ['/cookies.html', '/cookies']]) {
  const response = await fetch(`${origin}${path}`, { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), destination);
  report.redirects.push({ path, location: destination, status: 308, hops: 1 });
}
const robots = await (await fetch(`${origin}/robots.txt`)).text();
assert.ok(robots.includes('Allow: /api/catalog/products'));
assert.ok(robots.includes('Allow: /api/catalog/config'));
assert.ok(robots.includes('Disallow: /api/'));
assert.ok(!robots.includes('Disallow: /presupuesto'));
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
assert.match(sitemapResponse.headers.get('content-type'), /application\/xml/);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(locations).size, locations.length);
assert.ok(locations.includes('https://arealrmq.es/productos'));
assert.ok(!locations.some((url) => url.endsWith('/productos/') || /presupuesto|privacidad|cookies/.test(url)));
report.sitemapUrls = locations.length;

const browser = await chromium.launch();
for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
  const context = await browser.newContext({ viewport, javaScriptEnabled: false, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  for (const path of ['/', '/productos', '/presupuesto', '/aviso-legal', '/privacidad', '/cookies']) {
    await page.goto(`${origin}${path}`);
    assert.equal(await page.locator('h1').count(), 1, path);
    if (path === '/') {
      const src = await page.locator('#inicio picture img').evaluate((image) => image.currentSrc);
      assert.ok(src.includes(viewport.width < 1024 ? 'movil' : 'desktop'), src);
    }
    report.browser.push({ viewport, path, javascript: false, heading: await page.locator('h1').innerText() });
  }
  await context.close();
}
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, ignoreHTTPSErrors: true });
await context.addInitScript(() => {
  const observer = new MutationObserver(() => {
    const main = document.querySelector('main');
    if (main) { window.__initialMain = main; observer.disconnect(); }
  });
  observer.observe(document, { childList: true, subtree: true });
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto(origin);
await page.waitForTimeout(900);
assert.equal(await page.evaluate(() => window.__initialMain === document.querySelector('main')), true);
await page.locator('#contact-name').fill('Borrador conservado');
await page.waitForTimeout(300);
for (const viewport of [{ width: 1366, height: 768 }, { width: 1023, height: 768 }, { width: 1024, height: 768 }, { width: 1366, height: 559 }, { width: 1366, height: 560 }, { width: 390, height: 844 }]) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(650);
  assert.equal(await page.locator('#contact-name').inputValue(), 'Borrador conservado');
  assert.equal(await page.evaluate(() => window.__initialMain === document.querySelector('main')), true);
  assert.equal(await page.locator('#inicio').count(), 1);
  report.browser.push({ resize: viewport, singleMountAndDraftPreserved: true });
}
await page.locator('#vision').scrollIntoViewIfNeeded();
const play = page.getByRole('button', { name: 'Reproducir boceto', exact: true });
if (await play.isVisible()) await play.click();
await page.locator('video[aria-label="Video de boceto dibujándose"]').evaluate((video) => video.dispatchEvent(new Event('ended')));
const slider = page.getByRole('slider', { name: 'Comparar boceto con imagen final' });
await slider.waitFor();
const box = await slider.boundingBox();
const cdp = await context.newCDPSession(page);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width * .5, y: box.y + box.height * .5 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * .8, y: box.y + box.height * .5 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
assert.ok(Number(await slider.getAttribute('aria-valuenow')) > 70);
assert.deepEqual(errors, []);
report.browser.push({ touchCompare: true, hydrationErrors: errors });
const renovation = page.locator('video[aria-label="Video stopmotion de reforma de baño completo"]');
assert.equal(await renovation.evaluate((video) => video.controls), true);
await renovation.evaluate((video) => video.play());
await page.waitForFunction(() => document.querySelector('video[aria-label="Video stopmotion de reforma de baño completo"]').currentTime > .1);
await renovation.evaluate((video) => video.pause());
report.browser.push({ nativeVideoControlsAndPlayback: true });

const desktop = await browser.newContext({ viewport: { width: 1366, height: 768 }, ignoreHTTPSErrors: true });
const desktopPage = await desktop.newPage();
await desktopPage.goto(origin);
await desktopPage.waitForTimeout(6200);
await desktopPage.keyboard.press('PageDown');
await desktopPage.getByRole('button', { name: 'Ir a Quiénes somos', exact: true }).and(desktopPage.locator('[aria-current="step"]')).waitFor();
await desktopPage.getByRole('button', { name: 'Ir a Reformas', exact: true }).click();
await desktopPage.waitForTimeout(700);
const desktopVideo = desktopPage.locator('video[aria-label="Video stopmotion de reforma de baño completo"]');
assert.equal(await desktopVideo.evaluate((video) => video.controls), false);
const videoBox = await desktopVideo.boundingBox();
await desktopPage.mouse.move(videoBox.x + videoBox.width * .4, videoBox.y + videoBox.height * .4);
await desktopPage.mouse.wheel(0, 1000);
await desktopPage.waitForFunction(() => document.querySelector('video[aria-label="Video stopmotion de reforma de baño completo"]').currentTime > 1);
report.browser.push({ narrativeKeyboardAndWheelScrubbing: true, videoTime: await desktopVideo.evaluate((video) => video.currentTime) });
await desktop.close();

const expired = await browser.newContext({ ignoreHTTPSErrors: true });
await expired.addInitScript(() => localStorage.setItem('lrmq:quote-selection:v3', JSON.stringify({
  version: 3, remember: false, updatedAt: Date.now() - 8 * 86400000, expiresAt: Date.now() - 1,
  lines: [{ productId: 'local-test', variantId: 'local-variant', productName: 'Expired local fixture', supplier: 'test', category: 'test', quantity: 1 }],
})));
const expiredPage = await expired.newPage();
await expiredPage.goto(`${origin}/presupuesto`);
await expiredPage.waitForFunction(() => localStorage.getItem('lrmq:quote-selection:v3') === null);
await expiredPage.getByRole('heading', { name: 'Aún no hay selecciones', exact: true }).waitFor();
report.browser.push({ expiredSelectionRemovedLocally: true });
await expired.close();

if (process.env.SEO_FAILURE_ORIGIN) {
  const failure = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
  const failurePage = await failure.newPage();
  const failureErrors = [];
  failurePage.on('pageerror', (error) => failureErrors.push(error.message));
  await failurePage.route('**/api/catalog/products**', async (route) => {
    const requested = new URL(route.request().url());
    const response = await fetch(`https://arealrmq.es${requested.pathname}${requested.search}`, { headers: { accept: 'application/json' } });
    await route.fulfill({ status: response.status, contentType: 'application/json', body: await response.text() });
  });
  for (const path of ['/productos', '/productos/mt-espejos-alba']) {
    const response = await failurePage.goto(`${process.env.SEO_FAILURE_ORIGIN}${path}`);
    assert.equal(response.status(), 503);
    await failurePage.getByRole('button', { name: 'Reintentar', exact: true }).click();
    if (path === '/productos') await failurePage.locator('#catalog-items article').first().waitFor();
    else await failurePage.getByRole('heading', { name: 'Alba', exact: true }).waitFor();
    report.browser.push({ path, initialStatus: 503, retryRecoveredPublicContent: true });
  }
  assert.deepEqual(failureErrors, []);
  await failure.close();
}
await browser.close();
await writeFile(process.env.SEO_DOCUMENT_REPORT_PATH || '/tmp/opencode/seo-document-review.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
