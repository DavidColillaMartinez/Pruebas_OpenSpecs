// Real GETs and media events; no synthesized successful ended event.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const origin = process.env.SEO_CANDIDATE_ORIGIN || 'http://127.0.0.1:4193';
const browser = await chromium.launch();
const results = [];
for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  await context.addInitScript(theme => { localStorage.setItem('lrmq:theme:v1', theme); sessionStorage.setItem('lrmq:assistant:welcome:v1', 'dismissed'); }, theme);
  const page = await context.newPage();
  const requests = [], errors = [];
  page.on('request', r => { if (/mp4|vision-boceto-poster/.test(r.url())) requests.push(r.url()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin);
  await page.waitForTimeout(2200);
  assert.equal(requests.length, 0, 'No video or poster request during Inicio');
  assert.equal(await page.locator('video[src]').count(), 0);
  const navigate = async (index, id) => {
    if (width === 1440) await page.locator('[data-lrmq-chapter-dots] button').nth(index).click();
    else await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
  };
  if (width === 1440) {
    await navigate(2, 'coleccion');
    assert.ok(requests.some(url => url.endsWith('reforma-proceso.mp4')));
    assert.ok(!requests.some(url => /vision-boceto/.test(url)), 'Only the next chapter is prepared');
  } else {
    await page.evaluate(() => {
      const video = document.querySelector('#reformas video');
      const main = document.querySelector('main');
      const mainBox = main.getBoundingClientRect();
      const top = video.getBoundingClientRect().top;
      main.scrollTop += top - mainBox.bottom - 400;
    });
    await page.waitForFunction(() => document.querySelector('#reformas video').hasAttribute('src'));
    assert.ok(await page.locator('#reformas video').evaluate(v => v.getBoundingClientRect().top > v.closest('main').getBoundingClientRect().bottom), 'Prepare media before it enters the natural scrollport');
  }
  await navigate(3, 'reformas');
  const renovation = page.locator('#reformas video');
  await page.waitForFunction(() => document.querySelector('#reformas video').readyState >= 2);
  if (width === 1440) {
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 800);
    await page.waitForFunction(() => document.querySelector('#reformas video').currentTime > 0.5);
  } else {
    assert.equal(await renovation.evaluate(v => v.controls), true);
    await renovation.evaluate(v => v.play());
    await page.waitForFunction(() => document.querySelector('#reformas video').currentTime > 0.5);
    await renovation.evaluate(v => v.pause());
  }
  await navigate(4, 'vision');
  await page.waitForFunction(() => document.querySelector('#vision video').readyState >= 2);
  if (width === 390) await page.getByRole('button', { name: 'Reproducir boceto', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#vision video').ended, undefined, { timeout: 20000 });
  const slider = page.getByRole('slider', { name: 'Comparar boceto con imagen final' });
  await slider.waitFor();
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await slider.getAttribute('aria-valuenow'), '55');
  const box = await slider.boundingBox();
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .75, box.y + box.height * .5);
  await page.mouse.up();
  assert.ok(Number(await slider.getAttribute('aria-valuenow')) > 65);
  await page.screenshot({ path: `/tmp/opencode/perf-vision-${width}-${theme}.png` });
  await page.getByRole('button', { name: 'Reproducir video de nuevo' }).click();
  await page.waitForFunction(() => { const v = document.querySelector('#vision video'); return !v.ended && !v.paused && v.currentTime > 0; });
  await navigate(2, 'coleccion');
  await navigate(3, 'reformas');
  assert.ok(await renovation.getAttribute('src'), 'Keep the prepared source when navigating back');
  assert.deepEqual(errors, []);
  results.push({ width, theme, initialRequests: 0, requests, errors, realPlaybackAndReplay: true });
  await context.close();
}
await browser.close();
await writeFile('/tmp/opencode/perf-media-delivery.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
