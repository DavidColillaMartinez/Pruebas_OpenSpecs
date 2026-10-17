import type { ProductDetail } from './types';
import { getSelectableUnits, selectInitialUnit, type SelectableUnit } from './selection';
import { findCompleteDuplachUnit, getCompactDuplachOptions, getDuplachSelectorModel } from './duplach';

export const DUPLACH_OPTION_ORDER = ['measure', 'texture', 'color', 'grille', 'valve', 'orientation', 'finish_family', 'finish'];

// The selector and its parent must start with the same selection on both sides
// of hydration, rather than waiting for the selector's notification effect.
export function getInitialDuplachSelection(product: ProductDetail): { selection: Record<string, string>; unit: SelectableUnit | null } {
  const units = getSelectableUnits(product);
  const model = getDuplachSelectorModel(product);
  const keys = model.configurationKeys.filter((key) => DUPLACH_OPTION_ORDER.includes(key));
  const compact = units.length === 0 && keys.some((key) => model.compactOptions[key]?.length);
  const initialUnit = selectInitialUnit(units);
  let selection: Record<string, string>;
  if (compact) {
    const measure = model.compactOptions.measure?.[0];
    selection = model.familyFirst ? (measure ? { measure } : {}) : Object.fromEntries(keys
      .map((key) => [key, getCompactDuplachOptions(model, {}, key)[0]] as const)
      .filter((entry): entry is [string, string] => Boolean(entry[1])));
  } else if (!initialUnit) selection = {};
  else if (model.familyFirst) selection = initialUnit.attributes.measure ? { measure: initialUnit.attributes.measure } : {};
  else selection = Object.fromEntries(keys.map((key) => [key, initialUnit.attributes[key]] as const)
    .filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== ''));

  const unit = !compact ? findCompleteDuplachUnit(units, selection, keys)
    : keys.some((key) => !selection[key]) ? null
      : { productId: product.id, quantity: 1, productName: product.name, variantSnapshot: { ...selection }, attributes: { ...selection }, sourceOrder: 0 };
  return { selection, unit };
}
