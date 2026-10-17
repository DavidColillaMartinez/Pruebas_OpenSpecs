import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const width = Number(process.argv[2] || 390);
const origin = process.env.SEO_CANDIDATE_ORIGIN || 'http://127.0.0.1:4182';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height: width < 1024 ? 844 : 900 }, hasTouch: width < 1024, ignoreHTTPSErrors: true });
await context.addInitScript(() => {
  window.__externalDestinations = [];
  window.open = (url) => { window.__externalDestinations.push(String(url)); return null; };
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest?.('a');
    if (anchor && (anchor.href.startsWith('tel:') || /^https?:/.test(anchor.href) && new URL(anchor.href).origin !== location.origin)) {
      event.preventDefault();
      window.__externalDestinations.push(anchor.href);
    }
  }, true);
});
const page = await context.newPage();
const scrollDiagnostics = {};
process.on('uncaughtException', async (error) => {
  console.error(error);
  console.error('Review URL:', page.url());
  console.error('Scroll diagnostics:', scrollDiagnostics, await page.evaluate(() => ({ top: document.querySelector('main')?.scrollTop, windowY: window.scrollY, height: document.querySelector('main')?.scrollHeight, saved: sessionStorage.getItem('catalog:return-state') })).catch(() => null));
  console.error('Review state:', await page.locator('[role="dialog"]').allTextContents().catch(() => []));
  await page.screenshot({ path: `/tmp/opencode/seo-flow-failure-${width}.png` }).catch(() => undefined);
  await browser.close();
  process.exitCode = 1;
});
const errors = [];
const requests = [];
const chatPayloads = [];
const quotePayloads = [];
const results = [];
const expectRobots = (value) => page.waitForFunction((expected) => document.querySelector('meta[name="robots"]')?.content === expected, value);
let quoteFails = true;
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
await page.route('**/api/**', async (route) => {
  const request = route.request();
  if (request.method() !== 'POST') return route.continue();
  const body = request.postDataJSON();
  if (request.url().endsWith('/api/chat/messages')) {
    chatPayloads.push(body);
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({
      version: 1, conversationId: 'controlled-browser-review', requestId: body.requestId,
      message: 'Respuesta controlada para revisar el catálogo y la preparación de WhatsApp.',
      products: [{ productId: 'mt-espejos-alba', slug: 'mt-espejos-alba', name: 'Alba', internalPath: '/productos/mt-espejos-alba', facts: ['Espejo'], recommendationReason: 'Recomendación controlada.' }],
      actions: [{ type: 'contact_official', label: 'Preparar WhatsApp de prueba', target: 'whatsapp', draftText: 'Consulta controlada sobre mi reforma.' }],
    }) });
  }
  if (request.url().endsWith('/api/catalog/quote-requests')) {
    quotePayloads.push(body);
    return route.fulfill({ status: quoteFails ? 502 : 200, contentType: 'application/json', body: JSON.stringify(quoteFails ? { error: 'CONTROLLED_ERROR' } : { id: 'controlled-browser-quote', status: 'received', item_count: body.items.length }) });
  }
  throw new Error(`Uncontrolled POST: ${request.url()}`);
});

