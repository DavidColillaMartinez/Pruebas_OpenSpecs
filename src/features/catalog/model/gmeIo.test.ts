import { describe, expect, it } from 'vitest';
import { normalizeProductDetail } from './normalize';
import { buildGmeIoGallery, getGmeIoFinishImageUrl, getGmeIoFacts, getGmeIoSelectorImages, getGmeIoSelectionKeys, isGmeIoCard, isGmeIoProduct } from './gmeIo';

function ioProduct(overrides: Record<string, unknown> = {}, specOverrides: Record<string, unknown> = {}) {
  return normalizeProductDetail({
    id: 'gme-fiore',
    name: 'Fiore',
    slug: 'gme-fiore',
    supplier_id: 'gme',
    category_id: 'griferia',
    specs: { gme_io_2026: true, ...specOverrides },
    main_image_url: 'https://assets.test/covers/fiore/cover-candidate.webp',
    images: [{ url: 'https://assets.test/gallery/faucets/fiore/cromo.webp' }, { url: 'https://assets.test/gallery/faucets/fiore/negro.webp' }],
    variants: [
      { id: 'fiore-bajo-cromo', attributes: { tap_type: 'lavabo_bajo', finish: 'Cromo' }, images: [{ url: 'https://assets.test/gallery/faucets/fiore/cromo.webp' }], attributes_selector_image_url: undefined },
      { id: 'fiore-alto-cromo', attributes: { tap_type: 'lavabo_alto', finish: 'Cromo' }, images: [{ url: 'https://assets.test/gallery/faucets/fiore/cromo.webp' }] },
      { id: 'fiore-bajo-negro', attributes: { tap_type: 'lavabo_bajo', finish: 'Negro' }, images: [{ url: 'https://assets.test/gallery/faucets/fiore/negro.webp' }] },
      { id: 'fiore-acero', reference: null, attributes: { tap_type: 'lavabo_bajo', finish: 'Acero cepillado' } },
    ],
    ...overrides,
  });
}

describe('GME IO scope helpers', () => {
  it('recognizes IO products with all three API criteria', () => {
    expect(isGmeIoProduct(ioProduct())).toBe(true);
    expect(isGmeIoProduct(ioProduct({ supplier_id: 'royo' }))).toBe(false);
    expect(isGmeIoProduct(ioProduct({ category_id: 'mamparas' }))).toBe(false);
    expect(isGmeIoProduct(ioProduct({}, { gme_io_2026: false }))).toBe(false);
  });

  it('excludes GME shower enclosures and other suppliers', () => {
    const card = normalizeProductDetail({ id: 'x', name: 'X', slug: 'x', supplier_id: 'gme', category_id: 'mamparas', variants: [] });
    expect(isGmeIoProduct(card)).toBe(false);
    expect(isGmeIoCard({ ...card, io2026: true })).toBe(false);
    expect(isGmeIoCard({ supplierId: 'gme', categoryId: 'griferia', io2026: true })).toBe(true);
  });
});

