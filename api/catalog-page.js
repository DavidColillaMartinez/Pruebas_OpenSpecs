import { readFile } from 'node:fs/promises';
import { handleCatalogPageRequest } from '../server/seo/catalogPage.js';

let shell;
async function readShell() {
  if (!shell) shell = await readFile(new URL('../dist/server/shell.html', import.meta.url), 'utf8');
  return shell;
}
const loadRenderer = () => import('../dist/server/entry-product-server.js');

export default function handler(request, response) {
  return handleCatalogPageRequest(request, response, { readShell, loadRenderer });
}