await page.goto(origin);
await page.getByRole('button', { name: 'Abrir el asistente de Area LRMQ', exact: true }).waitFor();
await page.getByRole('button', { name: 'Cerrar la sugerencia del asistente', exact: true }).click();
assert.equal(requests.filter((request) => request.method === 'POST').length, 0);
assert.equal(await page.locator('h1').count(), 1);
if (width < 1024) {
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Menú de navegación' });
  const advice = drawer.getByRole('link', { name: 'Pedir asesoría', exact: true });
  assert.match(await advice.getAttribute('href'), /^https:\/\/wa.me\//);
  await advice.click();
  assert.equal(await drawer.count(), 0);
  assert.equal((await page.evaluate(() => window.__externalDestinations)).length, 1);
  results.push('mobile advice destination and drawer close');
}
const themeButton = page.getByRole('button', { name: 'Cambiar a tema oscuro', exact: true }).filter({ visible: true });
await themeButton.click();
assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
await page.getByRole('button', { name: 'Cambiar a tema claro', exact: true }).filter({ visible: true }).click();

await page.getByRole('button', { name: 'Abrir el asistente de Area LRMQ', exact: true }).click();
const chat = page.getByRole('dialog', { name: 'Asistente de Area LRMQ' });
await chat.getByRole('button', { name: 'Ocultar información', exact: true }).click();
await chat.getByRole('button', { name: 'Información de privacidad', exact: true }).click();
assert.equal(await chat.locator('#assistant-privacy-details').count(), 1);
await chat.getByRole('button', { name: 'Ocultar información', exact: true }).click();
await chat.getByRole('textbox', { name: 'Escribe tu mensaje para el asistente' }).fill('Quiero revisar una reforma de baño.');
await chat.getByRole('button', { name: 'Enviar mensaje al asistente', exact: true }).click();
await chat.getByText('Respuesta controlada para revisar el catálogo y la preparación de WhatsApp.').waitFor();
assert.equal(chatPayloads.length, 1);
assert.equal(chatPayloads[0].context.pagePath, '/');
assert.equal(await chat.locator('a[href="/productos/mt-espejos-alba"]').count(), 1);
await chat.getByRole('button', { name: /^WhatsApp / }).click();
await chat.getByRole('textbox', { name: '¿Cómo te llamas?' }).fill('Canario privado');
await chat.getByRole('button', { name: 'Cancelar', exact: true }).click();
assert.equal(chatPayloads.length, 1);
await chat.getByRole('button', { name: 'Nueva conversación', exact: true }).click();
assert.equal(await chat.getByText('Quiero revisar una reforma de baño.').count(), 0);
await chat.getByRole('button', { name: 'Cerrar el asistente', exact: true }).click();
results.push('assistant welcome/open/close/privacy, one controlled send, context, recommendation, cancel WhatsApp and restart');

const catalogRequestStart = requests.length;
await page.goto(`${origin}/productos`);
await page.locator('#catalog-items article').first().waitFor();
await page.waitForTimeout(600);
const initialCount = await page.locator('#catalog-items article').count();
const getsBefore = requests.slice(catalogRequestStart).filter((request) => request.url.includes('/api/catalog/products')).length;
assert.equal(getsBefore, 0, 'SSR catalogue must not immediately refetch');
await page.getByRole('button', { name: /^Cargar más/ }).click();
await page.waitForURL(/page=2/);
await page.waitForFunction((count) => document.querySelectorAll('#catalog-items article').length > count, initialCount);
assert.match(await page.locator('link[rel="canonical"]').getAttribute('href'), /page=2/);
await expectRobots('index, follow');
await page.getByRole('searchbox', { name: 'Buscar en el catálogo' }).fill('Alba');
await page.waitForURL(/search=Alba/);
await page.locator('#catalog-items h2').filter({ hasText: /^Alba$/ }).waitFor();
await expectRobots('noindex, follow');
await page.waitForFunction(() => document.querySelectorAll('#catalog-items article').length === 1 && document.querySelector('#catalog-results')?.getAttribute('aria-busy') === 'false');
await page.locator('#catalog-items a').first().scrollIntoViewIfNeeded();
const returnScroll = await page.evaluate(() => document.querySelector('main').scrollTop || window.scrollY);
scrollDiagnostics.beforeClick = returnScroll;
await page.locator('#catalog-items a').first().click();
await page.waitForURL(/productos\/mt-espejos-alba/);
await page.getByRole('heading', { name: 'Alba', exact: true }).waitFor();
scrollDiagnostics.savedOnClick = await page.evaluate(() => JSON.parse(sessionStorage.getItem('catalog:return-state')));
assert.equal(scrollDiagnostics.savedOnClick.search, '?search=Alba');
assert.ok(Number.isFinite(scrollDiagnostics.savedOnClick.scrollY));
await page.getByRole('link', { name: 'Volver a resultados', exact: true }).click();
await page.waitForURL(/search=Alba/);
assert.equal(await page.getByRole('searchbox', { name: 'Buscar en el catálogo' }).inputValue(), 'Alba');
await page.waitForFunction((expected) => Math.abs((document.querySelector('main').scrollTop || window.scrollY) - expected) < 3, scrollDiagnostics.savedOnClick.scrollY);
scrollDiagnostics.afterReturn = await page.evaluate(() => document.querySelector('main').scrollTop || window.scrollY);
await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
await page.waitForURL(`${origin}/productos`);
await page.locator('#catalog-items article').first().waitFor();
const filterScope = width < 1024 ? page.getByRole('dialog', { name: 'Filtrar', exact: true }) : page.getByRole('complementary', { name: 'Filtros del catálogo' });
if (width < 1024) await page.getByRole('button', { name: 'Filtros', exact: true }).click();
await filterScope.getByRole('button', { name: 'Categoría', exact: true }).click();
await filterScope.getByRole('checkbox', { name: /^Espejos/ }).click();
await page.waitForURL(/category=espejos/);
if (width < 1024) await filterScope.getByRole('button', { name: 'Cerrar', exact: true }).click();
await page.getByRole('combobox', { name: 'Ordenar por', exact: true }).selectOption('name_desc');
await page.waitForURL(/sort=name_desc/);
await expectRobots('noindex, follow');
await page.goBack();
await page.waitForURL((url) => !url.searchParams.has('sort'));
await page.goForward();
await page.waitForURL(/sort=name_desc/);
results.push('SSR catalogue reuse, incremental load, search/filter/order, detail and return state, back/forward metadata');

const families = ['mt-espejos-alba', 'royo-nonmodular-alfa-compact', 'royo-modular-alfa', 'gme-mamparas-ducha-akord', 'gme-cassio', 'duplach-stone-plus', 'duplach-stone-3d'];
for (const slug of families) {
  const response = await page.goto(`${origin}/productos/${slug}`);
  assert.equal(response.status(), 200, slug);
  await page.locator('#product-content h1').waitFor();
  await page.waitForTimeout(450);
  for (let pass = 0; pass < 2; pass += 1) {
    const groups = page.locator('#product-content fieldset');
    for (let index = 0; index < await groups.count(); index += 1) {
      const option = groups.nth(index).locator('button[aria-pressed="false"]:enabled').first();
      if (await option.count()) await option.click();
    }
  }
  const nextImage = page.getByRole('button', { name: 'Imagen siguiente', exact: true }).first();
  if (await nextImage.count() && await nextImage.isEnabled()) await nextImage.click();
  const details = page.getByRole('button', { name: 'Detalles públicos', exact: true });
  if (await details.count()) { await details.click(); assert.equal(await details.getAttribute('aria-expanded'), 'true'); }
  assert.equal(await page.locator('h1').count(), 1);
  results.push(`public family gallery and selectors: ${slug}`);
}

await page.goto(`${origin}/productos/mt-espejos-alba`);
await page.getByRole('button', { name: 'Añadir al presupuesto', exact: true }).click();
await page.getByText('Añadido al presupuesto.', { exact: true }).waitFor();
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('lrmq:quote-selection:v3')));
assert.equal(stored.lines.length, 1);
for (const visitor of ['visitante-a-canario', 'visitante-b-canario']) {
  const isolated = await browser.newContext({ viewport: { width, height: 844 }, ignoreHTTPSErrors: true });
  await isolated.addInitScript(({ stored, visitor }) => {
    const snapshot = structuredClone(stored);
    snapshot.lines[0].productName = visitor;
    localStorage.setItem('lrmq:quote-selection:v3', JSON.stringify(snapshot));
  }, { stored, visitor });
  const privatePage = await isolated.newPage();
  const response = await privatePage.goto(`${origin}/presupuesto`);
  const initial = await response.text();
  assert.ok(initial.includes('Aún no hay selecciones'));
  assert.ok(!initial.includes(visitor));
  await privatePage.getByRole('heading', { name: visitor, exact: true }).waitFor();
  const snapshot = await privatePage.evaluate(() => JSON.parse(localStorage.getItem('lrmq:quote-selection:v3')));
  assert.equal(snapshot.updatedAt, stored.updatedAt);
  await isolated.close();
}
results.push('two isolated visitors: identical empty initial quote, private selection restored only locally, unchanged inactivity date');

