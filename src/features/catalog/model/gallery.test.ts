import { describe, expect, it } from 'vitest';
import { getSelectableUnits, selectInitialUnit } from './selection';
import { normalizeProductDetail } from './normalize';
import { buildRoyoProductGallery } from './gallery';

function royoProduct(overrides: Record<string, unknown> = {}) {
  return normalizeProductDetail({
    id: 'royo-gallery',
    name: 'Mueble Royo',
    slug: 'royo-gallery',
    supplier_id: 'royo',
    category_id: 'muebles-y-lavabos',
    images: [
      { url: 'https://assets.example/cover.webp', role: 'main', sort_order: 1 },
      { url: 'https://assets.example/detail.webp', role: 'detail', sort_order: 2 },
    ],
    variants: [{ id: 'royo-gallery-v1', finish: 'Blanco', attributes: {}, ...overrides }],
  });
}

describe('Royo product gallery', () => {
  it('places a selected variant image first and preserves the complete product gallery', () => {
    const product = royoProduct({ images: [{ url: 'https://assets.example/quick.webp', role: 'variant' }] });
    const unit = selectInitialUnit(getSelectableUnits(product));

    expect(buildRoyoProductGallery(product, unit).map((image) => image.url)).toEqual([
      'https://assets.example/quick.webp',
      'https://assets.example/cover.webp',
      'https://assets.example/detail.webp',
    ]);
  });

  it('uses an unambiguous API finish and type mapping without inventing a URL', () => {
    const product = normalizeProductDetail({
      ...royoProduct({ presentation_type: 'Suspendido' }),
      supplier_id: 'royo',
      category_id: 'muebles-y-lavabos',
      specs: {
        finish_image_map: { Blanco: 'https://assets.example/finish.webp' },
        type_image_map: { Suspendido: { Blanco: 'https://assets.example/type-finish.webp' } },
      },
    });
    const unit = selectInitialUnit(getSelectableUnits(product));

    expect(buildRoyoProductGallery(product, unit)[0].url).toBe('https://assets.example/finish.webp');
    expect(buildRoyoProductGallery(product, unit).map((image) => image.url)).toContain('https://assets.example/cover.webp');
    expect(buildRoyoProductGallery(product, unit).map((image) => image.url)).toContain('https://assets.example/type-finish.webp');
    expect(buildRoyoProductGallery(product, unit).map((image) => image.url)).not.toContain('images/royo/Blanco.webp');
  });

  it('keeps product images when the API has no usable shortcut', () => {
    const product = normalizeProductDetail({
      ...royoProduct(),
      supplier_id: 'royo',
      category_id: 'muebles-y-lavabos',
      specs: { finish_image_map: { Blanco: 'images/royo/Blanco.webp' } },
    });
    const unit = selectInitialUnit(getSelectableUnits(product));

    expect(buildRoyoProductGallery(product, unit).map((image) => image.url)).toEqual([
      'https://assets.example/cover.webp',
      'https://assets.example/detail.webp',
    ]);
  });

  it('does not apply Royo shortcuts outside the exact furniture scope', () => {
    const product = normalizeProductDetail({ ...royoProduct(), supplier_id: 'gme', specs: { finish_image_map: { Blanco: 'https://assets.example/finish.webp' } } });
    const unit = selectInitialUnit(getSelectableUnits(product));

    expect(buildRoyoProductGallery(product, unit).map((image) => image.url)).toEqual([
      'https://assets.example/cover.webp',
      'https://assets.example/detail.webp',
    ]);
  });
});