describe('GME IO gallery builder', () => {
  it('orders cover first, keeps every variant photo once and excludes selectors', () => {
    const product = ioProduct({}, {
      selector_images: { tap_type: { url: 'https://assets.test/faucets/fiore/lavabo_bajo/cromo.webp' } },
      finish_image_urls: { 'Acero cepillado': 'https://assets.test/gallery/faucets/fiore/acero.webp' },
    } as Record<string, unknown>);
    product.variants.forEach((variant) => {
      if (variant.attributes?.tap_type === 'lavabo_bajo') variant.attributes.selector_image_url = 'https://assets.test/faucets/fiore/lavabo_bajo/cromo.webp';
    });
    const gallery = buildGmeIoGallery(product);
    expect(gallery[0]?.url).toBe('https://assets.test/covers/fiore/cover-candidate.webp');
    expect(gallery.map((image) => image.url)).toEqual(expect.arrayContaining([
      'https://assets.test/gallery/faucets/fiore/cromo.webp',
      'https://assets.test/gallery/faucets/fiore/negro.webp',
      'https://assets.test/gallery/faucets/fiore/acero.webp',
    ]));
    expect(new Set(gallery.map((image) => image.url)).size).toBe(gallery.length);
    expect(gallery.some((image) => image.url.includes('/faucets/fiore/lavabo'))).toBe(false);
  });

  it('keeps the assigned cover first with its API metadata even when numbered photos carry sort_order (Rhio)', () => {
    const rhio = normalizeProductDetail({
      id: 'gme-rhio',
      name: 'Rhio',
      slug: 'gme-rhio',
      supplier_id: 'gme',
      category_id: 'griferia',
      specs: { gme_io_2026: true },
      main_image_url: 'https://assets.test/covers/rhio/cover-candidate.webp',
      images: [
        { url: 'https://assets.test/gallery/faucets/rhio/cromo.webp', sort_order: 2 },
        { url: 'https://assets.test/covers/rhio/cover-candidate.webp', sort_order: 3 },
        { url: 'https://assets.test/gallery/faucets/rhio/negro.webp', sort_order: 4 },
      ],
      variants: [
        { id: 'rhio-bajo-cromo', attributes: { tap_type: 'lavabo_bajo', finish: 'Cromo' }, images: [{ url: 'https://assets.test/gallery/faucets/rhio/cromo.webp', sort_order: 2 }] },
        { id: 'rhio-alto-cromo', attributes: { tap_type: 'lavabo_alto', finish: 'Cromo' }, images: [{ url: 'https://assets.test/gallery/faucets/rhio/titanio.webp', sort_order: 5 }] },
        { id: 'rhio-bajo-negro', attributes: { tap_type: 'lavabo_bajo', finish: 'Negro' }, images: [{ url: 'https://assets.test/gallery/faucets/rhio/negro.webp', sort_order: 4 }] },
        { id: 'rhio-bajo-oro', attributes: { tap_type: 'lavabo_bajo', finish: 'Oro' }, images: [{ url: 'https://assets.test/gallery/faucets/rhio/oro.webp', sort_order: 6 }] },
        { id: 'rhio-bajo-niquel', attributes: { tap_type: 'lavabo_bajo', finish: 'Níquel' }, images: [{ url: 'https://assets.test/gallery/faucets/rhio/niquel.webp', sort_order: 7 }] },
        { id: 'rhio-bajo-blanco', attributes: { tap_type: 'lavabo_bajo', finish: 'Blanco' }, images: [{ url: 'https://assets.test/gallery/faucets/rhio/blanco.webp', sort_order: 8 }] },
      ],
    });
    const gallery = buildGmeIoGallery(rhio);
    expect(gallery[0]?.url).toBe('https://assets.test/covers/rhio/cover-candidate.webp');
    // The matched cover keeps the API metadata instead of a synthetic entry.
    expect(gallery[0]?.sortOrder).toBe(3);
    // Remaining product photos follow the API order; the six variant photos are
    // all present exactly once and never before the cover.
    expect(gallery.slice(1).map((image) => image.url)).toEqual([
      'https://assets.test/gallery/faucets/rhio/cromo.webp',
      'https://assets.test/gallery/faucets/rhio/negro.webp',
      'https://assets.test/gallery/faucets/rhio/titanio.webp',
      'https://assets.test/gallery/faucets/rhio/oro.webp',
      'https://assets.test/gallery/faucets/rhio/niquel.webp',
      'https://assets.test/gallery/faucets/rhio/blanco.webp',
    ]);
  });

  it('keeps a synthesized cover first with sort order zero when the assigned cover is outside the gallery', () => {
    const product = ioProduct();
    const gallery = buildGmeIoGallery({
      ...product,
      images: product.images.filter((image) => !image.url.includes('covers')),
      mainImageUrl: 'https://assets.test/covers/catalog/testio/cover.webp',
      mainImagePath: undefined,
    });
    expect(gallery[0]?.url).toBe('https://assets.test/covers/catalog/testio/cover.webp');
    expect(gallery[0]?.sortOrder).toBe(0);
    expect(gallery.slice(1).some((image) => image.url.includes('covers'))).toBe(false);
  });
});

