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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [], pagination: { limit: 24, offset: 0, total: 0 }, facets: {}, sort: { supported: ['relevance'] },
    }), { status: 200 })));

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
});
