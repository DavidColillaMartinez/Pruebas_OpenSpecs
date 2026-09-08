# Duplach Public API Contract Notes (task 1.1)

Observed 2026-09-08 against the live public endpoints used by the existing proxy:

- List: `GET {N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL}/products`
- Detail: `GET {N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL}/products/:slug`
- Config: `GET {N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL}/config` → `asset_base_url = https://assets.colilladavid.es/proyectos/lrmq/catalogo`

## Scope

- `supplier_id=duplach` + `category_id=platos-de-ducha` returns exactly 8 products with IDs `duplach-stone-zeus`, `duplach-stone-plus`, `duplach-stone-smart`, `duplach-stone-mio`, `duplach-stone-side`, `duplach-stone-sorty`, `duplach-stone-cach`, `duplach-stone-3d`.
- Official names arrive in `name` (e.g. `Stone Cach`). Titles are taken from `name`; no heuristics needed.

## Server-side filter parameters (verified)

| Filter | Parameter | Value space | Verified |
| --- | --- | --- | --- |
| Model | `model` | product IDs (`duplach-stone-plus`) | Yes, only with supplier/category scope; a display label (`Stone Plus`) returns 0 |
| Measure | `measure` | `"{width}x{length}"` (e.g. `70x70`) | Yes |
| Texture | `texture` | `Liso`, `Piedra`, `Pizarra` | Yes |
| Color | `color` | 18 names (Blanco…Océano) | Yes |
| Grille | `grille` | `Acero inoxidable`, `Color`, `Rejilla impresa`, `Tapa de desagüe oculta` | Yes |
| Valve | `valve` | `Sifón`, `Doble sifón` | Yes |
| Orientation | `orientation` | `Derecha`, `Izquierda` | Yes |
| Finish family | `finish_family` | slugs (`cementos-metales-oxidos`…) | Yes |
| Finish | `finish` | 124 Stone 3D finish names | Yes |

- **`product_id` is NOT exposed by the live contract.** The model filter uses the `model` parameter whose facet values are the real product IDs. The client therefore sends `model=<product_id>`. Documented as a deviation from the originally requested parameter name, per the "absent parameter" scenario.
- Multi-value semantics verified on the live endpoint: repeated `model` values OR together (`model=…zeus&model=…cach` → 2 items); `texture` ORs (`Liso`+`Piedra` → 6); dimensions AND together (`model=…plus` + `texture=Liso` → plus only). Facet counts are recomputed per active filtered universe (`model=…plus` returns only that model in `facets.model`).
- Unrecognized parameters (`product_ids`, `model_id`, `ids`, `slug`, `product`) are ignored upstream and were not used.
- Facets arrive in `facets.{model,measure,texture,color,grille,valve,orientation,finish_family,finish}` with `{value,label,count}`; counts reflect the active filtered universe. Zero-count options are already hidden by `CatalogFilterPanel`.

## Product detail

- `configuration_fields` per model drives the dependent selector order:
  - Zeus/Smart `["measure","texture","color"]`; Plus/Side/Cach `["measure","texture","color","grille"]`; Mio `["measure","color","grille","orientation"]`; Sorty `["measure","color","grille"]`; 3D `["measure","finish_family","finish"]`.
- `specs.selector_type`: `color` (conventional) or `finish_family` (Stone 3D).
- `specs` maps (relative paths, resolved with `asset_base_url`): `color_image_map`, `texture_image_map`, `selection_image_map` (key `"texture:color"`; values can be empty, e.g. Stone Plus `Liso:*`), `finish_families` (`[{key,name,demo_images[],finish_count}]`, 7 API-delivered families), `family_image_map` (`familyKey -> demo paths`), `finish_image_map` (`"familyKey:Finish" -> swatch paths`).
- Variants: real IDs `{product}--vNNNNN`; `measure`, `finish` (color name for conventional, finish for 3D); `attributes` carry `color`, `color_code`, `texture`, `grille`, `orientation` (Mio), `valve_type`, `finish_family`, `finish_family_name`, `image_path` (quick product image; swatch under `/swatches/` for 3D), `width_cm`, `length_cm`, `no_prices`.
- **`reference` is not delivered by any Duplach variant.** The UI must show the existing "no publicada" fallback; nothing was invented.
- `variants[].images` is empty with `image_mapping_status: "not_imported"`; the quick image comes from `attributes.image_path`.
- Stone Plus measure dependency verified from real variants: of 92 measures, 24 (e.g. `100x100`, `120x95`) only have `Pizarra`; 68 also have `Liso`.
- `commercial_offers` is empty for all 8 Duplach products.
- Prices: `show_price=false`, `specs.no_prices=true`; existing price-field filters apply. Upstream `min_price_eur`/`max_price_eur` are never mapped into the presentation model.

## Detail payload sizes

List ≈ 191 KB (8 items, all facets). Detail: Zeus 1.65 MB / 1,512 variants; Plus 4.4 MB / 5,760; 3D 5.8 MB / 4,452. The existing client cache, abort/timeout and detail prefetch are reused unchanged; no extra catalog-wide downloads were added.
note: backup branch created at 7f65d49; commit c00870a pushed to main
