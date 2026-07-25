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
      finishCode: variant.finishCode,
      ...variant.attributes,
    }).filter(([, value]) => typeof value === 'string' && value.length > 0)
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

  return offerUnits.length > 0 ? offerUnits : units;
}

export function selectInitialUnit(units: SelectableUnit[]): SelectableUnit | null {
  return [...units].sort((a, b) => a.sourceOrder - b.sourceOrder)[0] ?? null;
}

export function getAttributeOptions(units: SelectableUnit[], current: Record<string, string>): Record<string, string[]> {
  const keys = [...new Set(units.flatMap((unit) => Object.keys(unit.attributes)))];
  const visibleKeys = keys.filter((key) => key !== 'finishCode' || !keys.includes('finish'));
  const selectionKeys = Object.keys(current).filter((key) => key !== 'finishCode' || !keys.includes('finish'));
  return Object.fromEntries(visibleKeys.map((key) => {
    const options = [...new Set(units
      .filter((unit) => selectionKeys.every((selectedKey) => selectedKey === key || unit.attributes[selectedKey] === current[selectedKey]))
      .map((unit) => unit.attributes[key])
      .filter(Boolean))];
    return [key, options];
  }));
}

export function findMatchingUnit(units: SelectableUnit[], selection: Record<string, string>): SelectableUnit | null {
  return units.find((unit) => Object.entries(selection).every(([key, value]) => unit.attributes[key] === value)) ?? null;
}

export function buildVariantSnapshot(unit: SelectableUnit | null): VariantSnapshot | undefined {
  if (!unit) return undefined;
  return Object.fromEntries(Object.entries(unit.variantSnapshot || {}).filter(([, value]) => value !== undefined && value !== ''));
}

export type { SelectableUnit };
