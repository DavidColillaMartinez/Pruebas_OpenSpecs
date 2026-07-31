## Why

El catálogo necesita publicar la experiencia completa de Espejos Manillons Torrent a partir del PDF y manifiesto de 2026/2027, sin perder la identidad por modelo ni la compatibilidad real de sus variantes. La API debe poder exponer 53 modelos, 355 variantes y 126 galerías de página completa con filtros contextuales, mientras la ficha y el presupuesto deben conservar exactamente la variante seleccionada y nunca mostrar precios.

## What Changes

- Añadir el contexto de familia Espejos, activado por `category=espejos` o `supplier=manillons-torrent`, sin romper el contexto ya existente de Mamparas/GME.
- Añadir las facetas API `shape`, `has_led` y `lighting_type`, además de `finish` contextual para el listado de Espejos, con orden, etiquetas, cantidades y compatibilidades calculados por la API.
- Limpiar de forma determinista URL y estado cuando desaparece el último activador de una familia, y conservar selecciones compatibles al combinar familias.
- Publicar tarjetas por modelo, galerías ordenadas por manifiesto y fichas sin precios para los 53 modelos del paquete.
- Añadir selectores dependientes de medida, acabado y versión que solo puedan formar variantes reales completas y mantengan la galería del modelo inmutable.
- Enviar a presupuesto la variante actualmente seleccionada con `productId`, `variantId`, referencia y snapshot completo de atributos públicos, manteniendo `items[]` preparado para múltiples líneas.
- Validar el paquete SQL y su secuencia de migración como requisito previo operativo, sin ejecutar el SQL ni asumir que la base de datos ya está migrada.

## Capabilities

### New Capabilities

- `manillons-torrent-mirror-discovery`: Contexto de familia, facetas dependientes, opciones compatibles, tarjetas por modelo y conteos del catálogo de Espejos.
- `manillons-torrent-mirror-detail`: Ficha de producto, variantes completas, selectores dependientes, galerías del manifiesto y ausencia de precios.
- `complete-variant-quote-snapshot`: Snapshot público y completo de la variante seleccionada dentro del contrato de presupuesto multi-item.

### Modified Capabilities

<!-- No existen specs principales en openspec/specs/; las capacidades actuales se cubren mediante las nuevas especificaciones del cambio. -->

## Impact

- Frontend: `src/features/catalog/model/types.ts`, `catalogQuery.ts`, `normalize.ts`, `selection.ts`, `useCatalogDiscovery.ts`, `CatalogFilterPanel.tsx`, `ProductVariantSelector.tsx`, `ProductDetailPage.tsx`, `ProductGallery.tsx` y sus pruebas.
- Presupuesto: `src/features/quote/model/payload.ts`, tipos, componentes y pruebas de payload/snapshot.
- API pública/proxy: debe exponer las nuevas facetas y los campos de producto, variante e imagen ya definidos por el paquete; no se cambia el endpoint ni se inventan rutas de imagen.
- Datos: `mt-espejos-manifest.json`, `mt-espejos-migration.sql`, `mt-espejos-migration-dry-run.sql` y `mt-espejos-verify.sql` son la fuente de validación. La migración requiere comprobar antes los IDs `manillons-torrent`/`espejos`, vistas y workflows públicos.
- Media: se consumirán las URLs entregadas por API para las 126 imágenes WebP de página completa; no se re-encodean ni se construyen rutas desde slugs.
