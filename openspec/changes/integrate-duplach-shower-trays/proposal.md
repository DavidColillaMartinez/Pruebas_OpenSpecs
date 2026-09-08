## Why

La tienda todavía no ofrece una integración frontend para los platos de ducha Duplach. El catálogo, las fichas y la selección de presupuesto necesitan consumir las variantes reales de la API para que medidas, texturas, colores, rejillas, válvulas, orientaciones y acabados no se presenten como combinaciones inventadas.

La integración debe aprovechar la optimización ya existente del catálogo (consultas server-side, caché, deduplicación de peticiones, paginación incremental, prefetch y deduplicación de imágenes) sin ampliar el alcance a la landing, backend, assets o proveedores ya integrados.

## What Changes

- Incorporar el ámbito exacto `supplier_id=duplach` y `category_id=platos-de-ducha` al catálogo.
- Consultar los filtros Duplach en el endpoint mediante `product_id`, `measure`, `texture`, `color`, `grille`, `valve`, `orientation`, `finish_family` y `finish`, sin descargar un listado genérico para filtrarlo en React.
- Mostrar en tarjetas y fichas únicamente el nombre oficial del modelo recibido por la API: Stone Zeus, Stone Plus, Stone Smart, Stone Mio, Stone Side, Stone Sorty, Stone Cach y Stone 3D.
- Derivar las medidas, texturas, colores, rejillas, válvulas, orientaciones, familias y acabados solo de facetas, campos y variantes reales de la API.
- Respetar las combinaciones reales de Stone Plus, incluida la restricción de textura por medida.
- Representar colores convencionales con la muestra API cuando exista y con su valor real cuando no exista imagen asociada.
- Implementar el flujo específico de Stone 3D: selección de familia, acabados de esa familia, swatches API e imágenes de demostración navegables sin mezclarlas con la galería principal.
- Mantener `product.images` como galería completa, colocar una imagen rápida API como primera imagen solo cuando exista y eliminar URLs duplicadas sin construir rutas desde slugs.
- Evitar que la selección automática inicial sustituya la portada antes de una interacción manual.
- Añadir variantes Duplach válidas al store genérico de presupuesto con identidad `productId + variantId`, persistencia, cantidad y atributos públicos completos, sin precios ni redirección automática.
- Añadir tests de contrato y comportamiento para Duplach, incluyendo filtros, variantes, Stone 3D, galería, presupuesto y no regresión de Royo, Espejos, Mamparas/GME y otros proveedores.
- Documentar cada campo o parámetro ausente en las respuestas de API y mantenerlo opcional; no crear fixtures ni controles falsos para cubrir ausencias.

## Capabilities

### New Capabilities

- `duplach-shower-tray-catalog`: Catálogo Duplach con ámbito proveedor/categoría, filtros server-side, modelos oficiales y facetas dependientes.
- `duplach-shower-tray-detail`: Fichas Duplach con variantes reales, selectores convencionales, flujo Stone 3D, muestras y galerías API-preservadas.
- `duplach-shower-tray-budget`: Selección persistente de variantes Duplach en el presupuesto compartido, con identidad estable, atributos públicos y payload sin precios.

### Modified Capabilities

Ninguna. No hay capacidades canónicas existentes en `openspec/specs/` que requieran modificar sus requisitos.

## Impact

- Código frontend potencialmente afectado: `src/features/catalog/model`, cliente API, páginas y componentes de catálogo, componentes de selección y galería, `src/features/quote` y sus tests estrictamente relacionados.
- La API pública existente se consumirá mediante `GET /api/catalog/products` y `GET /api/catalog/products/:slug`; las consultas Duplach incluirán siempre `supplier_id=duplach` y `category_id=platos-de-ducha`.
- Se podrán ampliar tipos y normalizadores compartidos, pero cada cambio compartido deberá conservar mediante tests el comportamiento actual de Royo, Espejos, Mamparas/GME y otros proveedores.
- No se modificarán la landing, la página principal, páginas ajenas, Royo, Espejos, Mamparas/GME, otros proveedores, backend, Neon/PostgreSQL, SQL, n8n, VPS, assets ni imágenes.
- La validación se limitará a `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, revisión de diff/status y comprobaciones de contrato; no incluye navegador, capturas, Firefox ni harness visual.
