// Comprobación de empaquetado representativa del runtime serverless, distinta
// de las pruebas de Vite: valida que los artefactos que las funciones api
// necesitan son localizables desde un árbol de despliegue aislado con únicamente
// dist/server y dependencias instaladas. No equivale a evidencia de Vercel; esa
// confirmación requiere los logs o las cabeceras de diagnóstico en producción.

import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const distServer = resolve(root, 'dist/server');

if (!existsSync(distServer)) {
  console.error('package:seo requires a completed build (npm run build).');
  process.exit(1);
}

const renderer = await readFile(join(distServer, 'entry-product-server.js'), 'utf8');
// Rollup ESM resumes with module-level statements only: scan import/export
// statements anchored at line starts, ignoring code embedded strings.
const statementSpecifiers = [
  ...renderer.matchAll(/^import\s[^;]*?["']([^"']+)["'](?:\s*;)?$/gm),
  ...renderer.matchAll(/^export\s*(?:\*|\{[^}]*\})\s*from\s*["']([^"']+)["']/gm),
].map((match) => match[1]);
const bareImports = statementSpecifiers.filter((specifier) => !specifier.startsWith('node:'));
if (bareImports.length > 0) {
  throw new Error(`renderer bundle is not self-contained, bare imports present: ${[...new Set(bareImports)].sort().join(', ')}`);
}
const relativeImports = statementSpecifiers.filter((specifier) => specifier.startsWith('.'));
if (relativeImports.length > 0) {
  throw new Error(`renderer bundle still imports sibling files: ${[...new Set(relativeImports)].sort().join(', ')}`);
}

const sandbox = await mkdtemp(join(tmpdir(), 'lrmq-page-package-'));
const missing = [];
try {
  await mkdir(join(sandbox, 'dist'));
  // Sin node_modules a propósito: el bundle debe bastarse solo, igual que la
  // función en producción.
  await cp(distServer, join(sandbox, 'dist/server'), { recursive: true });
  // The api functions resolve these relative to the deployed module layout.
  for (const relative of ['dist/server/shell.js', 'dist/server/shell.html']) {
    if (!existsSync(join(sandbox, relative))) missing.push(relative);
  }
  const probe = `
    const shell = (await import('./dist/server/shell.js')).default;
    if (!shell.includes('<div id="root"></div>')) throw new Error('shell module not renderable');
    const renderer = await import('./dist/server/entry-product-server.js');
    for (const name of ['normalizeCatalogSearch','catalogRequestForPage','renderCatalogPage','renderProductPage','renderStaticPage']) {
      if (typeof renderer[name] !== 'function') throw new Error('renderer export missing: ' + name);
    }
    const staticPage = renderer.renderStaticPage('/');
    if (!staticPage.markup || !staticPage.initialPage) throw new Error('static page render failed');
    const catalogized = renderer.renderCatalogPage([], renderer.normalizeCatalogSearch(''), 503);
    if (!catalogized.markup) throw new Error('catalog render failed');
    const product = renderer.renderProductPage({ status: 'not-found' }, 'not-a-real-slug');
    if (!product.markup) throw new Error('product render failed');
    console.log('sandbox render ok');
  `;
  await writeFile(join(sandbox, 'probe.mjs'), probe);
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const result = await run(process.execPath, ['probe.mjs'], { cwd: sandbox, timeout: 60000 });
  console.info(`package-seo ok: ${result.stdout.trim()}`);
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
if (missing.length > 0) throw new Error(`packaged artifacts missing: ${missing.join(', ')}`);
