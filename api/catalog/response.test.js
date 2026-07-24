import { describe, expect, it } from 'vitest';
import { normalizeCatalogResponseStatus } from './response.js';

describe('public catalog response status', () => {
  it('normalizes the n8n 200 PRODUCT_NOT_FOUND defect to public 404', () => {
    expect(normalizeCatalogResponseStatus(200, JSON.stringify({
      error: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado',
    }))).toBe(404);
  });

  it('preserves successful products and upstream failures', () => {
    expect(normalizeCatalogResponseStatus(200, JSON.stringify({ id: 'product' }))).toBe(200);
    expect(normalizeCatalogResponseStatus(500, JSON.stringify({ error: 'SERVER_ERROR' }))).toBe(500);
  });
});
