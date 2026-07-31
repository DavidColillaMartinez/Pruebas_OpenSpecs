import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogPage } from './CatalogPage';

afterEach(() => vi.unstubAllGlobals());

describe('CatalogPage', () => {
  it('renders a recoverable error when the list request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<MemoryRouter><CatalogPage /></MemoryRouter>);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('renders active URL criteria, dynamic counts and honest disabled sorts', async () => {
    const payload = JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: { category: [{ value: 'mirrors', label: 'Espejos', count: 0 }] },
      sort: { supported: ['relevance'] },
    });
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(payload, { status: 200, headers: { 'content-type': 'application/json' } }))));

    render(<MemoryRouter initialEntries={['/productos?search=alba&category=mirrors']}><CatalogPage /></MemoryRouter>);

    expect(await screen.findByText('No hay coincidencias')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Categoría' }));
    expect(screen.getByRole('checkbox', { name: /Espejos/ })).toBeChecked();
    expect(screen.getByRole('option', { name: /Nombre A-Z/ })).toBeDisabled();
    expect(screen.getByRole('option', { name: /Más recientes/ })).toBeDisabled();
  });

  it('derives initial filters from the public catalogue when the API omits facets', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      const isFacetWarmup = url.includes('limit=60');
      const payload = isFacetWarmup
        ? {
            items: [{ id: 'mirror-1', name: 'Espejo Alba', slug: 'mirror-1', category_id: 'mirrors', category_name: 'Espejos', images: [] }],
            pagination: { limit: 60, offset: 0, total: 1 },
            facets: {},
            sort: { supported: ['relevance'] },
          }
        : {
            items: [],
            pagination: { limit: 24, offset: 0, total: 1 },
            facets: {},
            sort: { supported: ['relevance'] },
          };
      return Promise.resolve(new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } }));
    }));

    render(<MemoryRouter initialEntries={['/productos']}><CatalogPage /></MemoryRouter>);

    fireEvent.click(await screen.findByRole('button', { name: 'Categoría' }));
    expect(screen.getByRole('checkbox', { name: /Espejos/ })).toBeInTheDocument();
  });

  it('keeps the full filter taxonomy after applying a filter', async () => {
    const items = [
      { id: 'mirror-1', name: 'Espejo Alba', slug: 'mirror-1', category_id: 'mirrors', category_name: 'Espejos', supplier_id: 'supplier-a', supplier_name: 'Proveedor A', images: [] },
      { id: 'tap-1', name: 'Grifo Cassio', slug: 'tap-1', category_id: 'taps', category_name: 'Grifería', supplier_id: 'supplier-b', supplier_name: 'Proveedor B', images: [] },
    ];
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      const isFiltered = url.includes('category_id=mirrors');
      const responseItems = isFiltered ? [items[0]] : items;
      const isFacetWarmup = url.includes('limit=60');
      return Promise.resolve(new Response(JSON.stringify({
        items: responseItems,
        pagination: { limit: isFacetWarmup ? 60 : 24, offset: 0, total: responseItems.length },
        facets: {},
        sort: { supported: ['relevance'] },
      }), { status: 200, headers: { 'content-type': 'application/json' } }));
    }));

    render(<MemoryRouter initialEntries={['/productos']}><CatalogPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Categoría' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Espejos/ }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Proveedor' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Categoría' })).toBeInTheDocument();
  });

  it('shows only general filters before a context is selected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: {
        category: [{ value: 'mamparas', label: 'Mamparas', count: 21 }],
        supplier: [{ value: 'gme', label: 'GME', count: 21 }],
        subcategory: [{ value: 'Mamparas de ducha', label: 'Mamparas de ducha', count: 17 }],
        collection: [{ value: 'Open', label: 'Open', count: 1 }],
        distribution: [{ value: '2 abatibles', label: '2 abatibles', count: 1 }],
        finish: [{ value: 'Cromo', label: 'Cromo', count: 1 }],
        measure: [{ value: '1200', label: '1200', count: 1 }],
        product_kind: [{ value: 'simple_product', label: 'Producto', count: 1 }],
      },
      sort: { supported: ['relevance'] },
    }), { status: 200 })));

    render(<MemoryRouter initialEntries={['/productos']}><CatalogPage /></MemoryRouter>);
    expect(await screen.findByRole('button', { name: 'Categoría' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Proveedor' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acabado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Medida' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Colección' })).not.toBeInTheDocument();
  });

  it('activates the Mamparas profile for category or GME supplier context', async () => {
    const response = JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: {
        category: [{ value: 'mamparas', label: 'Mamparas', count: 21 }],
        supplier: [{ value: 'gme', label: 'GME', count: 21 }],
        subcategory: [{ value: 'Mamparas de ducha', label: 'Mamparas de ducha', count: 17 }],
        collection: [{ value: 'Open', label: 'Open', count: 1 }],
        distribution: [{ value: '2 abatibles', label: '2 abatibles', count: 1 }],
        finish: [{ value: 'Cromo', label: 'Cromo', count: 1 }],
        measure: [{ value: '1200', label: '1200', count: 1 }],
        product_kind: [{ value: 'simple_product', label: 'Producto', count: 1 }],
      },
      sort: { supported: ['relevance'] },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(response, { status: 200 })));

    render(<MemoryRouter initialEntries={['/productos?supplier=gme']}><CatalogPage /></MemoryRouter>);
    expect(await screen.findByRole('button', { name: 'Tipo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modelo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Distribución' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acabado' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Medida' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tipo de producto' })).not.toBeInTheDocument();
  });

  it('exposes a distinct store masthead and skip-to-results landmark', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: { category: [{ value: 'mamparas', label: 'Mamparas', count: 21 }] },
      sort: { supported: ['relevance'] },
    }), { status: 200 })));

    render(<MemoryRouter initialEntries={['/productos']}><CatalogPage /></MemoryRouter>);
    expect(await screen.findByRole('banner', { name: 'Catálogo' })).toBeInTheDocument();
    expect(screen.getAllByText('Tienda')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Saltar a resultados' })).toHaveAttribute('href', '#catalog-results');
    expect(screen.getByRole('region', { name: 'Resultados' })).toHaveAttribute('tabindex', '-1');
  });
});
