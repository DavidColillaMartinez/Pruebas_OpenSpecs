import type { ProductDetail } from './types';

// Editorial summaries of the eleven published IO kitchen models, checked
// against their public descriptions. Technical copy and commercial data stay
// in the catalogue API; this module is not a second product inventory.
const KITCHEN_COPY: Record<string, { model: string; description: string }> = {
  'gme-cocina-alexia-abatible': {
    model: 'Alexia abatible',
    description: 'Grifo de cocina Alexia abatible IO by GME, en cromo, con apertura en frío y aireador Neoperl. Consulta el modelo y pide presupuesto en AREA LRMQ.',
  },
  'gme-cocina-dior': {
    model: 'Dior',
    description: 'Grifo de cocina Dior IO by GME, en cromo, con aireador de cascada y apertura en frío. Consulta características y pide presupuesto en AREA LRMQ.',
  },
  'gme-cocina-extraible-design': {
    model: 'Extraíble Design',
    description: 'Grifo de cocina Extraíble Design IO by GME, en cromo, con aireador Neoperl y apertura en frío. Descubre sus características y pide presupuesto.',
  },
  'gme-cocina-extraible-round': {
    model: 'Extraíble Round',
    description: 'Grifo de cocina Extraíble Round IO by GME, con salida de dos funciones y varios acabados. Consulta opciones y pide presupuesto en AREA LRMQ.',
  },
  'gme-cocina-extraible-silver': {
    model: 'Extraíble Silver',
    description: 'Grifo de cocina Extraíble Silver IO by GME, en cromo y con salida de dos funciones. Consulta características y pide presupuesto en AREA LRMQ.',
  },
  'gme-cocina-noah': {
    model: 'Noah',
    description: 'Grifo de cocina Noah IO by GME, de acero inoxidable 304 y con apertura en frío. Consulta sus acabados y pide presupuesto en AREA LRMQ.',
  },
  'gme-cocina-osmosis-acero': {
    model: 'Osmosis Acero',
    description: 'Grifo de cocina Osmosis Acero IO by GME, de acero inoxidable cepillado. No se declara equipo de filtración incluido. Consulta y pide presupuesto.',
  },
  'gme-cocina-osmosis-extraible': {
    model: 'Osmosis Extraíble',
    description: 'Grifo de cocina Osmosis Extraíble IO by GME, con sistema extraíble. No se declara equipo de filtración incluido. Consulta acabados y presupuesto.',
  },
  'gme-cocina-quadra': {
    model: 'Quadra',
    description: 'Grifo de cocina Quadra IO by GME, en cromo o acero cepillado y con aireador Neoperl. Consulta sus características y pide presupuesto en AREA LRMQ.',
  },
  'gme-cocina-round': {
    model: 'Round',
    description: 'Grifo de cocina Round IO by GME, en cromo o acero cepillado y con apertura en frío. Consulta sus características y pide presupuesto en AREA LRMQ.',
  },
  'gme-cocina-silver': {
    model: 'Silver',
    description: 'Grifo de cocina Silver IO by GME, modelo en acabado cromo, con apertura en frío y aireador Neoperl. Consulta características y pide presupuesto.',
  },
};

export function getKitchenSeo(product: ProductDetail) {
  if (product.supplierId !== 'gme' || product.categoryId !== 'griferia'
    || !Object.hasOwn(KITCHEN_COPY, product.slug)) return null;
  const copy = KITCHEN_COPY[product.slug];
  // Use the published cover, not a transient selected finish or a swatch.
  const cover = product.mainImageUrl || product.images.find(image => image.role === 'main')?.url || product.images[0]?.url;
  let imageUrl: string | undefined;
  try {
    const url = new URL(cover || '');
    if (url.protocol === 'https:' && url.hostname === 'assets.colilladavid.es'
      && url.pathname.startsWith('/proyectos/lrmq/catalogo/')) imageUrl = url.href;
  } catch { /* Missing or invalid image: keep the site-level social fallback. */ }
  return {
    title: `Grifo de cocina ${copy.model} IO by GME · AREA LRMQ`,
    description: copy.description,
    ...(imageUrl ? { imageUrl, imageAlt: product.name } : {}),
  };
}

export function buildKitchenStructuredData(product: ProductDetail) {
  const seo = getKitchenSeo(product);
  if (!seo) return null;
  const origin = 'https://arealrmq.es';
  const url = `${origin}/productos/${encodeURIComponent(product.slug)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product', '@id': `${url}#product`, url,
        name: product.name,
        description: product.description || seo.description,
        ...(seo.imageUrl ? { image: seo.imageUrl } : {}),
        ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
        category: product.subcategory || product.categoryName,
        // Parent model identity; never label the whole model with one finish SKU.
        identifier: product.id,
      },
      {
        '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${origin}/productos` },
          { '@type': 'ListItem', position: 3, name: product.name, item: url },
        ],
      },
    ],
  };
}
