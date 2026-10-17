// Comprobación de empaquetado representativa del runtime serverless, distinta
// de las pruebas de Vite: valida que los artefactos que las funciones api
// necesitan son localizables desde un árbol de despliegue aislado con únicamente
// dist/server y dependencias instaladas. No equivale a evidencia de Vercel; esa
// confirmación requiere los logs o las cabeceras de diagnóstico en producción.

import { cp, mkdir, mkdtemp, readFile, rm, writeFile, symlink } from 'node:fs/promises';
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
const relativeSpecifiers = new Set([...renderer.matchAll(/(?:from\s*|import\()\s*["'](\.[^"']+)["']/g)]
  .map((match) => match[1]));
const bareSpecifiers = new Set([...renderer.matchAll(/(?:from\s*|import\()\s*["']([^.]["'][^"']*)["']/g)]
  .map((match) => match[1].replace(/["'].+$/, '')));
for (const specifier of relativeSpecifiers) {
  const target = resolve(distServer, specifier);
  await readFile(join(target), 'utf8');
}
for (const specifier of bareSpecifiers) {
  if (!existsSync(resolve(root, 'node_modules', specifier.split('/')[0]))) {
    throw new Error(`bare dependency not installed: ${specifier.split('/')[0]}`);
  }
}

const sandbox = await mkdtemp(join(tmpdir(), 'lrmq-page-package-'));
const missing = [];
try {
  await mkdir(join(sandbox, 'dist'));
  await cp(distServer, join(sandbox, 'dist/server'), { recursive: true });
  await symlink(resolve(root, 'node_modules'), join(sandbox, 'node_modules'), 'dir');
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