describe('GME IO finish image lookup', () => {
  it('activates the large photo only for finishes that have one', () => {
    const product = ioProduct({ variants: [
      { id: 'v-cromo', attributes: { tap_type: 'lavabo_alto', finish: 'Cromo' }, images: [{ url: 'https://assets.test/gallery/faucets/fiore/cromo.webp' }] },
      { id: 'v-acero', attributes: { tap_type: 'lavabo_alto', finish: 'Acero cepillado' }, images: [{ url: 'https://assets.test/faucets/fiore/lavabo_alto/acero.webp' }], attributes_selector_image_url: undefined },
    ] });
    product.variants[1].attributes.selector_image_url = 'https://assets.test/faucets/fiore/lavabo_alto/acero.webp';
    expect(getGmeIoFinishImageUrl(product, 'Cromo')).toBe('https://assets.test/gallery/faucets/fiore/cromo.webp');
    expect(getGmeIoFinishImageUrl(product, 'Acero cepillado')).toBeUndefined();
    expect(getGmeIoFinishImageUrl(product, undefined)).toBeUndefined();
  });

  it('falls back to specs.finish_image_urls without touching selector swatches', () => {
    const product = ioProduct({}, { finish_image_urls: { Níquel: 'https://assets.test/gallery/faucets/fiore/niquel.webp' } as Record<string, unknown> });
    product.variants = product.variants.filter((variant) => variant.attributes?.finish === 'Níquel' || variant.attributes?.finish === undefined);
    expect(getGmeIoFinishImageUrl(product, 'Níquel')).toBe('https://assets.test/gallery/faucets/fiore/niquel.webp');
  });
});

describe('GME IO selector metadata', () => {
  it('exposes facts for fixed axes and selector axes for real variant variety', () => {
    const shower = ioProduct({}, { installation: 'empotrable', mechanism: 'termostatico' });
    shower.variants = shower.variants.filter((variant, index) => index === 0 || index === 1);
    expect(getGmeIoFacts(shower)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'finish', value: 'Cromo' }),
      expect.objectContaining({ key: 'installation', value: 'empotrable' }),
      expect.objectContaining({ key: 'mechanism', value: 'termostatico' }),
    ]));
    expect(getGmeIoSelectionKeys(shower)).toEqual(['tap_type']);

    const showerSelections = ioProduct({}, { installation: 'empotrable', mechanism: 'termostatico' });
    showerSelections.variants = showerSelections.variants.filter((variant, index) => index !== 1);
    expect(getGmeIoSelectionKeys(showerSelections)).toEqual(['finish']);
    expect(getGmeIoFacts(showerSelections)).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'tap_type', value: 'lavabo_bajo' })]));

    const lavabo = ioProduct({ variants: [
      { id: 'sion-bajo', attributes: { tap_type: 'lavabo_bajo', finish: 'Cromo' } },
      { id: 'sion-bide', attributes: { tap_type: 'bide', finish: 'Cromo' } },
    ] });
    expect(getGmeIoSelectionKeys(lavabo)).toEqual(['tap_type']);
    expect(getGmeIoFacts(lavabo)).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'finish', value: 'Cromo' })]));
  });

  it('returns selector images only when the API provides them', () => {
    const product = ioProduct({}, { finish_options: [{ value: 'niquel', name: 'Níquel', selector_image_url: 'https://assets.test/faucets/fiore/niquel.webp' }] });
    const images = getGmeIoSelectorImages(product);
    expect(images.finish?.['Níquel']?.url).toBe('https://assets.test/faucets/fiore/niquel.webp');
    expect(images.finish?.['Negro']).toBeUndefined();

    const textOnly = ioProduct();
    expect(Object.keys(getGmeIoSelectorImages(textOnly).finish ?? {})).toEqual([]);
  });
});
