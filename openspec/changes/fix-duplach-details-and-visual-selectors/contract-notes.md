# Duplach contract inspection (task 1.1)

Observed 2026-09-08 against the live public detail webhook used by the existing proxy
(`GET {N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL}/products/:slug`), read-only.

## `specs.selector_images.colors[]` (conventional models)

- Present for all 7 conventional models (`stone-zeus`, `stone-plus`, `stone-smart`, `stone-mio`, `stone-side`, `stone-sorty`, `stone-cach`) as `{ colors: [...] }`.
- Each model publishes exactly 18 color entries; every entry has `name`, `code` and `filename` (0 missing in all 7 models).
- The 18 swatch `name` values match the 18 distinct `variants[].attributes.color` values exactly (0 colors without a swatch, 0 extra swatches).
- Every swatch `code` equals the matching variant `attributes.color_code` (0 divergences); code-based matching is therefore only a tolerance fallback.
- `filename` is a relative path under `images/duplach_platos/<model>/swatches/...`; it must be resolved exclusively with `asset_base_url` from `/api/catalog/config`.
- Entries also carry technical fields (`sha256`, `output_size`, `source_page`, `source_xref`). The presentation model must keep only `name`/`code`/`filename` and must never leak the rest into the UI.
- Stone 3D: `selector_images` is an empty object; its visual selector is driven by `finish_image_map`, not by color swatches.

## Stone 3D family/finish maps

- `configuration_fields = ["measure","finish_family","finish"]`; 42 measures; 7 `finish_families`.
- `family_image_map` has the same 7 family keys; union of `family_image_map` demo paths equals the union of `finish_families[].demo_images` (same 12 unique demo files; per-family array order can differ).
- `finish_image_map` is keyed `familyKey:Finish` and covers all 106 real `finish_family:finish` variant pairs (0 pairs without a published swatch).
- `product.images` already arrives as API cover first + all published demos (13 images; `gallery_image_paths[0]` is the cover), so the initial complete gallery is `product.images`.

## Consequences for this change

- Conventional color swatches MUST come from `selector_images.colors[].filename`; `color_image_map` remains gallery/product imagery and is not a swatch source.
- The initial Stone 3D gallery is `product.images` (cover + every family demo); after a family is selected the main gallery is that family's demos only.
- Open question resolved: all published entries have `filename`, and no model publishes swatch codes that differ from variant color names.
