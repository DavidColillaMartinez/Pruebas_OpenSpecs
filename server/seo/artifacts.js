// Carga de los artefactos del build para las funciones serverless. La shell y
// el renderer se localizan primero como módulos ESM trazados en el grafo de
// importaciones (independientes del sistema de ficheros) y, como reserva, la
// shell mediante lectura directa de dist/server. Cada fallo se clasifica en
// una fase cerrada sin rutas, mensajes del intérprete, secretos ni datos de
// visitantes.

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const RENDERER_SPECIFIER = '../../dist/server/entry-product-server.js';
const SHELL_SPECIFIER = '../../dist/server/shell.js';

export const RENDERER_REQUIRED_EXPORTS = Object.freeze([
  'normalizeCatalogSearch',
  'catalogRequestForPage',
  'renderCatalogPage',
  'renderProductPage',
  'renderStaticPage',
]);

function isRenderableShell(value) {
  return typeof value === 'string' && value.includes('<div id="root"></div>');
}

// Failures keep only the interpreter's public identifiers: resolution errors
// surface generic names and never their message, which may embed paths.
export function classifyArtifactError(error, fallbackClass = 'unknown') {
  return typeof error?.code === 'string' || typeof error?.name === 'string'
    ? String(error.code ?? error.name)
    : fallbackClass;
}

export async function loadShellArtifact({ importShellModule, readFileImpl = readFile, cwd = process.cwd() } = {}) {
  try {
    const module = await (importShellModule ?? (() => import(SHELL_SPECIFIER)))();
    if (isRenderableShell(module?.default)) return module.default;
    const failure = new Error('dist/server shell artifact is not renderable');
    failure.seoPhase = 'shell-invalid';
    throw failure;
  } catch (error) {
    if (error?.seoPhase === 'shell-invalid') throw error;
  }

  let lastError;
  let missingAll = true;
  for (const location of [
    new URL('../../dist/server/shell.html', import.meta.url),
    pathToFileURL(`${cwd}/dist/server/shell.html`),
  ]) {
    try {
      return await readFileImpl(location, 'utf8');
    } catch (error) {
      lastError = error;
      if (error?.code !== 'ENOENT') missingAll = false;
    }
  }
  const failure = new Error('dist/server shell artifact is not reachable');
  failure.seoPhase = missingAll ? 'shell-missing' : 'shell-io';
  failure.seoErrorClass = classifyArtifactError(lastError);
  throw failure;
}

export async function loadRendererArtifact({ importRendererModule } = {}) {
  let module;
  try {
    module = await (importRendererModule ?? (() => import(RENDERER_SPECIFIER)))();
  } catch (error) {
    const failure = new Error('dist/server renderer could not be imported');
    failure.seoPhase = 'renderer-import';
    failure.seoErrorClass = classifyArtifactError(error);
    throw failure;
  }
  const missing = RENDERER_REQUIRED_EXPORTS.filter((name) => typeof module?.[name] !== 'function');
  if (missing.length > 0) {
    const failure = new Error('dist/server renderer is missing required exports');
    failure.seoPhase = 'renderer-contract';
    failure.seoErrorClass = missing.length === RENDERER_REQUIRED_EXPORTS.length ? 'exports-missing' : 'exports-partial';
    throw failure;
  }
  return module;
}
