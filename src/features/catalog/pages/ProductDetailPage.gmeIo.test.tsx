import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from './ProductDetailPage';

const ioDetail = {
  id: 'gme-testio',
  name: 'Testio',
  slug: 'gme-testio',
  supplier_id: 'gme',
  supplier_name: 'GME',
  category_id: 'griferia',
  category_name: 'Grifería',
  main_image_url: 'https://assets.test/covers/testio/cover.webp',
  images: [
    { url: 'https://assets.test/gallery/testio/cromo.webp' },
    { url: 'https://assets.test/gallery/testio/negro.webp' },
  ],
  specs: {
    gme_io_2026: true,
    finish_options: [
      { value: 'cromo', name: 'Cromo', selector_image_url: 'https://assets.test/faucets/testio/cromo.webp' },
      { value: 'negro', name: 'Negro', selector_image_url: 'https://assets.test/faucets/testio/negro.webp' },
    ],
  },
  variants: [
    { id: 'testio-bajo-cromo', attributes: { tap_type: 'lavabo_bajo', finish: 'Cromo' }, images: [{ url: 'https://assets.test/gallery/testio/cromo.webp' }] },
    { id: 'testio-bajo-negro', attributes: { tap_type: 'lavabo_bajo', finish: 'Negro' }, images: [{ url: 'https://assets.test/gallery/testio/negro.webp' }] },
    { id: 'testio-alto-cromo', attributes: { tap_type: 'lavabo_alto', finish: 'Cromo' }, images: [{ url: 'https://assets.test/gallery/testio/cromo.webp' }] },
  ],
};

function stubFetch() {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/catalog/products/gme-testio')) {
      return Promise.resolve(new Response(JSON.stringify(ioDetail), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ items: [], pagination: { limit: 24, offset: 0, total: 0, has_more: false }, facets: {}, sort: { supported: [] } }), { status: 200 }));
  }));
}

function mainImage() {
  return screen.getByRole('img', { name: /imagen principal/i }) as HTMLImageElement;
}

describe('ProductDetailPage GME IO gallery behavior', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens on the cover, keeps selector swatches out of the gallery and follows manual finish changes', async () => {
    stubFetch();
    render(<MemoryRouter initialEntries={['/productos/gme-testio']}><Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes></MemoryRouter>);

    await waitFor(() => expect(mainImage().src).toContain('/covers/testio/cover.webp'));
    const galleryUrls = new Set(screen.getAllByRole('img').map((image) => (image as HTMLImageElement).src));
    expect(galleryUrls.has('https://assets.test/faucets/testio/cromo.webp')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Negro' }));
    await waitFor(() => expect(mainImage().src).toContain('/gallery/testio/negro.webp'));

    // Tap-type changes never hijack the active photo.
    fireEvent.click(screen.getByRole('button', { name: 'Grifo alto' }));
    expect(mainImage().src).toContain('/gallery/testio/negro.webp');
  });

  it('renders large finish swatches with visible names and keeps photos when finish has none', async () => {
    stubFetch();
    const noPhotoDetail = {
      ...ioDetail,
      variants: ioDetail.variants.map((variant) => variant.id === 'testio-bajo-negro' ? { ...variant, images: [] } : variant),
      specs: { ...ioDetail.specs, finish_image_urls: undefined },
    };
    vi.stubGlobal('fetch', vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/catalog/products/gme-testio')) {
        return Promise.resolve(new Response(JSON.stringify(noPhotoDetail), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ items: [], pagination: { limit: 24, offset: 0, total: 0, has_more: false }, facets: {}, sort: { supported: [] } }), { status: 200 }));
    }));
    render(<MemoryRouter initialEntries={['/productos/gme-testio']}><Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes></MemoryRouter>);

    const negroButton = await screen.findByRole('button', { name: 'Negro' });
    expect(negroButton.querySelector('img')).not.toBeNull();
    const cromoButton = screen.getByRole('button', { name: 'Cromo' });
    expect(cromoButton).toBeInTheDocument();

    await waitFor(() => expect(mainImage().src).toContain('/covers/testio/cover.webp'));
    fireEvent.click(negroButton);
    await waitFor(() => {
      // Negro has no large photo: the cover must remain active.
      expect(mainImage().src).toContain('/covers/testio/cover.webp');
    });
  });
});
