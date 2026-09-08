/* Controlled test fixtures that mirror the observed public Duplach contract (contract-notes.md).
 * They are test doubles, not production data. */

const ASSET_BASE_URL = 'https://assets.example/catalogo';

export const duplachConfigFixture = {
  catalog_version: 'test',
  api_contract_version: 'catalog-api-v1',
  asset_base_url: ASSET_BASE_URL,
  source_catalog_base_url: ASSET_BASE_URL,
  database_ready_for_public_api: true,
};

export const duplachListFacetsFixture = {
  items: [],
  pagination: { limit: 24, offset: 0, total: 8 },
  sort: { applied: 'name_asc', supported: ['name_asc'] },
  facets: {
    model: [
      { value: 'duplach-stone-plus', label: 'Stone Plus', count: 1 },
      { value: 'duplach-stone-zeus', label: 'Stone Zeus', count: 1 },
      { value: 'duplach-stone-3d', label: 'Stone 3D', count: 1 },
    ],
    texture: [{ value: 'Liso', label: 'Liso', count: 2 }, { value: 'Pizarra', label: 'Pizarra', count: 3 }],
    color: [{ value: 'Antracita', label: 'Antracita', count: 3 }, { value: 'Blanco', label: 'Blanco', count: 3 }],
    grille: [{ value: 'Acero inoxidable', label: 'Acero inoxidable', count: 2 }, { value: 'Color', label: 'Color', count: 2 }],
    valve: [{ value: 'Sifón', label: 'Sifón', count: 3 }],
    orientation: [{ value: 'Derecha', label: 'Derecha', count: 1 }],
    finish_family: [{ value: 'maderas-naturales', label: 'Maderas naturales', count: 1 }],
    measure: [{ value: '70x70', label: '70x70', count: 3 }],
    finish: [{ value: 'Roble', label: 'Roble', count: 1 }],
  },
};

function plusVariant(index: number, measure: string, texture: string, color: string, grille: string, imagePath: string) {
  const [width, length] = measure.split('x');
  return {
    id: `duplach-stone-plus--v${String(index).padStart(5, '0')}`,
    label: `Stone Plus · ${measure} · ${texture} · ${color} · ${grille}`,
    measure,
    dimension: measure,
    finish: color,
    images: [],
    image_mapping_status: 'not_imported',
    sort_order: index,
    variant_key: `measure=${measure}|texture=${texture}|color=${color}|grille=${grille}`,
    attributes: {
      color,
      color_code: color === 'Antracita' ? 'RAL 7011' : 'RAL 9003',
      grille,
      measure,
      texture,
      width_cm: Number(width),
      length_cm: Number(length),
      model_key: 'stone-plus',
      no_prices: true,
      image_path: imagePath,
      valve_type: 'Sifón',
      valve_flow_l_min: 42,
      valve_diameter_mm: 90,
    },
  };
}

export function duplachStonePlusFixture() {
  return {
    id: 'duplach-stone-plus',
    name: 'Stone Plus',
    slug: 'duplach-stone-plus',
    brand: 'Duplach',
    supplier_id: 'duplach',
    supplier_name: 'Duplach',
    category_id: 'platos-de-ducha',
    category_name: 'Platos de ducha',
    subcategory: 'Platos de ducha de resina',
    collection: 'Stone',
    show_price: false,
    configuration_fields: ['measure', 'texture', 'color', 'grille'],
    available_finishes: ['Antracita', 'Blanco'],
    available_measures: ['70x70', '100x100'],
    min_price_eur: null,
    max_price_eur: null,
    description: 'Plato de ducha Stone Plus.',
    images: [
      { alt: 'Stone Plus · portada', url: `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/cover.webp`, path: 'images/duplach_platos/stone-plus/cover.webp', role: 'main', sort_order: 1 },
      { alt: 'Stone Plus · galería', url: `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/gallery-1.webp`, path: 'images/duplach_platos/stone-plus/gallery-1.webp', role: 'gallery', sort_order: 2 },
      { alt: 'Stone Plus · galería', url: `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/gallery-2.webp`, path: 'images/duplach_platos/stone-plus/gallery-2.webp', role: 'gallery', sort_order: 3 },
    ],
    main_image_url: `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/cover.webp`,
    specs: {
      selector_type: 'color',
      colors: ['Antracita', 'Blanco'],
      textures: ['Liso', 'Pizarra'],
      grille_options: ['Acero inoxidable', 'Color'],
      orientation_options: [],
      no_prices: true,
      model_key: 'stone-plus',
      color_image_map: {
        Antracita: ['images/duplach_platos/stone-plus/gallery-1.webp'],
        Blanco: ['images/duplach_platos/stone-plus/cover.webp'],
      },
      selection_image_map: {
        'Liso:Antracita': ['images/duplach_platos/stone-plus/gallery-1.webp'],
        'Liso:Blanco': [],
      },
      valve: { type: 'Sifón', flow_l_min: 42, diameter_mm: 90 },
    },
    variants: [
      plusVariant(1, '70x70', 'Liso', 'Antracita', 'Acero inoxidable', 'images/duplach_platos/stone-plus/gallery-1.webp'),
      plusVariant(2, '70x70', 'Liso', 'Blanco', 'Acero inoxidable', 'images/duplach_platos/stone-plus/cover.webp'),
      plusVariant(3, '70x70', 'Pizarra', 'Antracita', 'Color', 'images/duplach_platos/stone-plus/gallery-2.webp'),
      plusVariant(4, '100x100', 'Pizarra', 'Antracita', 'Acero inoxidable', 'images/duplach_platos/stone-plus/gallery-2.webp'),
      plusVariant(5, '100x100', 'Pizarra', 'Blanco', 'Color', 'images/duplach_platos/stone-plus/gallery-2.webp'),
    ],
    commercial_offers: [],
  };
}

