import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogPage } from './CatalogPage';

afterEach(() => vi.unstubAllGlobals());

describe('CatalogPage', () => {
  it('renders links from the public product list response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [{
        id: 'mt-espejos-alba',
        name: 'Alba',
        slug: 'mt-espejos-alba',
        brand: 'Manillons Torrent',
        images: [],
        show_price: false,
      }],
      pagination: { limit: 24, offset: 0, total: 1 },
    }), { status: 200 })));

    render(<MemoryRouter><CatalogPage /></MemoryRouter>);

    expect(await screen.findByRole('link', { name: /Alba/ })).toHaveAttribute('href', '/productos/mt-espejos-alba');
  });

  it('renders a recoverable error when the list request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<MemoryRouter><CatalogPage /></MemoryRouter>);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('renders active URL criteria, dynamic counts and honest disabled sorts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [],
      pagination: { limit: 24, offset: 0, total: 0 },
      facets: { categories: [{ value: 'mirrors', label: 'Espejos', count: 0 }] },
      sort: { supported: ['relevance'] },
    }), { status: 200 })));

    render(<MemoryRouter initialEntries={['/productos?search=alba&category=mirrors']}><CatalogPage /></MemoryRouter>);

    expect(await screen.findByText('No hay coincidencias')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Espejos' })).toBeChecked();
    expect(screen.getByRole('option', { name: /Nombre A-Z/ })).toBeDisabled();
    expect(screen.getByRole('option', { name: /Más recientes/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Espejos/ }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Espejos/ })).not.toBeInTheDocument());
  });
});
