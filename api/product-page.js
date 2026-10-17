// Artefactos generados por el build. La shell se importa como módulo trazado
// (o se lee de dist/server como reserva); el renderer se carga de forma perezosa
// con importación dinámica trazable. Cada fallo es registrado y clasificado con
// una fase cerrada, nunca con rutas, mensajes del intérprete ni datos de
// visitantes.

import { handleProductPageRequest } from '../server/seo/productPage.js';
import { loadRendererArtifact, loadShellArtifact } from '../server/seo/artifacts.js';

let cachedShell;
async function readShell() {
  if (cachedShell === undefined) cachedShell = await loadShellArtifact();
  return cachedShell;
}

let rendererModule;
async function renderPage(result, slug) {
  if (rendererModule === undefined) {
    rendererModule = await loadRendererArtifact();
  }
  try {
    return rendererModule.renderProductPage(result, slug);
  } catch (error) {
    if (error?.seoPhase === undefined) error.seoPhase = 'render';
    if (error?.seoErrorClass === undefined) error.seoErrorClass = error?.name ?? 'unknown';
    throw error;
  }
}

export default function handler(request, response) {
  return handleProductPageRequest(request, response, { readShell, renderPage });
}
