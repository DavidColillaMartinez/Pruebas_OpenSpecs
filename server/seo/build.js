import { build } from 'vite';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { renderInitialDocument } from './head.js';

await build({
  build: { ssr: 'src/entry-product-server.jsx', outDir: 'dist/server', emptyOutDir: true },
});
// Keep an empty root for per-request rendering, independent of future landing
// prerendering. Both assets are explicitly included in the Vercel function.
await copyFile('dist/index.html', 'dist/server/shell.html');
const template = await readFile('dist/server/shell.html', 'utf8');
const { renderStaticPage } = await import('../../dist/server/entry-product-server.js');
for (const path of ['/', '/presupuesto', '/aviso-legal', '/privacidad', '/cookies']) {
  let html = renderInitialDocument(template, renderStaticPage(path));
  if (path === '/') html = html.replace('<body>', '<body class="landing-surface">');
  await writeFile(path === '/' ? 'dist/index.html' : `dist${path}.html`, html);
}