function threeDVariant(index: number, measure: string, familyKey: string, familyName: string, finish: string) {
  const swatch = `images/duplach_platos/stone-3d/swatches/${familyKey}/duplach-stone-3d-${familyKey}-${finish.toLocaleLowerCase().replace(/\s+/g, '-')}.webp`;
  const [width, length] = measure.split('x');
  return {
    id: `duplach-stone-3d--v${String(index).padStart(5, '0')}`,
    label: `Stone 3D · ${measure} · ${familyName} · ${finish}`,
    measure,
    dimension: measure,
    finish,
    images: [],
    image_mapping_status: 'not_imported',
    sort_order: index,
    variant_key: `measure=${measure}|family=${familyKey}|finish=${finish}`,
    attributes: {
      finish,
      finish_family: familyKey,
      finish_family_name: familyName,
      finish_image_path: swatch,
      image_path: swatch,
      grille: 'Rejilla impresa',
      measure,
      width_cm: Number(width),
      length_cm: Number(length),
      model_key: 'stone-3d',
      no_prices: true,
      valve_type: 'Sifón',
      valve_flow_l_min: 42,
      valve_diameter_mm: 90,
    },
  };
}

export function duplachStone3dFixture() {
  return {
    id: 'duplach-stone-3d',
    name: 'Stone 3D',
    slug: 'duplach-stone-3d',
    brand: 'Duplach',
    supplier_id: 'duplach',
    supplier_name: 'Duplach',
    category_id: 'platos-de-ducha',
    category_name: 'Platos de ducha',
    subcategory: 'Platos de ducha de resina',
    collection: 'Stone',
    show_price: false,
    configuration_fields: ['measure', 'finish_family', 'finish'],
    available_finishes: ['Roble', 'Olivo', 'Cemento 01'],
    available_measures: ['70x70'],
    description: 'Plato de ducha Stone 3D.',
    images: [
      { alt: 'Stone 3D · portada', url: `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/cover.webp`, path: 'images/duplach_platos/stone-3d/cover.webp', role: 'main', sort_order: 1 },
      { alt: 'Stone 3D · galería', url: `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/gallery-1.webp`, path: 'images/duplach_platos/stone-3d/gallery-1.webp', role: 'gallery', sort_order: 2 },
    ],
    main_image_url: `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/cover.webp`,
    specs: {
      selector_type: 'finish_family',
      no_prices: true,
      model_key: 'stone-3d',
      colors: [],
      textures: [],
      finish_names: ['Roble', 'Olivo', 'Cemento 01'],
      finish_families: [
        {
          key: 'maderas-naturales',
          name: 'Maderas naturales',
          demo_images: [
            'images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp',
            'images/duplach_platos/stone-3d/maderas-naturales/demo-2.webp',
          ],
          finish_count: 2,
        },
        {
          key: 'cementos-metales-oxidos',
          name: 'Cementos, metales y óxidos',
          demo_images: ['images/duplach_platos/stone-3d/cementos-metales-oxidos/demo-1.webp'],
          finish_count: 1,
        },
      ],
      family_image_map: {
        'maderas-naturales': [
          'images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp',
          'images/duplach_platos/stone-3d/maderas-naturales/demo-2.webp',
        ],
        'cementos-metales-oxidos': ['images/duplach_platos/stone-3d/cementos-metales-oxidos/demo-1.webp'],
      },
      finish_image_map: {
        'maderas-naturales:Roble': ['images/duplach_platos/stone-3d/swatches/maderas-naturales/duplach-stone-3d-maderas-naturales-roble.webp'],
        'maderas-naturales:Olivo': ['images/duplach_platos/stone-3d/swatches/maderas-naturales/duplach-stone-3d-maderas-naturales-olivo.webp'],
        'cementos-metales-oxidos:Cemento 01': ['images/duplach_platos/stone-3d/swatches/cementos-metales-oxidos/duplach-stone-3d-cementos-metales-oxidos-cemento-01.webp'],
      },
    },
    variants: [
      threeDVariant(1, '70x70', 'maderas-naturales', 'Maderas naturales', 'Roble'),
      threeDVariant(2, '70x70', 'maderas-naturales', 'Maderas naturales', 'Olivo'),
      threeDVariant(3, '70x70', 'cementos-metales-oxidos', 'Cementos, metales y óxidos', 'Cemento 01'),
    ],
    commercial_offers: [],
  };
}
