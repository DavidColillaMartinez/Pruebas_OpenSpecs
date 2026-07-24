import { describe, expect, it, vi } from 'vitest';
import alba from './fixtures/product-detail.mt-espejos-alba.json';
import { getProductBySlug } from './client';

describe('catalog API client', () => {
  it('requests the public relative route and normalizes a real product response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(alba), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const product = await getProductBySlug('mt-espejos-alba');

    expect(fetchMock).toHaveBeenCalledWith('/api/catalog/products/mt-espejos-alba', expect.objectContaining({ method: 'GET' }));
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('webhook');
    expect(product).toMatchObject({ id: 'mt-espejos-alba', name: 'Alba', variants: expect.any(Array) });
    expect(product.variants[0]).not.toHaveProperty('source_page');
    expect(product).not.toHaveProperty('search_text');
  });

  it('preserves the API not-found error even when the status is 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado',
    }), { status: 200 }))); 

    await expect(getProductBySlug('no-existe-lrmq')).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      status: 200,
    });
  });

  it('handles the public proxy 404 normalization for PRODUCT_NOT_FOUND', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado',
    }), { status: 404 })));

    await expect(getProductBySlug('no-existe-lrmq')).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      status: 404,
    });
  });

  it('classifies invalid JSON as a contract transport error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not-json', { status: 200 })));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code: 'INVALID_JSON' });
  });

  it.each([
    [400, 'VALIDATION_ERROR'],
    [429, 'RATE_LIMITED'],
    [503, 'SERVER_ERROR'],
  ])('classifies HTTP %s as %s', async (status, code) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: code, message: 'Error de prueba' }), { status })));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code, status });
  });

  it('classifies network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('classifies an unusable successful contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'only-id' }), { status: 200 })));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code: 'CONTRACT_ERROR' });
  });

  it('classifies an aborted request as timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options) => new Promise((_, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError')), { once: true });
    })));

    const request = getProductBySlug('mt-espejos-alba', null, { timeoutMs: 10 });
    vi.advanceTimersByTime(10);
    await expect(request).rejects.toMatchObject({ code: 'TIMEOUT' });
    vi.useRealTimers();
  });
});
