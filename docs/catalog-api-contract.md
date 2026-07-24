# Catalog Contract Notes

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
- Variants: `variants[].id`, `reference`, `dimension`, `finish`, `finish_code`, `attributes`, `sort_order`.
- Commercial offers: `commercial_offers[].id`, `offer_type`, `sort_order`, and their public variant references/finish fields.
- Availability: `available_finishes`, `available_measures`, `configuration_fields`, `publication_status`.

The application deliberately omits `search_text`, `source_page`, `component_refs`, `quality_status`, image processing status, and other technical fields from the presentation model and quote snapshot.

## Selection

The selector uses real product variants or commercial offer variants. It does not create attribute combinations that are absent from the API. The initial unit is the first complete unit in API order because the verified responses do not expose a confirmed default flag.

## Images

Absolute image URLs are preserved. Relative paths are resolved only with the public `asset_base_url` from config. List cards use the verified `main_image_url` fallback when the list response does not include an `images` array.

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
