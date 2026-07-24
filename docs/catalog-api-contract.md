# Catalog Contract Notes

## Discovery Contract Proposal

This is the client-side contract proposal for the existing public `GET /api/catalog/products` route. It is not an assertion that the current n8n workflow already supports every field. Backend tasks remain gated by the publication audit and owner approval.

### Request

The browser stays on the relative route and may send:

- `search` once;
- repeated URL values for `category`, `supplier`, `subcategory`, `collection`, `product_kind`, `finish` and `measure`; the current upstream mapping sends the stable category/supplier values as repeated `category_id`/`supplier_id` parameters;
- `sort` only when declared by the response;
- `include_facets=1` on the first request for a query signature and `include_facets=0` for later chunks;
- `limit=24` and an `offset` derived from the URL page.

Within a dimension, repeated values are intended to use OR semantics. Different dimensions are intended to use AND semantics. This remains a contract gate until verified against the live GET workflow.

The current live workflow does not yet satisfy that proposal: repeated `category_id` values currently use the first value, and the response does not include `facets` or `sort` metadata. The UI therefore does not claim server-side multi-select or sorting until an approved backend contract exists.

### Response Extension

The preferred extension preserves the existing four route handlers and adds optional metadata to the list response:

```json
{
  "items": [],
  "pagination": { "limit": 24, "offset": 0, "total": 190 },
  "facets": {
    "category": [{ "value": "espejos", "label": "Espejos", "count": 44 }],
    "supplier": [{ "value": "royo", "label": "Royo", "count": 84 }]
  },
  "sort": {
    "applied": "name_asc",
    "supported": ["relevance", "name_asc", "name_desc"]
  }
}
```

Each facet count must be calculated over the filtered public universe, with a documented rule for whether the dimension's own selection is excluded from its count. The browser may derive a facet only after it has loaded the complete filtered universe as a documented temporary fallback; it must never derive counts from one page. The current client keeps a facet cache per query signature, requests the public pages with `limit=60`, and exposes no options until that complete request succeeds. This fallback is intentionally replaceable by response `facets`.

`recent`, `new` and `best_selling` stay disabled until reliable date, editorial or sales fields are proven. `featured_order` is not part of this change.

The client implementation normalizes unknown facet dimensions and sort values away, keeps technical fields out of presentation models, repeats array query parameters, and preserves `/api/catalog/products` as the only list route.

These notes are based on the verified public responses for:

- `mt-espejos-alba`
- `royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17`

The browser receives normalized data through `/api/catalog/products/:slug`. The raw upstream response is not rendered directly.

## Product Detail Mapping

Mapped public fields:

- Identity: `id`, `name`, `slug`, `brand`, `supplier_name`, `supplier_id`.
- Classification: `category_id`, `category_name`, `subcategory`, `collection`, `product_kind`.
- Content: `description`, `specs`, `show_price`.
- Media: `images[].alt`, `images[].url`, `images[].role`, `images[].width`, `images[].height`, `images[].sort_order`.
- Variants: `variants[].id`, `reference`, `dimension`, `finish`, `finish_code`, `attributes`, `sort_order`, and optional variant images when the API provides `images`, `image`, `image_url` or `image_path`.
- Commercial offers: `commercial_offers[].id`, `offer_type`, `sort_order`, and their public variant references/finish fields.
- Availability: `available_finishes`, `available_measures`, `configuration_fields`, `publication_status`.

The application deliberately omits `search_text`, `source_page`, `component_refs`, `quality_status`, image processing status, and other technical fields from the presentation model and quote snapshot.

## Selection

The selector uses real product variants or commercial offer variants. It does not create attribute combinations that are absent from the API. The initial unit is the first complete unit in API order because the verified responses do not expose a confirmed default flag.

## Images

Absolute image URLs are preserved. Relative paths are resolved only with the public `asset_base_url` from config. List cards use the verified `main_image_url` fallback when the list response does not include an `images` array. A selected unit uses its normalized variant images only when they exist; otherwise the gallery keeps the product-level images. The current verified detail fixtures do not provide variant-specific images, so no image is inferred from a finish code.

## Quote Payload

The application sends one item for the current product selection through `/api/catalog/quote-requests`:

```json
{
  "customerName": "...",
  "email": "...",
  "consentPrivacy": true,
  "website": "",
  "sourcePage": "/productos/slug",
  "items": [
    {
      "productId": "...",
      "variantId": "...",
      "quantity": 1,
      "productName": "...",
      "variantSnapshot": { "reference": "..." }
    }
  ]
}
```

The payload is built from the canonical fields in the implementation context, validated before sending, and never logged or stored.
