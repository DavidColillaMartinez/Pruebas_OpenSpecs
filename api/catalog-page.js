// Artefactos generados por el build. La shell se importa como módulo trazado
// (o se lee de dist/server como reserva); el renderer del catálogo se carga de
// forma perezosa con importación dinámica trazable. Cada fallo es registrado y
// clasificado con una fase cerrada, nunca con rutas, mensajes del intérprete ni
// datos de visitantes.

import { handleCatalogPageRequest } from '../server/seo/catalogPage.js';
import { loadRendererArtifact, loadShellArtifact } from '../server/seo/artifacts.js';

let cachedShell;
async function readShell() {
  if (cachedShell === undefined) cachedShell = await loadShellArtifact();
  return cachedShell;
}

let rendererModule;
async function loadRenderer() {
  if (rendererModule === undefined) rendererModule = await loadRendererArtifact();
  return rendererModule;
}

export default function handler(request, response) {
  return handleCatalogPageRequest(request, response, { readShell, loadRenderer });
}
