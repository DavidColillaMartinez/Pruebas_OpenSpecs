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

  it('derives initial filters from the first page without a second facet request', async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      const payload = {
        items: [{ id: 'mirror-1', name: 'Espejo Alba', slug: 'mirror-1', category_id: 'mirrors', category_name: 'Espejos', images: [] }],
        pagination: { limit: 24, offset: 0, total: 1 },
        facets: {},
        sort: { supported: ['relevance'] },
      };
      return Promise.resolve(new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } }));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryRouter initialEntries={['/productos']}><CatalogPage /></MemoryRouter>);

    fireEvent.click(await screen.findByRole('button', { name: 'Categoría' }));
    expect(screen.getByRole('checkbox', { name: /Espejos/ })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('limit=60');
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

  it('activates the Espejos profile from category with its API facet order', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: {
        category: [{ value: 'espejos', label: 'Espejos', count: 53 }],
        supplier: [{ value: 'manillons-torrent', label: 'Manillons Torrent', count: 53 }],
        subcategory: [{ value: 'Circular', label: 'Circular', count: 15 }],
        collection: [{ value: 'Alba', label: 'Alba', count: 1 }],
        shape: [{ value: 'Circular', label: 'Circular', count: 15 }],
        has_led: [{ value: 'false', label: 'No', count: 21 }],
        lighting_type: [{ value: 'Sin luz', label: 'Sin luz', count: 21 }],
        finish: [{ value: 'Negro mate', label: 'Negro mate', count: 17 }],
      },
      sort: { supported: ['relevance'] },
    }), { status: 200 })));

    render(<MemoryRouter initialEntries={['/productos?category=espejos']}><CatalogPage /></MemoryRouter>);
    const dialog = screen.getByRole('region', { name: 'Resultados' });
    expect(await screen.findByRole('button', { name: 'Tipo de espejo' })).toBeInTheDocument();
    expect([...document.querySelectorAll('aside fieldset legend button')].map((button) => button.textContent?.trim())).toEqual([
      'Categoría+',
      'Proveedor+',
      'Tipo de espejo+',
      'Modelo+',
      'Forma+',
      'LED+',
      'Tipo de iluminación+',
      'Acabado+',
    ]);
    expect(dialog).toBeInTheDocument();
  });

  it('activates the Espejos profile from supplier without requiring category', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: {
        category: [{ value: 'espejos', label: 'Espejos', count: 53 }],
        supplier: [{ value: 'manillons-torrent', label: 'Manillons Torrent', count: 53 }],
        subcategory: [{ value: 'Circular', label: 'Circular', count: 15 }],
        collection: [{ value: 'Alba', label: 'Alba', count: 1 }],
        shape: [{ value: 'Circular', label: 'Circular', count: 15 }],
        has_led: [{ value: 'false', label: 'No', count: 21 }],
        lighting_type: [{ value: 'Sin luz', label: 'Sin luz', count: 21 }],
        finish: [{ value: 'Negro mate', label: 'Negro mate', count: 17 }],
      },
      sort: { supported: ['relevance'] },
    }), { status: 200 })));

    render(<MemoryRouter initialEntries={['/productos?supplier=manillons-torrent']}><CatalogPage /></MemoryRouter>);
    expect(await screen.findByRole('button', { name: 'Tipo de espejo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acabado' })).toBeInTheDocument();
  });

  it('shows the Royo profile from category alone without Modularidad and Tipo de producto', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      items: [{
        id: 'royo-card',
        name: 'Nombre interno Royo',
        slug: 'royo-card',
        supplier_id: 'royo',
        category_id: 'muebles-y-lavabos',
        collection: 'Logika',
        modularity: 'normal',
        main_image_url: 'https://assets.example/royo-cover.webp',
      }],
      pagination: { limit: 24, offset: 0, total: 1 },
      facets: {
        category: [{ value: 'muebles-y-lavabos', label: 'Muebles y lavabos', count: 1 }],
        supplier: [{ value: 'royo', label: 'Royo', count: 1 }],
        modularity: [{ value: 'modular', label: 'Modular', count: 1 }, { value: 'normal', label: 'Normal', count: 1 }],
        collection: [{ value: 'Logika', label: 'Logika', count: 1 }],
        subcategory: [{ value: 'Muebles modulares', label: 'Muebles modulares', count: 1 }],
        finish: [{ value: 'Nogal', label: 'Nogal', count: 1 }],
        measure: [{ value: '80', label: '80', count: 1 }],
        product_kind: [{ value: 'configurable_product', label: 'Configurable', count: 1 }],
      },
      sort: { supported: ['relevance'] },
    }), { status: 200, headers: { 'content-type': 'application/json' } })));
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryRouter initialEntries={['/productos?category=muebles-y-lavabos&page=3']}><CatalogPage /></MemoryRouter>);

    expect(await screen.findByRole('button', { name: 'Modelo' })).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url]) => {
      const requestUrl = String(url);
      return requestUrl.includes('category_id=muebles-y-lavabos') && !requestUrl.includes('supplier_id=');
    })).toBe(true);
    expect([...document.querySelectorAll('aside fieldset legend button')].map((button) => button.textContent?.trim())).toEqual([
      'Modelo+', 'Tipo de mueble+', 'Acabado+', 'Medida+', 'Categoría+', 'Proveedor+',
    ]);
    expect(screen.queryByRole('button', { name: 'Modularidad' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tipo de producto' })).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Logika' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nombre interno Royo' })).not.toBeInTheDocument();
  });

  it('shows the Duplach category filter set from the shower-tray category alone', async () => {
    const payload = {
      items: [],
      pagination: { limit: 24, offset: 0, total: 8 },
      facets: {
        category: [{ value: 'platos-de-ducha', label: 'Platos de ducha', count: 8 }],
        supplier: [{ value: 'duplach', label: 'Duplach', count: 8 }],
        model: [{ value: 'duplach-stone-3d', label: 'Stone 3D', count: 1 }, { value: 'duplach-stone-plus', label: 'Stone Plus', count: 1 }],
        measure: [{ value: '70x70', label: '70x70', count: 8 }],
        texture: [{ value: 'Liso', label: 'Liso', count: 5 }],
        color: [{ value: 'Antracita', label: 'Antracita', count: 7 }],
        grille: [{ value: 'Acero inoxidable', label: 'Acero inoxidable', count: 5 }],
        valve: [{ value: 'Sifón', label: 'Sifón', count: 7 }],
        orientation: [{ value: 'Derecha', label: 'Derecha', count: 1 }],
        finish_family: [{ value: 'maderas-naturales', label: 'Maderas naturales', count: 1 }],
        finish: [{ value: 'Roble', label: 'Roble', count: 1 }],
      },
      sort: { supported: ['relevance'] },
    };
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } }))));

    render(<MemoryRouter initialEntries={['/productos?category=platos-de-ducha']}><CatalogPage /></MemoryRouter>);

    expect(await screen.findByRole('button', { name: 'Modelo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medida' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rejilla' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Válvula' })).toBeInTheDocument();
    expect([...document.querySelectorAll('aside fieldset legend button')].map((button) => button.textContent?.trim())).toEqual([
      'Categoría+',
      'Proveedor+',
      'Modelo+',
      'Medida+',
      'Rejilla+',
      'Válvula+',
    ]);
    expect(screen.queryByRole('button', { name: 'Color' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Textura' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Orientación' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Familia de acabado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acabado' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Modelo' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Stone 3D/ }));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /Stone 3D/ })).toBeChecked());
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
    expect(screen.getByRole('link', { name: 'Volver a AREA LRMQ' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Volver a la página principal' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Saltar a resultados' })).toHaveAttribute('href', '#catalog-results');
    expect(screen.getByRole('region', { name: 'Resultados' })).toHaveAttribute('tabindex', '-1');
  });
});
