# Product Detail Validation

## External Contract Checks

| Check | Status | Evidence |
| --- | --- | --- |
| Public catalog config | PASS | Inspected active response and verified through `/api/catalog/config` proxy |
| Public catalog list | PASS | Inspected active response and verified through `/api/catalog/products` proxy |
| Existing product detail | PASS | Verified `mt-espejos-alba` and the Royo Alfa Compact slug |
| Product not found upstream | PASS WITH UPSTREAM DEFECT | n8n returns `200 PRODUCT_NOT_FOUND`; public proxy normalizes to `404` |
| Quote POST contract | PASS BY INSPECTION | Active workflow confirms `201`, `400 VALIDATION_ERROR`, and `429 RATE_LIMITED`; no production POST was sent |

## Required Owner Confirmation

These items remain explicitly pending and are not treated as complete:

- Actual production hosting provider.
- Final public domain.
- Public privacy-policy URL.
- Final consent link.
- Rewrite behavior on the real hosting provider.
- Definitive public `sourcePage` value after domain/hosting confirmation.

The repository is technically prepared for Vercel through `vercel.json` and `api/catalog/[...path].js`, but Vercel is not confirmed as the production provider.

## Matrix

| State | Result |
| --- | --- |
| Loading, loaded, no variants, one variant, multiple variants | PASS in implementation/tests |
| Variant without own images, no images, optional fields absent, documents absent | PASS with product-image fallback and conditional sections |
| Public not-found, network, `5xx`, invalid `200` contract | PASS in proxy/client/page tests |
| Quote pending, created, `400`, `429`, network failure | PASS in intercepted form tests |
| Real hosting reload, final domain, privacy URL, consent link, definitive `sourcePage` | PENDING OWNER CONFIRMATION |
