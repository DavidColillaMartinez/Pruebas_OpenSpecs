export const ROYO_SUPPLIER_ID = 'royo';
export const ROYO_FURNITURE_CATEGORY_ID = 'muebles-y-lavabos';

export type CatalogModularity = 'modular' | 'normal';

export function isRoyoFurnitureScope(value: { supplierId?: unknown; categoryId?: unknown }): boolean {
  return String(value.supplierId || '').trim().toLocaleLowerCase() === ROYO_SUPPLIER_ID
    && String(value.categoryId || '').trim().toLocaleLowerCase() === ROYO_FURNITURE_CATEGORY_ID;
}

export function isCatalogRoyoFurnitureScope(filters: { supplier?: string[]; category?: string[] }): boolean {
  const suppliers = filters.supplier || [];
  const categories = filters.category || [];
  const category = String(categories[0] || '').trim().toLocaleLowerCase();
  const supplier = String(suppliers[0] || '').trim().toLocaleLowerCase();
  return suppliers.length <= 1
    && categories.length === 1
    && category === ROYO_FURNITURE_CATEGORY_ID
    && (suppliers.length === 0 || supplier === ROYO_SUPPLIER_ID);
}
