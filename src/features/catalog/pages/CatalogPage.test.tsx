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
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('limit=96')) {
        return Promise.resolve(new Response(JSON.stringify({
          items: [],
          facets: { category: [{ value: 'mirrors', label: 'Espejos', count: 0 }] },
        }), { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      return Promise.resolve(new Response(JSON.stringify({
        items: [],
        pagination: { limit: 24, offset: 0, total: 0 },
        facets: { category: [{ value: 'mirrors', label: 'Espejos', count: 0 }] },
        sort: { supported: ['relevance'] },
      }), { status: 200, headers: { 'content-type': 'application/json' } }));
    }));

    render(<MemoryRouter initialEntries={['/productos?search=alba&category=mirrors']}><CatalogPage /></MemoryRouter>);

    expect(await screen.findByText('No hay coincidencias')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Espejos' })).toBeChecked();
    expect(screen.getByRole('option', { name: /Nombre A-Z/ })).toBeDisabled();
    expect(screen.getByRole('option', { name: /Más recientes/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Espejos/ }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Espejos/ })).not.toBeInTheDocument());
  });
});
