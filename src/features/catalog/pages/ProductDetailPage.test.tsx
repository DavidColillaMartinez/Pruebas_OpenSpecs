import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import royo from '../api/fixtures/product-detail.royo-alfa-compact-100.json';
import { ProductDetailPage } from './ProductDetailPage';

function renderDetail(slug = 'mt-espejos-alba') {
  return render(
    <MemoryRouter initialEntries={[`/productos/${slug}`]}>
      <Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes>
    </MemoryRouter>
  );
}

function gmeProduct(slug: string) {
  const isBath = slug.includes('banera');
  const isScreen = slug.endsWith('screen');
  const name = slug.endsWith('open') ? 'Open' : slug.endsWith('glass') ? 'Glass' : isScreen ? 'Screen' : 'Basic';
  const productImages = [
    { alt: name, url: `https://assets.example/${slug}-product-1.webp`, role: 'main' },
    { alt: `${name} detalle`, url: `https://assets.example/${slug}-product-2.webp`, role: 'gallery' },
  ];
  const variants = isScreen
    ? [
      { id: `${slug}-cromo-fijo`, finish: 'Cromo', finish_code: 'cr', distribution: 'Fijo', reference: `${name}-CR`, sort_order: 1 },
      { id: `${slug}-negro-fijo`, finish: 'Negro', finish_code: 'ng', distribution: 'Fijo', reference: `${name}-NG`, sort_order: 2 },
    ]
    : isBath
      ? [
        { id: `${slug}-cromo-primary`, finish: 'Cromo', finish_code: 'cr', distribution: '1 fijo + 1 corredera', reference: `${name}-CR-1`, sort_order: 1 },
        { id: `${slug}-cromo-secondary`, finish: 'Cromo', finish_code: 'cr', distribution: 'Free angular', reference: `${name}-CR-FREE`, sort_order: 2 },
        { id: `${slug}-negro-primary`, finish: 'Negro', finish_code: 'ng', distribution: '1 fijo + 1 corredera', reference: `${name}-NG-1`, sort_order: 3 },
        { id: `${slug}-negro-secondary`, finish: 'Negro', finish_code: 'ng', distribution: 'Free angular', reference: `${name}-NG-FREE`, sort_order: 4 },
      ]
      : [
        { id: `${slug}-cromo-primary`, finish: 'Cromo', finish_code: 'cr', distribution: '2 abatibles', reference: `${name}-CR-2`, sort_order: 1, images: [{ alt: name, url: `https://assets.example/${slug}-cromo.webp`, role: 'variant' }] },
        { id: `${slug}-cromo-secondary`, finish: 'Cromo', finish_code: 'cr', distribution: name === 'Glass' ? 'Plegable' : 'Free', reference: `${name}-CR-SECONDARY`, sort_order: 2, images: [{ alt: name, url: `https://assets.example/${slug}-cromo-secondary.webp`, role: 'variant' }] },
        { id: `${slug}-negro-secondary`, finish: 'Negro', finish_code: 'ng', distribution: name === 'Glass' ? 'Plegable' : 'Free', reference: `${name}-NG-SECONDARY`, sort_order: 3, images: [{ alt: name, url: `https://assets.example/${slug}-negro.webp`, role: 'variant' }] },
      ];

  return {
    id: slug,
    name,
    slug,
    supplier_id: 'gme',
    supplier_name: 'GME',
    category_id: 'mamparas',
    category_name: 'Mamparas',
    subcategory: isBath ? 'Mamparas de bañera' : 'Mamparas de ducha',
    images: productImages,
    variants,
    commercial_offers: [],
    available_finishes: ['Cromo', 'Negro'],
    available_measures: [],
    specs: {},
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('ProductDetailPage', () => {
  it('announces loading and then renders the real product content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(alba), { status: 200 })));

    renderDetail();
    expect(screen.getByRole('status')).toHaveTextContent('Cargando producto');
    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Medida' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Acabado' })).toBeInTheDocument();
    expect(screen.queryByText(/\d+[,.]?\d*\s*€/)).not.toBeInTheDocument();
  });

  it('renders a product-specific not-found state for the API 200 error object', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' }), { status: 200 })));

    renderDetail('no-existe-lrmq');
    expect(await screen.findByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toHaveAttribute('href', '/productos');
  });

  it('allows retry after a recoverable error', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response(JSON.stringify(alba), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    renderDetail();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('renders a distinct controlled state for an invalid product contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'missing-required-fields' }), { status: 200 })));

    renderDetail();
    expect(await screen.findByRole('alert')).toHaveTextContent('La respuesta del producto no tiene una estructura válida.');
  });

  it('switches to an image supplied by the selected variant', async () => {
    const variantImage = 'https://assets.example/alfa-azul.webp';
    const response = {
      ...royo,
      commercial_offers: [],
      variants: royo.variants.map((variant) => variant.finish === 'Azul Ocean'
        ? { ...variant, images: [{ alt: royo.name, url: variantImage, role: 'variant' }] }
        : variant),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail(royo.slug);
    expect(await screen.findByRole('heading', { name: royo.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Azul Ocean' }));

    await waitFor(() => expect(screen.getByRole('img', { name: /Azul Ocean.*imagen principal/ })).toHaveAttribute('src', variantImage));
  });

  it('keeps the Manillons Torrent model gallery when the selected finish changes', async () => {
    const response = {
      ...alba,
      images: [
        { alt: 'Alba', url: 'https://assets.example/mt26-esp-alba-i01.webp', role: 'main', sort_order: 1 },
        { alt: 'Alba', url: 'https://assets.example/mt26-esp-alba-i02.webp', role: 'gallery', sort_order: 2 },
      ],
      variants: alba.variants.map((variant, index) => ({ ...variant, finish: index === 0 ? 'Terracota' : 'Azul atlántico' })),
      available_finishes: ['Terracota', 'Azul atlántico'],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', response.images[0].url);
    fireEvent.click(screen.getByRole('button', { name: 'Azul atlántico' }));

    await waitFor(() => expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', response.images[0].url));
    expect(screen.getAllByRole('button', { name: /Ver imagen/ })).toHaveLength(2);
  });

  it.each([
    ['gme-mamparas-ducha-open', 'Free'],
    ['gme-mamparas-ducha-glass', 'Plegable'],
  ])('switches the shower gallery to the selected API variant image for %s', async (slug, distribution) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(gmeProduct(slug)), { status: 200 })));

    renderDetail(slug);
    expect(await screen.findByRole('heading', { name: slug.endsWith('open') ? 'Open' : 'Glass' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: distribution }));

    await waitFor(() => expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', `https://assets.example/${slug}-cromo-secondary.webp`));
  });

  it.each([
    'gme-mamparas-banera-basic',
    'gme-mamparas-banera-screen',
  ])('keeps the complete product gallery for bath variants without images: %s', async (slug) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(gmeProduct(slug)), { status: 200 })));

    renderDetail(slug);
    expect(await screen.findByRole('heading', { name: slug.endsWith('screen') ? 'Screen' : 'Basic' })).toBeInTheDocument();
    const productImage = `https://assets.example/${slug}-product-1.webp`;
    expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', productImage);
    if (slug.endsWith('basic')) fireEvent.click(screen.getByRole('button', { name: 'Free angular' }));
    fireEvent.click(screen.getByRole('button', { name: 'Negro' }));

    await waitFor(() => expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', productImage));
    expect(screen.getAllByRole('button', { name: /Ver imagen/ })).toHaveLength(2);
  });
});
