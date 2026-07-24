import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import { ProductDetailPage } from './ProductDetailPage';

function renderDetail(slug = 'mt-espejos-alba') {
  return render(
    <MemoryRouter initialEntries={[`/productos/${slug}`]}>
      <Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes>
    </MemoryRouter>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('ProductDetailPage', () => {
  it('announces loading and then renders the real product content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(alba), { status: 200 })));

    renderDetail();
    expect(screen.getByRole('status')).toHaveTextContent('Cargando producto');
    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Medida' })).toBeInTheDocument();
  });

  it('renders a product-specific not-found state for the API 200 error object', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' }), { status: 200 })));

    renderDetail('no-existe-lrmq');
    expect(await screen.findByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toHaveAttribute('href', '/productos');
  });

  it('allows retry after a recoverable error', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response(JSON.stringify(alba), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    renderDetail();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('renders a distinct controlled state for an invalid product contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'missing-required-fields' }), { status: 200 })));

    renderDetail();
    expect(await screen.findByRole('alert')).toHaveTextContent('La respuesta del producto no tiene una estructura válida.');
  });
});
