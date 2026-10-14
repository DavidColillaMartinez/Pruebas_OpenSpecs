// Local browser review only. GET catalogue uses existing fixtures; no real POST.
// LEGAL_REVIEW_BASE=http://127.0.0.1:4181 node scripts/legal-review.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { installMocks, basketLines } from './responsive-fixtures.mjs';

const base = process.env.LEGAL_REVIEW_BASE || 'http://127.0.0.1:4181';
const out = '/tmp/opencode';
const results = [];
const browser = await chromium.launch({ headless: true });
const meta = (page) => page.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content,
  canonical: document.querySelector('link[rel="canonical"]')?.href,
  robots: document.querySelector('meta[name="robots"]')?.content,
  ogTitle: document.querySelector('meta[property="og:title"]')?.content,
  ogUrl: document.querySelector('meta[property="og:url"]')?.content,
}));

try {
  for (const [width, height] of [[1366, 768], [390, 844]]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      await installMocks(context);
      let posts = 0;
      await context.route('**/api/**', (route) => {
        if (route.request().method() === 'POST') { posts++; return route.abort(); }
        return route.fallback();
      });
      await context.addInitScript(({ theme, lines }) => {
        localStorage.setItem('lrmq:theme:v1', theme);
        localStorage.setItem('lrmq:quote-selection:v2', JSON.stringify({ version: 2, lines }));
        sessionStorage.setItem('lrmq:assistant:welcome:v1', 'dismissed');
        window.open = () => { throw new Error('External sends are not permitted in this review'); };
      }, { theme, lines: basketLines.slice(-2) });
      const page = await context.newPage();
      const origins = new Set();
      page.on('request', (request) => origins.add(new URL(request.url()).origin));
      const go = async (path) => {
        const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200);
        await page.locator('main').waitFor({ state: 'attached' });
      };
      const shot = (name) => page.screenshot({ path: `${out}/legal-${width}-${theme}-${name}.png` });

      await go('/');
      const homeMeta = await meta(page);
      await shot('inicio');
      if (width >= 1024) await page.getByRole('button', { name: 'Ir a Contacto', exact: true }).click();
      else await page.locator('#contacto').scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await shot('contacto');
      const contactRoot = width >= 1024 ? page.locator('[data-chapter="contacto"]') : page.locator('#contacto');
      assert.equal(await contactRoot.locator('nav[aria-label="Información legal"] a').count(), 3);
      const contactInfo = contactRoot.getByRole('link', { name: /Política de privacidad.*nueva pestaña/ });
      await contactInfo.focus();
      assert(await contactInfo.evaluate((el) => el === document.activeElement));
      await shot('contacto-enlaces');
      // Capture real media behaviour, never dispatch a message.
      if (width >= 1024) {
        await page.getByRole('button', { name: 'Ir a Reformas', exact: true }).click();
        await page.mouse.move(20, height / 2);
        const video = page.locator('[data-chapter="reformas"] video');
        await video.evaluate((el) => new Promise((resolve) => { if (el.readyState >= 1) resolve(); else el.addEventListener('loadedmetadata', resolve, { once: true }); }));
        const before = await video.evaluate((el) => el.currentTime);
        await page.mouse.wheel(0, 90);
        await page.waitForTimeout(700);
        assert(await video.evaluate((el) => el.currentTime) > before);
        await page.getByRole('button', { name: 'Ir a Visión', exact: true }).click();
        const sketch = page.locator('[data-chapter="vision"] video');
        await sketch.evaluate((el) => el.dispatchEvent(new Event('ended')));
        const slider = page.getByRole('slider', { name: 'Comparar boceto con imagen final' });
        await slider.focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await slider.getAttribute('aria-valuenow'), '55');
      }

      for (const path of ['/aviso-legal', '/privacidad', '/cookies']) {
        await go(path);
        await page.reload({ waitUntil: 'networkidle' });
        const heading = page.getByRole('heading', { level: 1 });
        assert.equal(await heading.count(), 1);
        const legalMeta = await meta(page);
        assert.equal(legalMeta.canonical, `https://arealrmq.es${path}`);
        assert.equal(legalMeta.robots, 'noindex, follow');
        assert.equal(legalMeta.ogUrl, legalMeta.canonical);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const firstLink = page.getByRole('link', { name: 'Inicio', exact: true });
        await firstLink.focus();
        assert(await firstLink.evaluate((el) => el === document.activeElement && getComputedStyle(el).boxShadow !== 'none'));
        await shot(path.slice(1));
        if (path === '/cookies') {
          const table = page.getByRole('region', { name: 'Tabla de almacenamiento, desplazable horizontalmente' });
          await table.scrollIntoViewIfNeeded();
          await table.focus();
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(200);
          if (width < 1024) assert(await table.evaluate((el) => el.scrollLeft > 0));
          await shot('tabla');
        }
        await firstLink.click();
        await page.waitForTimeout(300);
        assert.deepEqual(await meta(page), homeMeta);
      }

      await go('/productos');
      const catalogMeta = await meta(page);
      await page.getByRole('link', { name: 'Aviso legal', exact: true }).click();
      await page.getByRole('heading', { name: 'Aviso legal', exact: true }).waitFor();
      await page.getByRole('link', { name: 'Catálogo', exact: true }).click();
      await page.getByRole('heading', { name: 'Catálogo', exact: true }).waitFor();
      await page.waitForFunction((title) => document.title === title, catalogMeta.title);
      assert.deepEqual(await meta(page), catalogMeta);

      for (const path of ['/productos/mt-espejos-alba', '/presupuesto']) {
        await go(path);
        const joint = path === '/presupuesto';
        await page.locator(joint ? '#joint-name' : '#quote-name').fill('Prueba local');
        await page.locator(joint ? '#joint-email' : '#quote-email').fill('local@example.com');
        await page.locator(joint ? '#joint-message' : '#quote-message').fill('Borrador local sin envío');
        const storage = await page.evaluate(() => localStorage.getItem('lrmq:quote-selection:v2'));
        const link = page.locator('a[href="/privacidad"][target="_blank"]').first();
        await link.scrollIntoViewIfNeeded();
        const popupPromise = page.waitForEvent('popup');
        await link.click();
        const popup = await popupPromise;
        await popup.getByRole('heading', { level: 1 }).waitFor();
        await popup.close();
        assert.equal(await page.locator(joint ? '#joint-name' : '#quote-name').inputValue(), 'Prueba local');
        assert.equal(await page.locator(joint ? '#joint-message' : '#quote-message').inputValue(), 'Borrador local sin envío');
        assert.equal(await page.evaluate(() => localStorage.getItem('lrmq:quote-selection:v2')), storage);
        await shot(joint ? 'presupuesto' : 'ficha');
      }
      await page.getByRole('button', { name: 'Abrir el asistente de Area LRMQ', exact: true }).click();
      const dialog = page.getByRole('dialog');
      const privacy = dialog.getByRole('link', { name: /Política de privacidad/ });
      await privacy.focus();
      await shot('asistente');
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(), 0);
      assert.equal(posts, 0);
      results.push({ width, height, theme, browser: browser.version(), status: 'PASS', posts,
        origins: [...origins], cookies: await context.cookies(), homeMeta, catalogMeta });
      await context.close();
    }
  }
  await writeFile(`${out}/legal-browser-review.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
