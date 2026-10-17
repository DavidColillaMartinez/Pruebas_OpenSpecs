// Observed Chromium lab measurements, not Lighthouse scores or field vitals.
// Usage: node server/seo/performanceReview.js ORIGIN LABEL [runs=3]
import { chromium } from 'playwright';
import { cp, readFile, writeFile } from 'node:fs/promises';

const origin = process.argv[2] || 'http://127.0.0.1:4193';
const label = process.argv[3] || 'candidate';
const runs = Number(process.argv[4] || 3);
if (process.env.PERF_SNAPSHOT) await cp('dist', process.env.PERF_SNAPSHOT, { recursive: true });
const netLog = `/tmp/opencode/perf-${label}-netlog.json`;
const browser = await chromium.launch({ args: [`--log-net-log=${netLog}`] });
const results = { label, origin, browser: browser.version(), date: new Date().toISOString(), runs: [] };
for (const width of [390, 1440]) {
  for (let iteration = 0; iteration < runs; iteration++) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1, colorScheme: 'light' });
    await context.addInitScript(() => {
      localStorage.setItem('lrmq:theme:v1', 'light');
      sessionStorage.setItem('lrmq:assistant:welcome:v1', 'dismissed');
      window.__perf = { lcps: [], shifts: [], blocking: 0 };
      new PerformanceObserver(list => { for (const e of list.getEntries()) window.__perf.lcps.push({ time: e.startTime, loadTime: e.loadTime, renderTime: e.renderTime, size: e.size, url: e.url, element: e.element?.outerHTML.slice(0, 600) }); }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__perf.shifts.push({ time: e.startTime, value: e.value }); }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) window.__perf.blocking += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const conditions = width === 390 ? { latency: 150, downloadThroughput: 200000, uploadThroughput: 93750, cpu: 4 } : { latency: 40, downloadThroughput: 1250000, uploadThroughput: 625000, cpu: 1 };
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: conditions.latency, downloadThroughput: conditions.downloadThroughput, uploadThroughput: conditions.uploadThroughput });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: conditions.cpu });
    for (const cache of ['cold', 'warm']) {
      let requests = new Map();
      const started = e => requests.set(e.requestId, { url: e.request.url, type: e.type, bytes: 0, received: 0 });
      const finished = e => { const item = requests.get(e.requestId); if (item) item.bytes = e.encodedDataLength; };
      const received = e => { const item = requests.get(e.requestId); if (item) { item.received += e.encodedDataLength; item.bytes = Math.max(item.bytes, item.received); } };
      const failed = e => { const item = requests.get(e.requestId); if (item) item.failure = e.errorText; };
      cdp.on('Network.requestWillBeSent', started);
      cdp.on('Network.loadingFinished', finished);
      cdp.on('Network.dataReceived', received);
      cdp.on('Network.loadingFailed', failed);
      const startedAt = Date.now();
      await page.goto(origin, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(12000);
      const snapshot = async () => ({ count: requests.size, bytes: [...requests.values()].reduce((s, r) => s + r.bytes, 0), requests: [...requests.values()] });
      const initial = await snapshot();
      const initialEnd = Date.now();
      const vitals = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const lcp = window.__perf.lcps.at(-1);
        const resource = performance.getEntriesByType('resource').find(r => r.name === lcp?.url);
        let max = 0, current = 0, start = 0, previous = 0;
        for (const shift of window.__perf.shifts) { if (shift.time - previous > 1000 || shift.time - start > 5000) { current = 0; start = shift.time; } current += shift.value; previous = shift.time; max = Math.max(max, current); }
        return { ...window.__perf, cls: max, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, ttfb: nav.responseStart, resource: resource?.toJSON(), lcp, images: [...document.images].map(i => ({ src: i.currentSrc, width: i.clientWidth, naturalWidth: i.naturalWidth, sizes: i.sizes, loading: i.loading })), animations: document.getAnimations().map(a => ({ name: a.animationName, target: a.effect?.target?.tagName })) };
      });
      if (iteration === 0 && cache === 'cold') {
        for (const [index, id] of ['inicio', 'quienes-somos', 'coleccion', 'reformas', 'vision', 'opiniones', 'contacto'].entries()) {
          if (width === 1440) await page.locator('[data-lrmq-chapter-dots] button').nth(index).click();
          else await page.locator(`#${id}`).scrollIntoViewIfNeeded();
          await page.waitForTimeout(2500);
        }
      }
      const traversal = await snapshot();
      results.runs.push({ width, iteration, cache, conditions, vitals, initial, traversal, startedAt, initialEnd, traversalEnd: Date.now() });
      cdp.off('Network.requestWillBeSent', started);
      cdp.off('Network.loadingFinished', finished);
      cdp.off('Network.dataReceived', received);
      cdp.off('Network.loadingFailed', failed);
      console.log(JSON.stringify({ label, width, iteration, cache, fcp: vitals.fcp, lcp: vitals.lcp?.time, cls: vitals.cls, bytes: initial.bytes, requests: initial.count }));
    }
    await context.close();
  }
}
await browser.close();
// Chromium cancels metadata range requests after buffering enough video data;
// CDP then reports ERR_ABORTED without its byte count. NetLog records body
// bytes actually read, including those cancelled media requests (not the
// potentially much larger Content-Length of the requested range).
const log = JSON.parse(await readFile(netLog, 'utf8'));
const types = Object.fromEntries(Object.entries(log.constants.logEventTypes).map(([k,v]) => [v,k]));
const sources = new Map();
for (const e of log.events) if (e.params?.url) sources.set(e.source.id, e.params.url);
for (const run of results.runs) for (const [phase, end] of [['initial',run.initialEnd], ['traversal',run.traversalEnd]]) {
  const bytes = {}, http2Bytes = {};
  for (const e of log.events) {
    const time = Number(e.time) + Number(log.constants.timeTickOffset);
    if (time < run.startedAt || time > end) continue;
    const url = sources.get(e.source.id);
    if (!url) continue;
    if (types[e.type] === 'URL_REQUEST_JOB_BYTES_READ') bytes[url] = (bytes[url] || 0) + (e.params?.byte_count || 0);
    if (types[e.type] === 'HTTP2_STREAM_UPDATE_RECV_WINDOW' && e.params?.delta < 0) http2Bytes[url] = (http2Bytes[url] || 0) - e.params.delta;
  }
  for (const [url, value] of Object.entries(http2Bytes)) if (!bytes[url]) bytes[url] = value;
  run[phase].netLogBodyBytes = bytes;
}
await writeFile(`/tmp/opencode/perf-${label}.json`, JSON.stringify(results, null, 2));
