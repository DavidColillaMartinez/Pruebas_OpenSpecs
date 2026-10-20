import { afterEach, describe, expect, it } from 'vitest';
import { applyRouteMeta } from './routeMeta';
import { getCatalogMeta, getProductMeta } from './pageMeta';
import { normalizeProductDetail } from '../features/catalog/model/normalize';
import { getKitchenSeo } from '../features/catalog/model/kitchenSeo';
import kitchen from '../features/catalog/api/fixtures/gme-kitchen-contract.json';

afterEach(() => { document.head.innerHTML = ''; });

describe('kitchen SEO shared with client navigation', () => {
  it('defines eleven distinct titles/descriptions and keeps the osmosis caveat', () => {
    const metadata = kitchen.products.map(raw => getKitchenSeo(normalizeProductDetail(raw))!);
    expect(metadata).toHaveLength(11);
    expect(new Set(metadata.map(meta => meta.title)).size).toBe(11);
    expect(new Set(metadata.map(meta => meta.description)).size).toBe(11);
    for (const raw of kitchen.products.filter(p => p.slug.includes('osmosis'))) {
      expect(getKitchenSeo(normalizeProductDetail(raw))?.description).toContain('No se declara equipo de filtración incluido');
    }
    const product = normalizeProductDetail(kitchen.products[0]);
    expect(getKitchenSeo({ ...product, slug: 'another-product' })).toBeNull();
    expect(getKitchenSeo({ ...product, supplierId: 'other' })).toBeNull();
    expect(getKitchenSeo({ ...product, mainImageUrl: 'javascript:alert(1)' })).not.toHaveProperty('imageUrl');
  });

  it('sets and restores product images, alt text and canonical without duplicate tags', () => {
    document.head.innerHTML = '<title>Anterior</title><meta property="og:image" content="https://example.test/previous.png" />';
    const previous = document.head.innerHTML;
    const raw = kitchen.products[0];
    const meta = getProductMeta({ status: 'success', product: normalizeProductDetail(raw) }, raw.slug)!;
    const undo = applyRouteMeta(meta);
    expect(document.title).toBe(meta.title);
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', raw.main_image_url);
    expect(document.querySelector('meta[name="twitter:image"]')).toHaveAttribute('content', raw.main_image_url);
    expect(document.querySelector('meta[property="og:image:alt"]')).toHaveAttribute('content', raw.name);
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    undo();
    expect(document.head.innerHTML).toBe(previous);
    const undoCatalog = applyRouteMeta(getCatalogMeta('category=griferia&supplier=gme&catalog_section=griferia&tap_scope=cocina'));
    expect(document.title).toContain('baño y grifería de cocina');
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://assets.colilladavid.es/proyectos/lrmq/site/logopng.png');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    undoCatalog();
  });

  it('does not reuse model metadata on a missing or unavailable kitchen route', () => {
    const slug = kitchen.products[0].slug;
    for (const status of ['not-found', 'error']) {
      const meta = getProductMeta({ status }, slug)!;
      expect(meta).not.toHaveProperty('imageUrl');
      expect(meta.canonicalPath).toBeNull();
      const undo = applyRouteMeta(meta);
      expect(document.querySelector('link[rel="canonical"]')).toBeNull();
      expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://assets.colilladavid.es/proyectos/lrmq/site/logopng.png');
      undo();
    }
  });
});
