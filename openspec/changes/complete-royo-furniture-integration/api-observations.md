# Royo API Observations

Verified through the local Vite project proxy on 2026-08-26. No fixtures were used as production evidence.

## Verified Endpoints

- `GET /api/catalog/products?category_id=muebles-y-lavabos&supplier_id=royo&modularity=modular` returned HTTP `200`, 10 items, and a `modularity` facet containing `modular`.
- `GET /api/catalog/products?category_id=muebles-y-lavabos&supplier_id=royo&modularity=normal` returned HTTP `200`, 85 total items on the first page, and a `modularity` facet containing `normal`.
- `GET /api/catalog/products/royo-modular-logika` returned HTTP `200`, `modularity=modular`, the API cover URL, 24 product images and 18 variants.
- `GET /api/catalog/products/royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17` returned HTTP `200`, `modularity=normal`, four product images and real variant references.

## Missing Or Empty Fields

- Endpoint: `GET /api/catalog/products/royo-modular-logika`; field: `variants[].reference`. It is absent/null on the checked modular variants. The frontend keeps the reference optional and does not invent an SKU.
- Endpoint: `GET /api/catalog/products/royo-modular-logika`; fields: `variants[].measure` and `variants[].dimension`. They are absent/null. The frontend uses `specs.module_configuration.measure_options` only as informational configuration because no commercial references are supplied.
- Endpoint: `GET /api/catalog/products/royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17`; fields: `specs.modular_notice` and `specs.module_configuration`. They are absent because the product is normal; no modular notice or module controls are inferred.
- Endpoint: `GET /api/catalog/products/royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17`; fields: `specs.presentation_types` and `specs.type_image_map`. They are present but empty on the checked product, so no type selector or type shortcut is created from them.

All other fields used by the Royo flow are treated as optional at the frontend boundary and must remain `undefined`/`null` when the API does not deliver them.
