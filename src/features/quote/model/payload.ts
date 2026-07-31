import { buildVariantSnapshot, type SelectableUnit } from '../../catalog/model/selection';
import type { ProductDetail } from '../../catalog/model/types';
import type { QuoteRequestItem, QuoteRequestPayload } from './types';

const IDENTIFIER_PATTERN = /^[A-Za-z0-9._:-]+$/;

export function buildQuoteRequestItem(product: ProductDetail, unit: SelectableUnit | null, quantity: number, notes?: string): QuoteRequestItem {
  const snapshot = buildVariantSnapshot(unit);
  const reference = typeof snapshot?.reference === 'string' ? snapshot.reference : undefined;
  const selectedAttributes = snapshot
    ? Object.fromEntries(Object.entries(snapshot).filter(([key]) => key !== 'reference')) as Record<string, string | number | boolean>
    : undefined;

  return {
    productId: product.id,
    ...(unit?.variantId ? { variantId: unit.variantId } : {}),
    ...(unit?.commercialOfferVariantId ? { commercialOfferVariantId: unit.commercialOfferVariantId } : {}),
    ...(reference ? { reference } : {}),
    quantity,
    productName: product.name,
    ...(selectedAttributes && Object.keys(selectedAttributes).length > 0 ? { selectedAttributes } : {}),
    ...(snapshot && Object.keys(snapshot).length > 0 ? { variantSnapshot: snapshot } : {}),
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
  };
}

export function validateQuoteRequest(payload: QuoteRequestPayload): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!payload.customerName.trim() || payload.customerName.length > 200) errors.customerName = 'El nombre es obligatorio y no puede superar 200 caracteres.';
  if (payload.phone && payload.phone.length > 80) errors.phone = 'El teléfono no puede superar 80 caracteres.';
  if (payload.email && payload.email.length > 320) errors.email = 'El email no puede superar 320 caracteres.';
  if (payload.renovationType && payload.renovationType.length > 120) errors.renovationType = 'El tipo de reforma no puede superar 120 caracteres.';
  if (payload.message && payload.message.length > 5000) errors.message = 'El mensaje no puede superar 5000 caracteres.';
  if (payload.sourcePage && payload.sourcePage.length > 500) errors.sourcePage = 'La ruta de origen no puede superar 500 caracteres.';
  if (!payload.phone?.trim() && !payload.email?.trim()) errors.contact = 'Indica un email o un teléfono.';
  if (payload.consentPrivacy !== true) errors.consentPrivacy = 'Debes aceptar la política de privacidad.';
  if (payload.website) errors.website = 'Solicitud no válida.';
  if (payload.items.length < 1 || payload.items.length > 50) errors.items = 'La solicitud debe contener entre 1 y 50 artículos.';

  payload.items.forEach((item, index) => {
    const prefix = `items.${index}`;
    if (!IDENTIFIER_PATTERN.test(item.productId)) errors[`${prefix}.productId`] = 'Identificador de producto no válido.';
    if (item.variantId && !IDENTIFIER_PATTERN.test(item.variantId)) errors[`${prefix}.variantId`] = 'Identificador de variante no válido.';
    if (item.commercialOfferVariantId && !IDENTIFIER_PATTERN.test(item.commercialOfferVariantId)) errors[`${prefix}.commercialOfferVariantId`] = 'Identificador de oferta no válido.';
    if (!item.variantId && !item.commercialOfferVariantId) errors[`${prefix}.variantId`] = 'La variante completa es obligatoria.';
    if (!item.reference?.trim()) errors[`${prefix}.reference`] = 'La referencia de la variante es obligatoria.';
    if (!item.selectedAttributes || Object.keys(item.selectedAttributes).length === 0) errors[`${prefix}.selectedAttributes`] = 'La selección de atributos es obligatoria.';
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) errors[`${prefix}.quantity`] = 'La cantidad debe estar entre 1 y 999.';
    if (!item.productName.trim() || item.productName.length > 300) errors[`${prefix}.productName`] = 'El nombre del producto es obligatorio y no puede superar 300 caracteres.';
    if (item.notes && item.notes.length > 2000) errors[`${prefix}.notes`] = 'Las notas no pueden superar 2000 caracteres.';
    if (item.selectedAttributes && Object.keys(item.selectedAttributes).some((key) => /(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i.test(key))) errors[`${prefix}.selectedAttributes`] = 'La selección contiene campos no públicos.';
  });

  if (JSON.stringify(payload).length > 65536) errors.payload = 'La solicitud supera el tamaño permitido.';
  return errors;
}
