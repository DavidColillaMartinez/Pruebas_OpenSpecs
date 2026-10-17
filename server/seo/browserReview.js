import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const width = Number(process.argv[2] || 1366);
const height = Number(process.argv[3] || 768);
const theme = process.argv[4] || 'light';
const reducedMotion = process.argv[5] === 'reduce' ? 'reduce' : 'no-preference';
const folder = '/tmp/opencode';
const sections = ['inicio', 'quienes-somos', 'coleccion', 'reformas', 'vision', 'opiniones', 'contacto'];
const labels = ['Inicio', 'Quiénes somos', 'Servicios', 'Reformas', 'Visión', 'Opiniones', 'Contacto'];
const narrative = width >= 1024 && height >= 560;
const browser = await chromium.launch();
const report = { viewport: { width, height }, theme, reducedMotion, narrative, origins: [] };

for (const [name, origin] of [['reference', process.env.SEO_REFERENCE_ORIGIN || 'http://127.0.0.1:4181'], ['candidate', process.env.SEO_CANDIDATE_ORIGIN || 'http://127.0.0.1:4182']]) {
  const context = await browser.newContext({ viewport: { width, height }, ignoreHTTPSErrors: true, reducedMotion });
  await context.addInitScript((theme) => {
    localStorage.setItem('lrmq:theme:v1', theme);
    sessionStorage.setItem('lrmq:assistant:welcome:v1', 'dismissed');
    window.__seoMetrics = { lcp: null, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__seoMetrics.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__seoMetrics.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  }, theme);
  const page = await context.newPage();
  const errors = [];
  const posts = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (request.method() === 'POST') posts.push(request.url()); });
  await page.goto(origin);
  await page.waitForTimeout(reducedMotion === 'reduce' ? 1200 : 6200);
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.evaluate(() => window.__seoMetrics);
  const states = [];
  for (const [index, id] of sections.entries()) {
    if (index > 0 && narrative) {
      await page.getByRole('button', { name: `Ir a ${labels[index]}`, exact: true }).click();
      await page.waitForTimeout(reducedMotion === 'reduce' ? 300 : 4300);
    } else if (!narrative) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    if (id === 'vision') {
      const start = page.getByRole('button', { name: 'Reproducir boceto', exact: true });
      if (await start.isVisible()) await start.click();
      await page.locator('video[aria-label="Video de boceto dibujándose"]').evaluate((video) => {
        if (Number.isFinite(video.duration)) video.currentTime = video.duration;
        video.dispatchEvent(new Event('ended'));
      });
      await page.waitForTimeout(reducedMotion === 'reduce' ? 400 : 2300);
      const slider = page.getByRole('slider', { name: 'Comparar boceto con imagen final' });
      await slider.waitFor();
      await slider.focus();
      const before = Number(await slider.getAttribute('aria-valuenow'));
      await page.keyboard.press('ArrowRight');
      assert.equal(Number(await slider.getAttribute('aria-valuenow')), before + 5);
      await page.keyboard.press('ArrowLeft');
      const box = await slider.boundingBox();
      await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * .7, box.y + box.height * .5);
      await page.mouse.up();
      assert.ok(Number(await slider.getAttribute('aria-valuenow')) > 60);
      // Return to the same comparison point in both origins.
      await page.mouse.click(box.x + box.width * .5, box.y + box.height * .5);
      await slider.blur();
    }
    if (id === 'opiniones' && narrative) {
      await page.getByRole('button', { name: 'Ver reseña 1', exact: true }).click();
      await page.waitForTimeout(850);
    }
    await page.mouse.move(0, 0);
    const geometry = await page.evaluate(({ id, narrative }) => {
      const section = document.getElementById(id) || document.querySelector(`[data-chapter="${id}"]`);
      const main = document.querySelector('main');
      const elements = [...section.querySelectorAll('h1,h2,h3,video,img')].filter((element) => {
        const r = element.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).map((element) => {
        const r = element.getBoundingClientRect();
        return { tag: element.tagName, text: element.matches('h1,h2,h3') ? element.textContent : element.getAttribute('aria-label') || element.getAttribute('alt'), x: r.x, y: r.y, width: r.width, height: r.height, src: element.currentSrc || element.src || null };
      });
      return { elements, horizontalOverflow: main.scrollWidth > main.clientWidth + 1, headingCount: document.querySelectorAll('h1').length, sections: narrative ? null : document.querySelectorAll('main section[id]').length };
    }, { id, narrative });
    assert.equal(geometry.headingCount, 1);
    assert.equal(geometry.horizontalOverflow, false, `${name} ${id}: overflow`);
    const screenshot = `${folder}/seo-review-${name}-${width}x${height}-${theme}-${reducedMotion}-${id}.png`;
    await page.screenshot({ path: screenshot });
    states.push({ id, geometry, screenshot });
  }
  assert.deepEqual(errors, [], `${name}: ${errors.join('\n')}`);
  assert.deepEqual(posts, []);
  report.origins.push({ name, origin, metrics, errors, posts, states });
  await context.close();
}
if (narrative) {
  const [reference, candidate] = report.origins;
  const differences = [];
  for (let index = 0; index < sections.length; index += 1) {
    const before = reference.states[index].geometry.elements;
    const after = candidate.states[index].geometry.elements;
    for (const [position, original] of before.entries()) {
      const changed = after[position];
      if (!changed || original.tag !== changed.tag || ['x', 'y', 'width', 'height'].some((key) => Math.abs(original[key] - changed[key]) > 1)) differences.push({ section: sections[index], original, changed });
    }
  }
  report.desktopGeometryDifferences = differences;
}
await browser.close();
const path = `${folder}/seo-review-${width}x${height}-${theme}-${reducedMotion}.json`;
await writeFile(path, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ report: path, metrics: report.origins.map(({ name, metrics }) => ({ name, ...metrics })), desktopGeometryDifferences: report.desktopGeometryDifferences }, null, 2));
