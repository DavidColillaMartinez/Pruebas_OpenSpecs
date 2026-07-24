import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const listResponse = {
  items: [{
    id: 'mt-espejos-alba',
    name: 'Alba',
    slug: 'mt-espejos-alba',
    brand: 'Manillons Torrent',
    main_image_url: 'https://assets.example/alba.webp',
    show_price: false,
  }],
  pagination: { limit: 24, total: 1, offset: 0 },
  facets: {},
  sort: { supported: [] },
};

const detailResponse = {
  id: 'mt-espejos-alba',
  name: 'Alba',
  slug: 'mt-espejos-alba',
  brand: 'Manillons Torrent',
  images: [],
  variants: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.pushState({}, '', '/');
});

describe('application routing', () => {
  it('opens the direct detail route and recovers via back navigation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      const body = String(url).includes('/products/mt-espejos-alba') ? detailResponse : listResponse;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }));
    window.history.pushState({}, '', '/productos/mt-espejos-alba');

    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();

    window.history.pushState({}, '', '/productos');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument());
  });

  it('renders the controlled fallback for an unknown application route', () => {
    window.history.pushState({}, '', '/ruta-inexistente');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
