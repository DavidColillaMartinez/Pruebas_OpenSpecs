import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const width = Number(process.argv[2] || 390);
const theme = process.argv[3] || 'light';
const candidate = process.env.SEO_CANDIDATE_ORIGIN || 'http://127.0.0.1:4182';
const reference = process.env.SEO_REFERENCE_ORIGIN || 'http://127.0.0.1:4181';
const browser = await chromium.launch();
const report = { width, theme, origins: [] };
const paths = ['/productos', '/productos?category=espejos&sort=name_desc', '/productos/mt-espejos-alba', '/presupuesto', '/aviso-legal', '/privacidad', '/cookies'];
const pageGeometry = () => [...document.querySelectorAll('main h1,main h2,main input,main textarea')]
  .filter((element) => element.getBoundingClientRect().width > 1)
  .map((element) => {
    const r = element.getBoundingClientRect();
    return { tag: element.tagName, text: element.matches('h1,h2') ? element.textContent : element.getAttribute('id'), x: r.x, y: r.y, width: r.width, height: r.height };
  });
for (const [name, origin] of [['reference', reference], ['candidate', candidate]]) {
  const context = await browser.newContext({ viewport: { width, height: width < 1024 ? 844 : 900 }, ignoreHTTPSErrors: true });
  await context.addInitScript((theme) => {
    localStorage.setItem('lrmq:theme:v1', theme);
    sessionStorage.setItem('lrmq:assistant:welcome:v1', 'dismissed');
  }, theme);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  if (name === 'reference') await page.route('**/api/catalog/**', async (route) => {
    assert.equal(route.request().method(), 'GET');
    const url = new URL(route.request().url());
    const response = await fetch(`${candidate}${url.pathname}${url.search}`, { headers: { accept: 'application/json' } });
    await route.fulfill({ status: response.status, contentType: 'application/json', body: await response.text() });
  });
  const states = [];
  for (const [index, path] of paths.entries()) {
    await page.goto(`${origin}${path}`);
    await page.locator('h1').waitFor();
    if (path.startsWith('/productos?') || path === '/productos') await page.locator('#catalog-items article').first().waitFor();
    if (path === '/productos/mt-espejos-alba') await page.getByRole('heading', { name: 'Alba', exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
    const geometry = await page.evaluate(pageGeometry);
    assert.equal(await page.locator('h1').count(), 1);
    const screenshot = `/tmp/opencode/seo-route-${name}-${width}-${theme}-${index}.png`;
    await page.screenshot({ path: screenshot });
    states.push({ path, screenshot, geometry });
  }
  await page.goto(`${origin}/productos/mt-espejos-alba`);
  await page.getByRole('button', { name: 'Añadir al presupuesto', exact: true }).click();
  await page.getByText('Añadido al presupuesto.', { exact: true }).waitFor();
  await page.getByRole('link', { name: 'Ver presupuesto', exact: true }).click();
  await page.waitForURL(`${origin}/presupuesto`);
  await page.getByRole('heading', { name: 'Mi presupuesto', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Alba', exact: true }).waitFor();
  await page.waitForTimeout(400);
  const selectedScreenshot = `/tmp/opencode/seo-route-${name}-${width}-${theme}-selected.png`;
  await page.screenshot({ path: selectedScreenshot });
  states.push({ path: '/presupuesto#selected', screenshot: selectedScreenshot, geometry: await page.evaluate(pageGeometry) });
  assert.deepEqual(errors, []);
  report.origins.push({ name, states, errors });
  await context.close();
}
const [before, after] = report.origins;
const differences = [];
for (let index = 0; index < before.states.length; index += 1) {
  for (const [position, element] of before.states[index].geometry.entries()) {
    const current = after.states[index].geometry[position];
    if (!current || current.text !== element.text || ['x', 'y', 'width', 'height'].some((key) => Math.abs(element[key] - current[key]) > 1)) differences.push({ path: before.states[index].path, element, current });
  }
}
report.geometryDifferences = differences;
await browser.close();
const path = `/tmp/opencode/seo-route-review-${width}-${theme}.json`;
await writeFile(path, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ report: path, geometryDifferences: differences }, null, 2));