await page.goto(`${origin}/presupuesto`);
await page.getByRole('heading', { name: 'Alba', exact: true }).waitFor();
const quantity = page.locator('input[type="number"]').first();
await quantity.fill('2');
await quantity.press('Tab');
await page.reload();
assert.equal(await page.locator('input[type="number"]').first().inputValue(), '2');
const secondTab = await context.newPage();
await secondTab.goto(`${origin}/presupuesto`);
await secondTab.getByRole('heading', { name: 'Alba', exact: true }).waitFor();
await quantity.fill('3');
await quantity.press('Tab');
await secondTab.waitForFunction(() => document.querySelector('input[type="number"]')?.value === '3');
await secondTab.close();
await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Nombre de prueba local');
await page.getByRole('textbox', { name: 'Email', exact: true }).fill('controlado@example.test');
const privacy = page.getByRole('link', { name: /Política de privacidad/ }).first();
const popupPromise = context.waitForEvent('page');
await privacy.click();
const popup = await popupPromise;
await popup.waitForLoadState('domcontentloaded');
assert.match(await popup.title(), /Política de privacidad/);
await popup.close();
assert.equal(await page.getByRole('textbox', { name: 'Nombre', exact: true }).inputValue(), 'Nombre de prueba local');
await page.getByRole('checkbox', { name: /He leído/ }).check();
await page.getByRole('button', { name: 'Enviar 1 selección', exact: true }).click();
await page.getByRole('alert').first().waitFor();
assert.equal(quotePayloads.length, 1);
assert.equal(await page.getByRole('textbox', { name: 'Nombre', exact: true }).inputValue(), 'Nombre de prueba local');
quoteFails = false;
await page.getByRole('button', { name: 'Enviar 1 selección', exact: true }).click();
await page.getByText(/Solicitud registrada con el identificador controlled-browser-quote/).waitFor();
assert.equal(quotePayloads.length, 2);
assert.deepEqual(quotePayloads[0], quotePayloads[1]);
assert.equal(quotePayloads[1].items[0].quantity, 3);
assert.equal(await page.evaluate(() => localStorage.getItem('lrmq:quote-selection:v3')), null);
results.push('quote quantity/persistence/tab synchronization, privacy without lost draft, controlled error/success: one POST per attempt, same payload and retire sent selection');

