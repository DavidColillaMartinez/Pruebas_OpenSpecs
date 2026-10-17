// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { classifyArtifactError, loadRendererArtifact, loadShellArtifact } from './artifacts.js';

const RENDERABLE_SHELL = '<!doctype html><html><head><title>t</title></head><body><div id="root"></div></body></html>';
const okRenderer = () => Object.fromEntries(
  ['normalizeCatalogSearch', 'catalogRequestForPage', 'renderCatalogPage', 'renderProductPage', 'renderStaticPage'].map((name) => [name, () => {}]),
);

describe('loadShellArtifact', () => {
  it('loads the traced shell module when it exposes a renderable document', async () => {
    const html = await loadShellArtifact({ importShellModule: async () => ({ default: RENDERABLE_SHELL }) });
    expect(html).toBe(RENDERABLE_SHELL);
  });

  it('falls back to reading dist/server/shell.html when the module is unavailable', async () => {
    const html = await loadShellArtifact({
      importShellModule: async () => { throw Object.assign(new Error('gone'), { code: 'ERR_MODULE_NOT_FOUND' }); },
      readFileImpl: async () => RENDERABLE_SHELL,
    });
    expect(html).toBe(RENDERABLE_SHELL);
  });

  it('classifies an absent shell as shell-missing without leaking the path or message', async () => {
    const attempt = () => loadShellArtifact({
      importShellModule: async () => { throw Object.assign(new Error('gone'), { code: 'ERR_MODULE_NOT_FOUND' }); },
      readFileImpl: async () => { throw Object.assign(new Error('/full/local/path hidden'), { code: 'ENOENT' }); },
      cwd: '/var/task',
    });
    await expect(attempt()).rejects.toMatchObject({ seoPhase: 'shell-missing', seoErrorClass: 'ENOENT' });
    await expect(attempt()).rejects.toThrow(/not reachable/);
  });

  it('classifies unreadable (non-ENOENT) file errors as shell-io', async () => {
    await expect(loadShellArtifact({
      importShellModule: async () => { throw Object.assign(new Error('gone'), { code: 'ERR_MODULE_NOT_FOUND' }); },
      readFileImpl: async () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }); },
    })).rejects.toMatchObject({ seoPhase: 'shell-io', seoErrorClass: 'EACCES' });
  });

  it('classifies a module without a renderable document as shell-invalid', async () => {
    await expect(loadShellArtifact({
      importShellModule: async () => ({ default: '<div>No placeholder</div>' }),
      readFileImpl: async () => { throw Object.assign(new Error('absent'), { code: 'ENOENT' }); },
    })).rejects.toMatchObject({ seoPhase: 'shell-invalid' });
  });
});

describe('loadRendererArtifact', () => {
  it('returns the renderer module when all required exports are present', async () => {
    const module = await loadRendererArtifact({ importRendererModule: async () => okRenderer() });
    expect(typeof module.renderProductPage).toBe('function');
  });

  it('classifies a failing dynamic import as renderer-import with a safe error class', async () => {
    await expect(loadRendererArtifact({
      importRendererModule: async () => { throw Object.assign(new Error('/var/task/dist hidden'), { code: 'ERR_MODULE_NOT_FOUND' }); },
    })).rejects.toMatchObject({ seoPhase: 'renderer-import', seoErrorClass: 'ERR_MODULE_NOT_FOUND' });
  });

  it('classifies a missing export set as renderer-contract', async () => {
    await expect(loadRendererArtifact({ importRendererModule: async () => ({}) }))
      .rejects.toMatchObject({ seoPhase: 'renderer-contract', seoErrorClass: 'exports-missing' });
    await expect(loadRendererArtifact({ importRendererModule: async () => ({ ...okRenderer(), renderProductPage: null }) }))
      .rejects.toMatchObject({ seoPhase: 'renderer-contract', seoErrorClass: 'exports-partial' });
  });
});

describe('classifyArtifactError', () => {
  it('keeps public interpreter identifiers and never messages containing paths', async () => {
    expect(classifyArtifactError(Object.assign(new Error('path /srv/secret'), { code: 'ERR_MODULE_NOT_FOUND' }))).toBe('ERR_MODULE_NOT_FOUND');
    expect(classifyArtifactError(new SyntaxError('bad token'))).toBe('SyntaxError');
    expect(classifyArtifactError({})).toBe('unknown');
  });
});
