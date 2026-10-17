import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage, type InitialProductPage } from './ProductDetailPage';
import { normalizeProductDetail } from '../model/normalize';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';

let root: Root | undefined;
let container: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
});

function Tree({ initialPage }: { initialPage: InitialProductPage }) {
  return <MemoryRouter initialEntries={[`/productos/${initialPage.slug}`]}>
    <Link to="/productos/another-product">Otra ficha</Link>
    <Link to="/auxiliar">Auxiliar</Link>
    <Routes>
      <Route path="/productos/:slug" element={<ProductDetailPage initialPage={initialPage} />} />
      <Route path="/auxiliar" element={<Link to={`/productos/${initialPage.slug}`}>Volver a ficha original</Link>} />
    </Routes>
  </MemoryRouter>;
}

async function hydrate(initialPage: InitialProductPage) {
  container = document.createElement('div');
  container.innerHTML = renderToString(<Tree initialPage={initialPage} />);
  document.body.appendChild(container);
  const onRecoverableError = vi.fn();
  await act(async () => { root = hydrateRoot(container, <Tree initialPage={initialPage} />, { onRecoverableError }); });
  expect(onRecoverableError).not.toHaveBeenCalled();
}

describe('product initial-data hydration', () => {
  it('consumes bootstrap only once and uses normal reads when the original route mounts again', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ...alba, name: 'Alba actualizada' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchImpl);
    await hydrate({ slug: alba.slug, state: { status: 'success', product: normalizeProductDetail(alba) } });
    expect(fetchImpl).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: 'Auxiliar' }));
    fireEvent.click(await screen.findByRole('link', { name: 'Volver a ficha original' }));
    expect(await screen.findByRole('heading', { name: 'Alba actualizada' })).toBeInTheDocument();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
  it('keeps initial product content without another detail request and fetches when the slug changes', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ...alba, id: 'another', slug: 'another-product', name: 'Otra ficha pública' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchImpl);
    await hydrate({ slug: alba.slug, state: { status: 'success', product: normalizeProductDetail(alba) } });
    expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    expect(fetchImpl).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: 'Otra ficha' }));
    expect(await screen.findByRole('heading', { name: 'Otra ficha pública' })).toBeInTheDocument();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('hydrates the recoverable error without refetching until the existing retry is used', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(alba), { status: 200 }));
    vi.stubGlobal('fetch', fetchImpl);
    await hydrate({ slug: alba.slug, state: { status: 'error', message: 'El catálogo no está disponible temporalmente.' } });
    expect(fetchImpl).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument());
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
