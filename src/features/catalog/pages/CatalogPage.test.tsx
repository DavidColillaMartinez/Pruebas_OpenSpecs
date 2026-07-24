import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getByRole('checkbox', { name: 'Espejos' })).toBeChecked();
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
    expect(screen.getByRole('checkbox', { name: 'Espejos' })).toBeInTheDocument();
  });
});
