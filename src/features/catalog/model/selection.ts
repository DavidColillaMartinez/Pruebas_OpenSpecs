import type { ProductDetail, ProductImage, ProductVariant, SelectedProductUnit, VariantSnapshot } from './types';

type SelectableUnit = SelectedProductUnit & {
  attributes: Record<string, string>;
  images?: ProductImage[];
  sourceOrder: number;
};

function variantAttributes(variant: ProductVariant): Record<string, string> {
  return Object.fromEntries(
    Object.entries({
      dimension: variant.dimension,
      finish: variant.finish,
      version: variant.version,
      distribution: variant.distribution,
      finishCode: variant.finishCode,
      ...variant.attributes,
    }).filter(([key, value]) => typeof value === 'string' && value.length > 0 && !/(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i.test(key))
  ) as Record<string, string>;
}

export function getSelectableUnits(product: ProductDetail): SelectableUnit[] {
  const units = product.variants.map((variant, index) => ({
    productId: product.id,
    variantId: variant.id,
    quantity: 1,
    productName: product.name,
    variantSnapshot: {
      reference: variant.reference,
      dimension: variant.dimension,
      finish: variant.finish,
      version: variant.version,
      has_led: variant.hasLed ?? product.hasLed,
      lighting_type: variant.lightingType ?? product.lightingType,
      lighting_technology: variant.lightingTechnology ?? product.lightingTechnology,
      light_temp: variant.lightTemp ?? product.lightTemp,
      distribution: variant.distribution,
      finishCode: variant.finishCode,
      ...variant.attributes,
    } satisfies VariantSnapshot,
    attributes: variantAttributes(variant),
    images: variant.images,
    sourceOrder: variant.sortOrder ?? index,
  }));

  const offerUnits = product.commercialOffers.flatMap((offer) => offer.variants.map((offerVariant, index) => {
    const matchedVariant = product.variants.find((variant) => variant.finishCode && variant.finishCode === offerVariant.finishCode);
    return {
      productId: product.id,
      variantId: matchedVariant?.id,
      commercialOfferVariantId: offerVariant.id,
      quantity: 1,
      productName: product.name,
       variantSnapshot: {
        reference: offerVariant.reference,
        finish: offerVariant.finishName,
        finishCode: offerVariant.finishCode,
        offer: offer.offerType,
      } satisfies VariantSnapshot,
      attributes: {
        finish: offerVariant.finishName || '',
        finishCode: offerVariant.finishCode || '',
        offer: offer.offerType || '',
      },
      images: offerVariant.images?.length ? offerVariant.images : offer.images?.length ? offer.images : matchedVariant?.images,
      sourceOrder: (offer.sortOrder ?? 0) * 1000 + (index + 1),
    };
  }));

  return isGmeEnclosureProduct(product) ? units : offerUnits.length > 0 ? offerUnits : units;
}

export function selectInitialUnit(units: SelectableUnit[]): SelectableUnit | null {
  return [...units].sort((a, b) => a.sourceOrder - b.sourceOrder)[0] ?? null;
}

export function selectInitialEnclosureUnit(units: SelectableUnit[]): SelectableUnit | null {
  return selectInitialUnit(units.filter((unit) => unit.attributes.finish?.toLocaleLowerCase() !== 'aluminio'));
}

export function getAttributeOptions(units: SelectableUnit[], current: Record<string, string>, configurationFields?: string[]): Record<string, string[]> {
  const configuredKeys = configurationFields?.filter((key) => ['dimension', 'finish', 'version'].includes(key));
  const keys = (configuredKeys?.length ? configuredKeys : ['dimension', 'finish', 'version'])
    .filter((key) => units.some((unit) => unit.attributes[key]));
  const visibleKeys = keys;
  const selectionKeys = Object.keys(current).filter((key) => key !== 'finishCode' || !keys.includes('finish'));
  return Object.fromEntries(visibleKeys.map((key) => {
    const options = [...new Set(units
      .filter((unit) => selectionKeys.every((selectedKey) => selectedKey === key || unit.attributes[selectedKey] === current[selectedKey]))
      .map((unit) => unit.attributes[key])
      .filter(Boolean))];
    return [key, options];
  }));
}

export function selectCompatibleUnit(units: SelectableUnit[], selection: Record<string, string>, changedKey?: string): SelectableUnit | null {
  const exact = findMatchingUnit(units, selection);
  if (exact) return exact;
  const changedValue = changedKey ? selection[changedKey] : undefined;
  const candidates = changedKey && changedValue
    ? units.filter((unit) => unit.attributes[changedKey] === changedValue)
    : units;
  const preserved = candidates.filter((unit) => Object.entries(selection)
    .filter(([key]) => key !== changedKey)
    .every(([key, value]) => unit.attributes[key] === value));
  return [...(preserved.length > 0 ? preserved : candidates)].sort((a, b) => a.sourceOrder - b.sourceOrder)[0] || null;
}

export function isGmeEnclosureProduct(product: ProductDetail): boolean {
  const supplier = `${product.supplierId || ''} ${product.supplierName || ''}`.toLocaleLowerCase();
  const category = `${product.categoryId || ''} ${product.categoryName || ''}`.toLocaleLowerCase();
  return supplier.includes('gme') && category.includes('mamparas');
}

export function getEnclosureAttributeOptions(units: SelectableUnit[], current: Record<string, string>): Record<string, string[]> {
  const finishes = [...new Set(units
    .map((unit) => unit.attributes.finish)
    .filter((finish): finish is string => Boolean(finish) && finish.toLocaleLowerCase() !== 'aluminio'))];
  const activeFinish = current.finish || units[0]?.attributes.finish;
  const distributions = [...new Set(units
    .filter((unit) => unit.attributes.finish === activeFinish)
    .map((unit) => unit.attributes.distribution)
    .filter((distribution): distribution is string => Boolean(distribution)))];

  return {
    finish: finishes,
    distribution: distributions,
  };
}

export function selectEnclosureFinish(units: SelectableUnit[], current: Record<string, string>, finish: string): SelectableUnit | null {
  if (finish.toLocaleLowerCase() === 'aluminio') return null;
  const compatible = current.distribution
    ? [...units]
      .filter((unit) => unit.attributes.finish === finish && unit.attributes.distribution === current.distribution)
      .sort((a, b) => a.sourceOrder - b.sourceOrder)[0]
    : null;
  return compatible || [...units]
    .filter((unit) => unit.attributes.finish === finish)
    .sort((a, b) => a.sourceOrder - b.sourceOrder)[0] || null;
}

export function findEnclosureUnit(units: SelectableUnit[], finish?: string, distribution?: string): SelectableUnit | null {
  if (!finish || !distribution) return null;
  return [...units]
    .filter((unit) => unit.attributes.finish === finish && unit.attributes.distribution === distribution)
    .sort((a, b) => a.sourceOrder - b.sourceOrder)[0] || null;
}

export function findMatchingUnit(units: SelectableUnit[], selection: Record<string, string>): SelectableUnit | null {
  return units.find((unit) => Object.entries(selection).every(([key, value]) => unit.attributes[key] === value)) ?? null;
}

export function buildVariantSnapshot(unit: SelectableUnit | null): VariantSnapshot | undefined {
  if (!unit) return undefined;
  return Object.fromEntries(Object.entries(unit.variantSnapshot || {}).filter(([key, value]) => value !== undefined && value !== '' && !/(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i.test(key)));
}

export function isManillonsMirrorProduct(product: ProductDetail): boolean {
  return product.supplierId?.toLocaleLowerCase() === 'manillons-torrent' && product.categoryId?.toLocaleLowerCase() === 'espejos';
}

export type { SelectableUnit };
