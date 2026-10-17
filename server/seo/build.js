import { build } from 'vite';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { renderInitialDocument } from './head.js';

// The server must be able to load the renderer even if the sandbox's traced
// node_modules or sibling chunks are incomplete: react and all relative
// chunks are inlined into one self-contained ESM file.
await build({
  build: {
    ssr: 'src/entry-product-server.jsx',
    outDir: 'dist/server',
    emptyOutDir: true,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  ssr: { noExternal: true },
});
// Keep an empty root for per-request rendering, independent of future landing
// prerendering. The shell is written twice: as a traced ESM module the api
// functions can import without filesystem assumptions, and as a plain file
// used as an explicit fallback. Both are covered by the includeFiles contract.
const html = await readFile('dist/index.html', 'utf8');
await writeFile('dist/server/shell.js', `export default ${JSON.stringify(html)};\n`);
await copyFile('dist/index.html', 'dist/server/shell.html');
const template = html;
const { renderStaticPage } = await import('../../dist/server/entry-product-server.js');
for (const path of ['/', '/presupuesto', '/aviso-legal', '/privacidad', '/cookies']) {
  let html = renderInitialDocument(template, renderStaticPage(path));
  if (path === '/') html = html.replace('<body>', '<body class="landing-surface">');
  await writeFile(path === '/' ? 'dist/index.html' : `dist${path}.html`, html);
}
