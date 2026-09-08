## Why

La ficha de producto no presenta de forma fiable los detalles publicos y la experiencia Duplach mezcla imagenes de galeria con swatches de color. Ademas, Stone 3D muestra demos en un bloque separado y no adapta la galeria a la familia seleccionada, lo que dificulta comparar acabados y configurar un plato sin perder contexto.

## What Changes

- Convertir el bloque de detalles publicos en un contenedor colapsable accesible, cerrado inicialmente y expandible al activarlo.
- Mostrar las medidas Duplach en un desplegable nativo cerrado por defecto para evitar listas extensas.
- Mostrar para todos los modelos convencionales los swatches reales publicados por la API, no imagenes de galeria reutilizadas.
- Permitir seleccionar un color mediante su swatch y ampliar visualmente el swatch seleccionado con una segunda activacion.
- Mantener nombres, estados seleccionados, foco de teclado y etiquetas accesibles aunque el texto visible no sea el elemento principal.
- Eliminar el bloque independiente de demos de Stone 3D.
- Mostrar inicialmente en Stone 3D la galeria completa de demos publicada para todas las familias.
- Filtrar la galeria principal a las demos disponibles de la familia seleccionada.
- Mostrar los acabados Stone 3D como swatches API, con seleccion y ampliacion visual equivalentes a los colores.
- Mantener los swatches fuera de la galeria principal y conservar la seleccion de variantes reales, el presupuesto y los proveedores existentes.

## Capabilities

### New Capabilities

- `duplach-public-details`: Detalles publicos colapsables con comportamiento accesible y consistente en las fichas.
- `duplach-visual-selectors`: Medidas desplegables y selectores visuales de colores/acabados basados en swatches reales de la API.
- `duplach-stone-3d-gallery`: Galeria inicial completa y filtrado por familia para Stone 3D.

### Modified Capabilities

No existen especificaciones principales en `openspec/specs/` para modificar.

## Impact

- Afecta la presentacion de `ProductDetailPage`, `DuplachVariantSelector` y sus modelos de normalizacion y galeria.
- Consume `specs.selector_images.colors[].filename` para swatches de colores y `finish_image_map` para swatches de acabados Stone 3D.
- Usa `product.images` y los mapas API de familias para componer la galeria sin copiar ni modificar assets.
- Requiere tests unitarios y de componentes para interaccion, accesibilidad, combinaciones reales y no regresion.
- No cambia la landing, Vision, navegacion principal, presupuesto generico, API, proxy, backend, SQL, n8n ni assets.
