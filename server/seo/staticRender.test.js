// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { renderStaticPage, renderCatalogPage, normalizeCatalogSearch, catalogRequestForPage } from '../../src/entry-server.jsx';
import { renderInitialDocument } from './head.js';

const template = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const product = JSON.parse(await readFile(new URL('../../src/features/catalog/api/fixtures/product-detail.mt-espejos-alba.json', import.meta.url), 'utf8'));

describe('initial public documents', () => {
  it('renders a single landing tree with all approved content and business JSON-LD in Node', () => {
    const html = renderInitialDocument(template, renderStaticPage('/'));
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    for (const id of ['inicio', 'quienes-somos', 'coleccion', 'reformas', 'vision', 'opiniones', 'contacto']) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('profesionales independientes, con contratación separada');
    expect(html.match(/type="application\/ld\+json"/g)).toHaveLength(1);
    expect(html).toContain('C/ Aquitania, 69, local 1');
    expect(html).not.toContain('priceRange');
    expect(html).not.toContain('mobile-inicio-title');
    expect(html).not.toContain('<!--$!-->');
  });

  it.each(['/presupuesto', '/aviso-legal', '/privacidad', '/cookies'])('emits content and noindex initially for %s', (path) => {
    const html = renderInitialDocument(template, renderStaticPage(path));
    expect(html).toMatch(/<h1[ >]/);
    expect(html).toContain('content="noindex, follow"');
    expect(html).toContain(`href="https://arealrmq.es${path}"`);
    expect(html).not.toContain('<!--$!-->');
  });

  it('keeps the quote document generic and reproducible between visitors', () => {
    const first = renderStaticPage('/presupuesto');
    const second = renderStaticPage('/presupuesto');
    expect(first).toEqual(second);
    expect(first.markup).toContain('Aún no hay selecciones');
    expect(first.initialPage).toEqual({ kind: 'quote' });
    expect(first.markup).not.toContain('Alba');
    expect(first.markup).not.toContain('customerName');
  });

  it('renders public catalogue results with one shared normalized initial state', () => {
    const raw = { items: [{ ...product, private_token: 'secret-canary' }], pagination: { limit: 24, offset: 0, total: 1, has_more: false } };
    const rendered = renderCatalogPage([raw], '');
    const html = renderInitialDocument(template, rendered);
    expect(html).toContain('Alba');
    expect(html).toContain(`/productos/${product.slug}`);
    expect(html).not.toContain('secret-canary');
    expect(html).not.toContain('<!--$!-->');
    expect(rendered.initialPage.catalog.data.items).toHaveLength(1);
    expect(rendered.initialPage.catalog.data.loadedPage).toBe(1);
  });

  it('shares indexation rules for criteria, pagination, tracking and errors', () => {
    expect(normalizeCatalogSearch('?utm_source=private-canary&page=1')).toBe('');
    expect(catalogRequestForPage('page=2', 2).params.offset).toBe(24);
    expect(renderCatalogPage([], 'search=baño').meta.robots).toBe('noindex, follow');
    expect(renderCatalogPage([], 'page=2').meta.canonicalPath).toBe('/productos?page=2');
    expect(renderCatalogPage([], '', 503).meta.robots).toBe('index, follow');
    expect(renderCatalogPage([], 'page=999', 404).meta.canonicalPath).toBeNull();
  });
});
