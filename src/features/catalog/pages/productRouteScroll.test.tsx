import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import { CatalogPage } from './CatalogPage';
import { ProductDetailPage } from './ProductDetailPage';

const listBody = JSON.stringify({
  items: [],
  pagination: { limit: 24, offset: 0, total: 0 },
});

const royoBody = JSON.stringify({
  id: 'royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17',
  name: 'Alfa Compact',
  slug: 'royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17',
  supplier_name: 'Royo',
  images: [],
  variants: [],
});

function jsonResponse(body: string) {
  return Promise.resolve(new Response(body, { status: 200 }));
}

function renderDetail(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/productos/${slug}`]}>
      <Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.className = '';
});

describe('product route scroll isolation', () => {
  it('keeps native document scrolling on /productos without the landing lock', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => jsonResponse(listBody)));

    render(<MemoryRouter><CatalogPage /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    expect(document.body.classList.contains('landing-narrative')).toBe(false);
  });

  it('keeps native document scrolling on both product detail routes', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => jsonResponse(JSON.stringify(alba)))
      .mockImplementationOnce(() => jsonResponse(royoBody)));

    const first = renderDetail('mt-espejos-alba');
    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    expect(document.body.classList.contains('landing-narrative')).toBe(false);
    first.unmount();

    renderDetail('royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17');
    expect(await screen.findByRole('heading', { name: 'Alfa Compact' })).toBeInTheDocument();
    expect(document.body.classList.contains('landing-narrative')).toBe(false);
  });

  it('does not mount narrative scroll listeners on product routes', async () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => jsonResponse(listBody)));

    render(<MemoryRouter><CatalogPage /></MemoryRouter>);

    await screen.findByRole('heading', { name: 'Catálogo' });
    expect(addEventListener.mock.calls.some(([type]) => type === 'wheel' || type === 'keydown')).toBe(false);
  });
});
