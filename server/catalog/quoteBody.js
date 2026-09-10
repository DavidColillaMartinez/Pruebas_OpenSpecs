const IDENTIFIER_PATTERN = /^[A-Za-z0-9._:-]+$/;
const REQUEST_BODY_KEYS = Object.freeze([
  'customerName', 'phone', 'email', 'renovationType', 'message', 'sourcePage', 'consentPrivacy', 'items',
]);
const FORBIDDEN_ATTRIBUTE_KEY_PATTERN = /(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i;
const MAX_ATTRIBUTE_VALUE_LENGTH = 300;

function isPlanObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isJsonContentType(contentType) {
  return typeof contentType === 'string' && /^(?:application\/(?:[\w.+-]+\+)?json)\s*(?:;|$)/.test(contentType.trim());
}

function checkItem(item, index, errors) {
  const prefix = `items.${index}`;
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    errors.push(`${prefix}.productId`);
    return;
  }
  const allowedKeys = [
    'productId', 'variantId', 'commercialOfferVariantId', 'reference', 'quantity', 'productName',
    'supplier', 'category', 'imageUrl', 'selectedAttributes', 'variantSnapshot', 'notes',
  ];
  if (Object.keys(item).some((key) => !allowedKeys.includes(key))) errors.push(`${prefix}.productId`);

  if (typeof item.productId !== 'string' || item.productId.length === 0 || item.productId.length > 128 || !IDENTIFIER_PATTERN.test(item.productId)) errors.push(`${prefix}.productId`);
  if (item.variantId !== undefined && (typeof item.variantId !== 'string' || item.variantId.length === 0 || item.variantId.length > 128 || !IDENTIFIER_PATTERN.test(item.variantId))) errors.push(`${prefix}.variantId`);
  if (item.commercialOfferVariantId !== undefined && (typeof item.commercialOfferVariantId !== 'string' || item.commercialOfferVariantId.length === 0 || item.commercialOfferVariantId.length > 128 || !IDENTIFIER_PATTERN.test(item.commercialOfferVariantId))) errors.push(`${prefix}.commercialOfferVariantId`);
  if (item.reference !== undefined && (typeof item.reference !== 'string' || item.reference.length > 128 || !IDENTIFIER_PATTERN.test(item.reference))) errors.push(`${prefix}.reference`);

  const compactDuplach = typeof item.productId === 'string'
    && item.productId.toLocaleLowerCase().startsWith('duplach-')
    && item.variantSnapshot && Object.keys(item.variantSnapshot).length > 0;
  if (!compactDuplach && item.variantId === undefined && item.commercialOfferVariantId === undefined) errors.push(`${prefix}.variantId`);

  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) errors.push(`${prefix}.quantity`);
  if (typeof item.productName !== 'string' || item.productName.trim().length === 0 || item.productName.length > 300) errors.push(`${prefix}.productName`);
  if (typeof item.supplier !== 'string' || item.supplier.trim().length === 0 || item.supplier.length > 300) errors.push(`${prefix}.supplier`);
  if (typeof item.category !== 'string' || item.category.trim().length === 0 || item.category.length > 300) errors.push(`${prefix}.category`);
  if (item.notes !== undefined && (typeof item.notes !== 'string' || item.notes.length > 2000)) errors.push(`${prefix}.notes`);
  if (item.imageUrl !== undefined && (typeof item.imageUrl !== 'string' || item.imageUrl.length > 2048)) errors.push(`${prefix}.imageUrl`);

  for (const attributeName of ['selectedAttributes', 'variantSnapshot']) {
    const attributeRecord = item[attributeName];
    if (attributeRecord === undefined) continue;
    if (!isPlanObject(attributeRecord)) {
      errors.push(`${prefix}.${attributeName}`);
      continue;
    }
    for (const [key, value] of Object.entries(attributeRecord)) {
      if (/[^a-zA-Z0-9_ ]/.test(key) || key.length > 40 || FORBIDDEN_ATTRIBUTE_KEY_PATTERN.test(key)) {
        errors.push(`${prefix}.${attributeName}`);
        break;
      }
      const valueType = typeof value;
      if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') {
        errors.push(`${prefix}.${attributeName}`);
        break;
      }
      if (valueType === 'string' && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
        errors.push(`${prefix}.${attributeName}`);
        break;
      }
    }
  }
}

export function quoteValidationErrors(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('payload');
    return errors;
  }
  if (Object.keys(body).some((key) => !REQUEST_BODY_KEYS.includes(key))) errors.push('payload');
  if (typeof body.customerName !== 'string' || body.customerName.trim().length === 0 || body.customerName.length > 200) errors.push('customerName');
  if (body.phone !== undefined && (typeof body.phone !== 'string' || body.phone.length > 80)) errors.push('phone');
  if (body.email !== undefined && (typeof body.email !== 'string' || body.email.length > 320)) errors.push('email');
  if (body.renovationType !== undefined && (typeof body.renovationType !== 'string' || body.renovationType.length > 120)) errors.push('renovationType');
  if (body.message !== undefined && (typeof body.message !== 'string' || body.message.length > 5000)) errors.push('message');
  if (body.sourcePage !== undefined && (typeof body.sourcePage !== 'string' || body.sourcePage.length > 500)) errors.push('sourcePage');
  if (body.consentPrivacy !== true) errors.push('consentPrivacy');
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) errors.push('items');
  else body.items.forEach((item, index) => checkItem(item, index, errors));
  return errors;
}

