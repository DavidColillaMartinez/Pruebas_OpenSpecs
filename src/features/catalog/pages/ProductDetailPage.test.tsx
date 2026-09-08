import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import royo from '../api/fixtures/product-detail.royo-alfa-compact-100.json';
import { ProductDetailPage } from './ProductDetailPage';
import { QuoteSelectionProvider, QUOTE_SELECTION_STORAGE_KEY } from '../../quote/model/selectionStore';
import { duplachConfigFixture, duplachStonePlusFixture, duplachStone3dFixture } from '../api/fixtures/duplach-platos-contract';

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

function royoModularProduct() {
  return {
    id: 'royo-modular-logika',
    name: 'Logika',
    slug: 'royo-modular-logika',
    supplier_id: 'royo',
    supplier_name: 'Royo',
    category_id: 'muebles-y-lavabos',
    category_name: 'Muebles y lavabos',
    modularity: 'modular',
    images: [
      { alt: 'Logika', url: 'https://assets.example/logika-cover.webp', role: 'main', sort_order: 1, width: 1799, height: 1149 },
      { alt: 'Logika detalle 1', url: 'https://assets.example/logika-detail-1.webp', role: 'gallery', sort_order: 2 },
      { alt: 'Logika detalle 2', url: 'https://assets.example/logika-detail-2.webp', role: 'gallery', sort_order: 3 },
    ],
    variants: [
      { id: 'logika-blanco', finish: 'Blanco Pure', reference: 'LOG-1', sort_order: 1, images: [{ alt: 'Logika Blanco Pure', url: 'https://assets.example/logika-blanco.webp', role: 'variant' }] },
      { id: 'logika-azul', finish: 'Azul Talco Pure', reference: 'LOG-2', sort_order: 2, images: [{ alt: 'Logika Azul Talco Pure', url: 'https://assets.example/logika-azul.webp', role: 'variant' }] },
    ],
    available_finishes: ['Blanco Pure', 'Azul Talco Pure'],
    available_measures: [],
    configuration_fields: ['finish'],
    specs: {},
    commercial_offers: [],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
});

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

  it('renders direct variant lighting fields and version from the active API variant', async () => {
    const response = {
      ...alba,
      shape: 'Oval',
      has_led: true,
      lighting_type: 'Retroiluminada',
      lighting_technology: 'TRILED',
      configuration_fields: ['dimension', 'version'],
      variants: [{
        ...alba.variants[0],
        version: 'Plus',
        has_led: true,
        lighting_type: 'Retroiluminada',
        lighting_technology: 'TRILED',
        light_temp: '3000/4200/6400 K',
      }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    expect(screen.getByText('TRILED')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('3000/4200/6400 K')).toBeInTheDocument();
      expect(screen.getByText('Plus')).toBeInTheDocument();
    });
  });

  it('keeps public details collapsed by default and expands them on demand', async () => {
    const response = {
      ...alba,
      specs: { 'Tipo de cristal': 'Transparente', 'Perfil': 'Aluminio' },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /Detalles públicos/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const details = document.getElementById('product-details-content');
    expect(details?.tagName).toBe('DIV');
    expect(details).toHaveAttribute('hidden');
    expect(screen.getByText('Transparente')).toBeInTheDocument();
    expect(toggle.querySelector('span')).toHaveTextContent('Detalles públicos');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(details).not.toHaveAttribute('hidden');
    expect(screen.getByText('Aluminio')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(details).toHaveAttribute('hidden');
  });

  it('renders readable public values and never exposes structured objects', async () => {
    const response = {
      ...alba,
      specs: {
        'Tipo de cristal': 'Transparente',
        marcados: ['Clase 2', 'Clase 4'],
        ficha_tecnica: { url: 'https://example.test/ficha.pdf' },
        anidamientos: [{ tipo: 'hueco' }],
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail();
    await screen.findByRole('heading', { name: 'Alba' });
    const toggle = screen.getByRole('button', { name: /Detalles públicos/ });
    fireEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'));

    expect(screen.getByText('Clase 2, Clase 4')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('[object Object]');
    expect(screen.queryByText('https://example.test/ficha.pdf')).toBeNull();
    expect(screen.queryByText('hueco')).toBeNull();
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

  it('keeps the Royo modular cover first on load and exposes the full gallery before a manual shortcut', async () => {
    const response = royoModularProduct();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail(response.slug);

    expect(await screen.findByRole('heading', { name: 'Logika' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', response.images[0].url);
    expect(screen.getAllByRole('button', { name: /Ver imagen/ })).toHaveLength(response.images.length);
    expect(screen.getByRole('region', { name: 'Imágenes del producto' }).querySelector('div[aria-busy]')).toHaveClass('aspect-[1799/1149]');

    fireEvent.click(screen.getByRole('button', { name: 'Azul Talco Pure' }));

    await waitFor(() => expect(screen.getByRole('img', { name: /Azul Talco Pure.*imagen principal/ })).toHaveAttribute('src', 'https://assets.example/logika-azul.webp'));
    expect(screen.getAllByRole('button', { name: /Ver imagen/ })).toHaveLength(response.images.length + 1);
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

  it('adds the exact changed Alba variant to the persistent budget selection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(alba), { status: 200 })));

    render(
      <QuoteSelectionProvider>
        <MemoryRouter initialEntries={['/productos/mt-espejos-alba']}>
          <Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes>
        </MemoryRouter>
      </QuoteSelectionProvider>,
    );
    expect(await screen.findByRole('heading', { name: 'Alba' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Azul atlántico' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al presupuesto' }));

    const stored = JSON.parse(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY) || '[]');
    expect(stored.lines[0]).toMatchObject({ variantId: 'mt-espejos-alba--v0002', reference: '7195', selectedAttributes: { finish: 'Azul atlántico', dimension: 'Ø 60' } });
    expect(screen.getByRole('status')).toHaveTextContent('Añadido al presupuesto.');
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

  it('adds a GME variant to the budget when the API omits its reference', async () => {
    const response = {
      ...gmeProduct('gme-mamparas-ducha-aktual'),
      variants: gmeProduct('gme-mamparas-ducha-aktual').variants.map((variant) => ({ ...variant, reference: undefined })),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    render(
      <QuoteSelectionProvider>
        <MemoryRouter initialEntries={['/productos/gme-mamparas-ducha-aktual']}>
          <Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes>
        </MemoryRouter>
      </QuoteSelectionProvider>,
    );
    expect(await screen.findByRole('heading', { name: 'Basic' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Añadir al presupuesto' })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al presupuesto' }));

    const stored = JSON.parse(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY) || '{}');
    expect(stored.lines[0]).toMatchObject({ productId: 'gme-mamparas-ducha-aktual', variantId: 'gme-mamparas-ducha-aktual-cromo-primary' });
    expect(stored.lines[0].reference).toBeUndefined();
  });

  it('renders Royo modular configuration as information instead of fictional selectors', async () => {
    const response = {
      ...royo,
      modularity: 'modular',
      specs: {
        modular_notice: 'La composición se confirma con el equipo.',
        module_configuration: { module_types: ['Mueble 2 cajones'], measure_options: { 'Mueble 2 cajones': ['60', '80'] }, depths_cm: { standard: 46 } },
      },
      configuration_fields: [],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail(royo.slug);
    expect(await screen.findByRole('heading', { name: royo.name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Configuración del mueble' })).toBeInTheDocument();
    expect(screen.getByText('La composición se confirma con el equipo.')).toBeInTheDocument();
    expect(screen.getByText(/60, 80/)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Medida' })).not.toBeInTheDocument();
  });

  it('disables the budget action when no real Royo variant is available', async () => {
    const response = { ...royo, variants: [], commercial_offers: [], configuration_fields: [] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    renderDetail(royo.slug);
    expect(await screen.findByRole('heading', { name: royo.name })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Añadir al presupuesto' })).toBeDisabled();
  });
  describe('duplach shower trays', () => {
    function stubDuplach(product: unknown) {
      vi.stubGlobal('fetch', vi.fn().mockImplementation((input: unknown) => {
        const url = String(input);
        const body = url.includes('/config') ? duplachConfigFixture : product;
        return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
      }));
    }

    it('renders the official title, server-backed selector and keeps the API cover first on load', async () => {
      stubDuplach(duplachStonePlusFixture());
      renderDetail('duplach-stone-plus');

      expect(await screen.findByRole('heading', { name: 'Stone Plus' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Configura tu plato de ducha' })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Medida' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Textura' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Color' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Rejilla' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', 'https://assets.example/catalogo/images/duplach_platos/stone-plus/cover.webp');
      expect(screen.queryByText(/\d+[,.]?\d*\s*€/)).not.toBeInTheDocument();
    });

    it('promotes the API quick image on a manual change without dropping the gallery', async () => {
      stubDuplach(duplachStonePlusFixture());
      renderDetail('duplach-stone-plus');
      await screen.findByRole('heading', { name: 'Stone Plus' });

      fireEvent.click(screen.getByRole('button', { name: 'Pizarra' }));
      fireEvent.click(screen.getByRole('button', { name: 'Color' }));

      const main = screen.getByRole('img', { name: /imagen principal/ });
      expect(main).toHaveAttribute('src', 'https://assets.example/catalogo/images/duplach_platos/stone-plus/gallery-2.webp');
      const thumbnails = screen.getAllByRole('button', { name: /Ver imagen/ });
      expect(thumbnails).toHaveLength(3);
      expect(thumbnails.some((button) => button.querySelector('img')?.getAttribute('src') === 'https://assets.example/catalogo/images/duplach_platos/stone-plus/cover.webp')).toBe(true);
    });

    it('adds a real duplach variant to the shared budget without price fields and without navigating', async () => {
      stubDuplach(duplachStonePlusFixture());
      render(
        <QuoteSelectionProvider>
          <MemoryRouter initialEntries={['/productos/duplach-stone-plus']}>
            <Routes><Route path="/productos/:slug" element={<ProductDetailPage />} /></Routes>
          </MemoryRouter>
        </QuoteSelectionProvider>,
      );
      await screen.findByRole('heading', { name: 'Stone Plus' });
      await waitFor(() => expect(screen.getByRole('button', { name: 'Añadir al presupuesto' })).not.toBeDisabled());

      fireEvent.click(screen.getByRole('button', { name: 'Añadir al presupuesto' }));
      expect(screen.getByRole('status')).toHaveTextContent('Añadido al presupuesto.');
      expect(screen.getByRole('heading', { name: 'Stone Plus' })).toBeInTheDocument();

      const stored = JSON.parse(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY) || '{}');
      const line = stored.lines[0];
      expect(line).toMatchObject({
        productId: 'duplach-stone-plus',
        variantId: 'duplach-stone-plus--v00001',
        quantity: 1,
        productName: 'Stone Plus',
        supplier: 'Duplach',
        category: 'Platos de ducha',
      });
      expect(line.selectedAttributes).toMatchObject({ measure: '70x70', texture: 'Liso', color: 'Antracita', grille: 'Acero inoxidable' });
      expect(JSON.stringify(line)).not.toMatch(/price|precio|coste|importe/i);
      expect(line.reference).toBeUndefined();
    });

    it('keeps the Stone 3D budget action disabled until a family and a real finish are selected', async () => {
      stubDuplach(duplachStone3dFixture());
      renderDetail('duplach-stone-3d');
      await screen.findByRole('heading', { name: 'Stone 3D' });

      expect(screen.getByRole('button', { name: 'Añadir al presupuesto' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Maderas naturales' }));
      expect(screen.getByRole('button', { name: 'Añadir al presupuesto' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Roble' }));
      expect(screen.getByRole('button', { name: 'Añadir al presupuesto' })).toBeEnabled();
    });

    it('shows the cover plus all family demos initially and scopes the main gallery to the selected family', async () => {
      stubDuplach(duplachStone3dFixture());
      renderDetail('duplach-stone-3d');
      await screen.findByRole('heading', { name: 'Stone 3D' });

      const main = screen.getByRole('img', { name: /imagen principal/ });
      expect(main).toHaveAttribute('src', 'https://assets.example/catalogo/images/duplach_platos/stone-3d/cover.webp');
      const thumbnailSrcs = () => screen.getAllByRole('button', { name: /Ver imagen/ }).map((button) => button.querySelector('img')?.getAttribute('src'));
      expect(thumbnailSrcs()).toEqual([
        'https://assets.example/catalogo/images/duplach_platos/stone-3d/cover.webp',
        'https://assets.example/catalogo/images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp',
        'https://assets.example/catalogo/images/duplach_platos/stone-3d/maderas-naturales/demo-2.webp',
        'https://assets.example/catalogo/images/duplach_platos/stone-3d/cementos-metales-oxidos/demo-1.webp',
      ]);
      expect(screen.queryByText(/Imágenes de demostración/)).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: 'Maderas naturales' }));
      expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', 'https://assets.example/catalogo/images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp');
      expect(thumbnailSrcs()).toEqual([
        'https://assets.example/catalogo/images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp',
        'https://assets.example/catalogo/images/duplach_platos/stone-3d/maderas-naturales/demo-2.webp',
      ]);

      fireEvent.click(screen.getByRole('button', { name: 'Cementos, metales y óxidos' }));
      expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', 'https://assets.example/catalogo/images/duplach_platos/stone-3d/cementos-metales-oxidos/demo-1.webp');
      expect(screen.queryAllByRole('button', { name: /Ver imagen/ })).toHaveLength(0);
    });

    it('never inserts finish or color swatches into the main gallery, including after enlargement', async () => {
      stubDuplach(duplachStone3dFixture());
      renderDetail('duplach-stone-3d');
      await screen.findByRole('heading', { name: 'Stone 3D' });

      fireEvent.click(screen.getByRole('button', { name: 'Maderas naturales' }));
      const roble = within(screen.getByRole('group', { name: 'Acabado' })).getByRole('button', { name: 'Roble' });
      fireEvent.click(roble);
      const gallerySrcs = () => Array.from(document.querySelectorAll('section[aria-labelledby="product-gallery-heading"] img')).map((img) => img.getAttribute('src') ?? '');
      expect(gallerySrcs().some((src) => src.includes('/swatches/'))).toBe(false);

      fireEvent.click(roble);
      expect(roble).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', 'https://assets.example/catalogo/images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp');
      expect(gallerySrcs().some((src) => src.includes('/swatches/'))).toBe(false);
    });

    it('keeps conventional color swatch enlargement out of the main gallery', async () => {
      stubDuplach(duplachStonePlusFixture());
      renderDetail('duplach-stone-plus');
      await screen.findByRole('heading', { name: 'Stone Plus' });
      const blanco = within(screen.getByRole('group', { name: 'Color' })).getByRole('button', { name: 'Blanco' });
      fireEvent.click(blanco);
      fireEvent.click(blanco);
      expect(blanco).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('img', { name: /imagen principal/ })).toHaveAttribute('src', 'https://assets.example/catalogo/images/duplach_platos/stone-plus/cover.webp');
      const gallerySrcs = () => Array.from(document.querySelectorAll('section[aria-labelledby="product-gallery-heading"] img')).map((img) => img.getAttribute('src') ?? '');
      expect(gallerySrcs().filter((src) => src.includes('/swatches/'))).toEqual([]);
    });

    it('toggling public details keeps the selected variant, gallery and budget state', async () => {
      stubDuplach(duplachStonePlusFixture());
      renderDetail('duplach-stone-plus');
      await screen.findByRole('heading', { name: 'Stone Plus' });

      fireEvent.click(within(screen.getByRole('group', { name: 'Textura' })).getByRole('button', { name: 'Pizarra' }));
      fireEvent.click(within(screen.getByRole('group', { name: 'Rejilla' })).getByRole('button', { name: 'Color' }));
      const selectionBefore = screen.getByText(/^Selección:/).textContent;
      const galleryBefore = Array.from(document.querySelectorAll('#product-content img')).map((img) => img.getAttribute('src'));
      const toggle = screen.getByRole('button', { name: /Detalles públicos/ });

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      expect(screen.getByText(/^Selección:/).textContent).toBe(selectionBefore);
      expect(Array.from(document.querySelectorAll('#product-content img')).map((img) => img.getAttribute('src'))).toEqual(galleryBefore);
      expect(screen.getByRole('button', { name: 'Añadir al presupuesto' })).toBeEnabled();
    });
  });
});
