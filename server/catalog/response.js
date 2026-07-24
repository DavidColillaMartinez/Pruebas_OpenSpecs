export function normalizeCatalogResponseStatus(status, body) {
  if (status !== 200) return status;

  try {
    const parsed = JSON.parse(typeof body === 'string' ? body : body.toString());
    return parsed?.error === 'PRODUCT_NOT_FOUND' ? 404 : status;
  } catch {
    return status;
  }
}
