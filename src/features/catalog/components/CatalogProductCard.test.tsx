import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CatalogProductCard } from './CatalogProductCard';
import { CATALOG_RETURN_STORAGE_KEY } from '../model/catalogQuery';

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
    expect(screen.getByRole('img', { name: 'Espejo Alba' })).toHaveClass('object-contain');
    expect(screen.getByRole('img', { name: 'Espejo Alba' }).parentElement).not.toHaveClass('bg-stonewash');
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
});