await page.goto(`${origin}/productos/mt-espejos-alba`);
await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Formulario de ficha controlado');
await page.getByRole('textbox', { name: 'Email', exact: true }).fill('ficha@example.test');
await page.getByRole('button', { name: 'Solicitar presupuesto', exact: true }).click();
await page.locator('#quote-consent-error').waitFor();
assert.equal(quotePayloads.length, 2);
await page.getByRole('checkbox', { name: /He leído/ }).check();
quoteFails = true;
await Promise.all([
  page.waitForResponse((response) => response.url().endsWith('/api/catalog/quote-requests') && response.request().method() === 'POST'),
  page.getByRole('button', { name: 'Solicitar presupuesto', exact: true }).click(),
]);
assert.equal(quotePayloads.length, 3);
assert.equal(await page.getByRole('textbox', { name: 'Nombre', exact: true }).inputValue(), 'Formulario de ficha controlado');
quoteFails = false;
await page.getByRole('button', { name: 'Solicitar presupuesto', exact: true }).click();
await page.getByText(/Solicitud registrada con el identificador controlled-browser-quote/).waitFor();
assert.equal(quotePayloads.length, 4);
assert.deepEqual(quotePayloads[2], quotePayloads[3]);
assert.equal(await page.getByRole('textbox', { name: 'Nombre', exact: true }).inputValue(), '');
results.push('product form: consent validation without POST, controlled error/success, draft preserved on error and cleared only on confirmation');

await page.getByRole('button', { name: 'Añadir al presupuesto', exact: true }).click();
await page.goto(`${origin}/presupuesto`);
await page.getByRole('button', { name: /^Eliminar Alba/ }).click();
await page.getByRole('heading', { name: 'Aún no hay selecciones', exact: true }).waitFor();
await page.goto(`${origin}/productos/mt-espejos-alba`);
await page.getByRole('button', { name: 'Añadir al presupuesto', exact: true }).click();
await page.goto(`${origin}/presupuesto`);
await page.getByRole('checkbox', { name: /Recordar mi selección/ }).check();
assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('lrmq:quote-selection:v3')).expiresAt), null);
await page.getByRole('button', { name: 'Vaciar', exact: true }).click();
await page.getByRole('heading', { name: 'Aún no hay selecciones', exact: true }).waitFor();
assert.equal(await page.evaluate(() => localStorage.getItem('lrmq:quote-selection:v3')), null);
results.push('individual removal, remember without expiry, and clear remove the stored selection and its metadata');

await page.goto(`${origin}/#contacto`);
await page.locator('#contact-name').fill('Contacto controlado');
await page.locator('#contact-phone').fill('600000000');
await page.locator('#contact-msg').fill('Mensaje controlado de revisión.');
await page.getByRole('button', { name: 'Enviar por WhatsApp', exact: true }).click();
assert.ok((await page.evaluate(() => window.__externalDestinations)).some((url) => url.startsWith('https://wa.me/') && url.includes('Contacto%20controlado')));
for (const selector of ['a[href^="tel:"]', 'a[href*="instagram.com"]', 'a[href*="maps"]']) {
  const link = page.locator(`#contacto ${selector}`).first();
  assert.ok(await link.count(), selector);
  assert.ok(await link.getAttribute('href'));
}
results.push('Contact form, phone, map, social and WhatsApp destinations: external opening intercepted');
assert.deepEqual(errors, []);
await writeFile(`/tmp/opencode/seo-flows-${width}.json`, JSON.stringify({ width, origin, results, errors, scrollDiagnostics, chatPayloads: chatPayloads.length, quotePayloads: quotePayloads.length, externalDelivery: false }, null, 2));
console.log(JSON.stringify({ width, results, errors, scrollDiagnostics, controlledChatRequests: chatPayloads.length, controlledQuoteRequests: quotePayloads.length }, null, 2));
await browser.close();
