import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCatalogDiscovery } from './useCatalogDiscovery';

function Harness() {
  const discovery = useCatalogDiscovery();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <input aria-label="Buscar" value={discovery.searchInput} onChange={(event) => discovery.setSearchInput(event.target.value)} />
      <button type="button" onClick={() => discovery.setFilter('category', 'cat-a', true)}>Aplicar categoría</button>
      <button type="button" onClick={() => discovery.setFilter('category', 'espejos', false)}>Quitar Espejos</button>
      <button type="button" onClick={() => navigate(-1)}>Atrás</button>
      <button type="button" onClick={() => navigate(1)}>Adelante</button>
      <button type="button" onClick={discovery.retry}>Reintentar</button>
      <output data-testid="url">{location.search}</output>
      <output data-testid="count">{discovery.data.items.length}</output>
      <output data-testid="titles">{discovery.data.items.map((item) => item.collection || item.model || item.name).join('|')}</output>
      <output data-testid="page">{discovery.data.loadedPage}</output>
      <output data-testid="additional-error">{discovery.data.additionalError || ''}</output>
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useCatalogDiscovery', () => {
  it('rebuilds only the URL-requested chunks and deduplicates IDs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      const isSecondPage = url.includes('offset=24');
      return Promise.resolve(new Response(JSON.stringify({
        items: isSecondPage
          ? [{ id: 'two', name: 'Dos', slug: 'dos', images: [] }, { id: 'one', name: 'Duplicado', slug: 'one', images: [] }]
          : [{ id: 'one', name: 'Uno', slug: 'one', images: [] }],
        pagination: { limit: 24, offset: isSecondPage ? 24 : 0, total: 48 },
        facets: { categories: [{ value: 'cat-a', label: 'Categoría A', count: 2 }] },
        sort: { supported: ['relevance'] },
      }), { status: 200 }));
    }));

    render(<MemoryRouter initialEntries={['/productos?category=cat-a&page=2']}><Harness /></MemoryRouter>);

    await waitFor(() => expect(screen.getByTestId('page')).toHaveTextContent('2'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('url')).toHaveTextContent('category=cat-a&page=2');
  });

  it('debounces search and resets the page in the URL', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      items: [], pagination: { limit: 24, offset: 0, total: 0 }, facets: {}, sort: { supported: ['relevance'] },
    }), { status: 200 }))));

    render(<MemoryRouter initialEntries={['/productos?category=cat-a&page=3']}><Harness /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar' }), { target: { value: 'alba' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('url')).toHaveTextContent('search=alba');
    expect(screen.getByTestId('url')).toHaveTextContent('category=cat-a');
    expect(screen.getByTestId('url')).not.toHaveTextContent('page=3');
  });

  it('restores previous URL criteria with browser Back and retries a later chunk', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('offset=24')) return Promise.resolve(new Response(JSON.stringify({
        items: [{ id: 'two', name: 'Dos', slug: 'dos', images: [] }],
        pagination: { limit: 24, offset: 24, total: 48 }, facets: {}, sort: { supported: ['relevance'] },
      }), { status: 200 }));
      return Promise.resolve(new Response(JSON.stringify({
        items: [{ id: 'one', name: 'Uno', slug: 'uno', images: [] }],
        pagination: { limit: 24, offset: 0, total: 48 }, facets: {}, sort: { supported: ['relevance'] },
      }), { status: 200 }));
    }));

    render(<MemoryRouter initialEntries={['/productos']}><Harness /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('page')).toHaveTextContent('1'));
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar categoría' }));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('category=cat-a'));
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }));
    await waitFor(() => expect(screen.getByTestId('url')).not.toHaveTextContent('category=cat-a'));
    fireEvent.click(screen.getByRole('button', { name: 'Adelante' }));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('category=cat-a'));
  });

  it('keeps earlier items when a later chunk fails and retries only that chunk', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const isSecondPage = url.includes('offset=24');
      if (isSecondPage) {
        return Promise.reject(new Error('offline'));
      }
      return Promise.resolve(new Response(JSON.stringify({
        items: [{ id: 'one', name: 'Uno', slug: 'uno', images: [] }],
        pagination: { limit: 24, offset: 0, total: 48 }, facets: {}, sort: { supported: ['relevance'] },
      }), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryRouter initialEntries={['/productos?page=2']}><Harness /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('additional-error')).toHaveTextContent('No se pudo conectar'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    fetchMock.mockImplementation((url: string) => {
      const isSecondPage = url.includes('offset=24');
      return Promise.resolve(new Response(JSON.stringify({
        items: [{ id: isSecondPage ? 'two' : 'one', name: isSecondPage ? 'Dos' : 'Uno', slug: isSecondPage ? 'dos' : 'uno', images: [] }],
        pagination: { limit: 24, offset: isSecondPage ? 24 : 0, total: 48 }, facets: {}, sort: { supported: ['relevance'] },
      }), { status: 200 }));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
  });

  it('clears Espejos dependent URL criteria when its last activator is removed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: {
        category: [{ value: 'espejos', label: 'Espejos', count: 1 }],
        supplier: [{ value: 'manillons-torrent', label: 'Manillons Torrent', count: 1 }],
        subcategory: [{ value: 'Circular', label: 'Circular', count: 1 }],
        collection: [{ value: 'Alba', label: 'Alba', count: 1 }],
        shape: [{ value: 'Circular', label: 'Circular', count: 1 }],
        has_led: [{ value: 'false', label: 'No', count: 1 }],
        lighting_type: [{ value: 'Sin luz', label: 'Sin luz', count: 1 }],
        finish: [{ value: 'Terracota', label: 'Terracota', count: 1 }],
      },
      sort: { supported: ['relevance'] },
    }), { status: 200 })));

    render(<MemoryRouter initialEntries={['/productos?category=espejos&shape=Circular']}><Harness /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('shape=Circular'));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Espejos' }));

    await waitFor(() => expect(screen.getByTestId('url')).not.toHaveTextContent('shape=Circular'));
    expect(screen.getByTestId('url')).not.toHaveTextContent('category=espejos');
  });

  it('sorts Royo furniture by the visible model title and keeps other suppliers by name', async () => {
    const royoFacets = {
      category: [{ value: 'muebles-y-lavabos', label: 'Muebles y lavabos', count: 3 }],
      supplier: [{ value: 'royo', label: 'Royo', count: 3 }],
      modularity: [{ value: 'modular', label: 'Modular', count: 3 }],
      collection: [{ value: 'Beta', label: 'Beta', count: 1 }, { value: 'Zeta', label: 'Zeta', count: 1 }],
      subcategory: [{ value: 'Muebles modulares', label: 'Muebles modulares', count: 3 }],
      finish: [{ value: 'Nogal', label: 'Nogal', count: 3 }],
      measure: [{ value: '80', label: '80', count: 3 }],
      product_kind: [{ value: 'configurable_product', label: 'Configurable', count: 3 }],
    };
    const royoItems = [
      { id: 'beta', name: 'Zeta interno', slug: 'beta', supplier_id: 'royo', category_id: 'muebles-y-lavabos', collection: 'Beta' },
      { id: 'zeta', name: 'Alfa interno', slug: 'zeta', supplier_id: 'royo', category_id: 'muebles-y-lavabos', collection: 'Zeta' },
      { id: 'gamma', name: 'Gamma interno', slug: 'gamma', supplier_id: 'royo', category_id: 'muebles-y-lavabos' },
    ];
    let applied: 'name_asc' | 'name_desc' = 'name_asc';
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      items: royoItems,
      pagination: { limit: 24, offset: 0, total: 3 },
      facets: royoFacets,
      sort: { supported: ['name_asc', 'name_desc', 'relevance'], applied },
    }), { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);

    const asc = render(<MemoryRouter initialEntries={['/productos?category=muebles-y-lavabos&sort=name_asc']}><Harness /></MemoryRouter>);
    await waitFor(() => expect(asc.getByTestId('count')).toHaveTextContent('3'));
    expect(asc.getByTestId('titles')).toHaveTextContent('Beta|Gamma interno|Zeta');

    asc.unmount();
    applied = 'name_desc';
    const desc = render(<MemoryRouter initialEntries={['/productos?category=muebles-y-lavabos&sort=name_desc']}><Harness /></MemoryRouter>);
    await waitFor(() => expect(desc.getByTestId('count')).toHaveTextContent('3'));
    expect(desc.getByTestId('titles')).toHaveTextContent('Zeta|Gamma interno|Beta');

    desc.unmount();
    const gmeItems = [
      { id: 'zeta', name: 'Zeta', slug: 'zeta', supplier_id: 'gme', category_id: 'mamparas' },
      { id: 'alfa', name: 'Alfa', slug: 'alfa', supplier_id: 'gme', category_id: 'mamparas' },
    ];
    fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      items: gmeItems,
      pagination: { limit: 24, offset: 0, total: 2 },
      facets: { category: [{ value: 'mamparas', label: 'Mamparas', count: 2 }], supplier: [{ value: 'gme', label: 'GME', count: 2 }], finish: [{ value: 'Cromo', label: 'Cromo', count: 2 }], measure: [{ value: '100', label: '100', count: 2 }] },
      sort: { supported: ['name_asc', 'name_desc', 'relevance'], applied: 'name_asc' },
    }), { status: 200 })));
    const gme = render(<MemoryRouter initialEntries={['/productos?category=mamparas&sort=name_asc']}><Harness /></MemoryRouter>);
    await waitFor(() => expect(gme.getByTestId('count')).toHaveTextContent('2'));
    expect(gme.getByTestId('titles')).toHaveTextContent('Alfa|Zeta');
  });

});
