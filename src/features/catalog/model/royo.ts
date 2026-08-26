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
  return suppliers.length === 1
    && categories.length === 1
    && isRoyoFurnitureScope({ supplierId: suppliers[0], categoryId: categories[0] });
}
