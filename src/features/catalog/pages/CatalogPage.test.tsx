import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
