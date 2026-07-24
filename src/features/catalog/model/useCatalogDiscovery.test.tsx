import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCatalogDiscovery } from './useCatalogDiscovery';

function Harness() {
  const discovery = useCatalogDiscovery();
  const location = useLocation();
  return (
    <>
      <input aria-label="Buscar" value={discovery.searchInput} onChange={(event) => discovery.setSearchInput(event.target.value)} />
      <button type="button" onClick={() => discovery.setFilter('category', 'cat-a', true)}>Aplicar categoría</button>
      <output data-testid="url">{location.search}</output>
      <output data-testid="count">{discovery.data.items.length}</output>
      <output data-testid="page">{discovery.data.loadedPage}</output>
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
});
