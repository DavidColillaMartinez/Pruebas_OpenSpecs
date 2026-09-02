import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CatalogProductCard } from './CatalogProductCard';
import { CATALOG_RETURN_STORAGE_KEY } from '../model/catalogQuery';

const prefetchProductBySlug = vi.hoisted(() => vi.fn());
vi.mock('../api/client', () => ({ prefetchProductBySlug }));

const product = {
  id: 'alba',
  name: 'Alba',
  slug: 'mt-espejos-alba',
  brand: 'Manillons Torrent',
  images: [{ url: 'https://assets.example/mt26-esp-alba-i01.webp', alt: 'Espejo Alba', width: 1489, height: 2105 }],
  showPrice: false,
  categoryName: 'Espejos',
};

describe('CatalogProductCard', () => {
  it('renders a complete encoded product link with stable image semantics', () => {
    render(<MemoryRouter><CatalogProductCard product={product} /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /Espejo Alba/ })).toHaveAttribute('href', '/productos/mt-espejos-alba');
    expect(screen.getByRole('img', { name: 'Espejo Alba' })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('img', { name: 'Espejo Alba' })).toHaveAttribute('src', product.images[0].url);
    expect(screen.getByRole('img', { name: 'Espejo Alba' })).toHaveClass('object-contain');
    expect(screen.getByRole('img', { name: 'Espejo Alba' }).parentElement).not.toHaveClass('bg-stonewash');
    expect(screen.getByRole('status')).toHaveTextContent('Cargando imagen');
    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
  });

  it('keeps the image well and exposes a fallback after an image error', () => {
    render(<MemoryRouter><CatalogProductCard product={product} /></MemoryRouter>);

    fireEvent.error(screen.getByRole('img', { name: 'Espejo Alba' }));

    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Imagen no disponible/ })).toBeInTheDocument();
  });

  it('stores the catalog query and scroll position before opening a detail route', () => {
    sessionStorage.clear();
    render(<MemoryRouter initialEntries={['/productos?category=mirrors&page=2']}><CatalogProductCard product={product} /></MemoryRouter>);

    fireEvent.click(screen.getByRole('link', { name: /Espejo Alba/ }));

    expect(JSON.parse(sessionStorage.getItem(CATALOG_RETURN_STORAGE_KEY) || '{}')).toMatchObject({
      search: '?category=mirrors&page=2',
      scrollY: 0,
    });
  });

  it('shows API-delivered Royo modularity without inferring it from the model name', () => {
    render(<MemoryRouter><CatalogProductCard product={{ ...product, name: 'Nombre interno', collection: 'Logika', supplierId: 'royo', categoryId: 'muebles-y-lavabos', modularity: 'modular' }} /></MemoryRouter>);

    expect(screen.getByText('Modularidad: Modular')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Logika' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nombre interno' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Espejo Alba' }).parentElement).toHaveClass('catalog-card-image-frame', 'aspect-[1489/2105]');
  });

  it('uses an explicit Royo model only when the API delivers one', () => {
    const { rerender } = render(<MemoryRouter><CatalogProductCard product={{ ...product, name: 'Nombre interno', supplierId: 'royo', categoryId: 'muebles-y-lavabos', model: 'Modelo explícito' }} /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Modelo explícito' })).toBeInTheDocument();
    rerender(<MemoryRouter><CatalogProductCard product={{ ...product, name: 'Nombre interno', supplierId: 'royo', categoryId: 'muebles-y-lavabos' }} /></MemoryRouter>);
    expect(screen.queryByRole('heading', { name: 'Nombre interno' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Modularidad:/)).not.toBeInTheDocument();
  });

  it('keeps the non-Royo card title as the product name', () => {
    render(<MemoryRouter><CatalogProductCard product={product} /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Logika' })).not.toBeInTheDocument();
  });

  it('maps Royo normal modularity to Normal without leaking it into the title', () => {
    render(<MemoryRouter><CatalogProductCard product={{ ...product, name: 'Nombre interno', collection: 'Logika', supplierId: 'royo', categoryId: 'muebles-y-lavabos', modularity: 'normal' }} /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Logika' })).toBeInTheDocument();
    expect(screen.getByText('Modularidad: Normal')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nombre interno' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Logika Normal/)).not.toBeInTheDocument();
  });

  it('never invents a Royo title from slug, name or image when collection and model are missing', () => {
    render(<MemoryRouter><CatalogProductCard product={{ ...product, name: 'Nombre interno', slug: 'slug-que-no-es-modelo', supplierId: 'royo', categoryId: 'muebles-y-lavabos' }} /></MemoryRouter>);

    expect(screen.queryByRole('heading', { name: 'Nombre interno' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /slug-que-no-es-modelo/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Manillons Torrent')).toBeInTheDocument();
  });

  it('keeps one image frame and text block structure for Royo and non-Royo cards', () => {
    render(
      <MemoryRouter>
        <CatalogProductCard product={product} />
        <CatalogProductCard product={{ ...product, id: 'royo', name: 'Royo interno', collection: 'Logika', supplierId: 'royo', categoryId: 'muebles-y-lavabos' }} />
        <CatalogProductCard product={{ ...product, id: 'gme', name: 'Open', supplierId: 'gme', categoryId: 'mamparas' }} />
      </MemoryRouter>,
    );

    expect([...document.querySelectorAll('.catalog-card-image-frame')].map((frame) => frame.className)).toHaveLength(3);
    expect(new Set([...document.querySelectorAll('.catalog-card-image-frame')].map((frame) => frame.className)).size).toBe(1);
    expect(new Set([...document.querySelectorAll('.catalog-card-text')].map((text) => text.className)).size).toBe(1);
    expect(screen.getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      product.images[0].url,
      product.images[0].url,
      product.images[0].url,
    ]);
  });

  it('prefetches the linked product detail on hover and keyboard focus', () => {
    prefetchProductBySlug.mockClear();
    render(<MemoryRouter><CatalogProductCard product={product} /></MemoryRouter>);

    const link = screen.getByRole('link', { name: /Espejo Alba/ });
    fireEvent.mouseEnter(link);
    expect(prefetchProductBySlug).toHaveBeenCalledWith('mt-espejos-alba');
    fireEvent.focus(link);
    expect(prefetchProductBySlug).toHaveBeenCalledTimes(2);
  });
});
