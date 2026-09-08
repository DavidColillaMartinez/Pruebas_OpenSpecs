## Context

La integracion Duplach ya tiene un selector separado, variantes reales y una galeria basada en la respuesta publica. Sin embargo, el selector actual usa `color_image_map`, que contiene imagenes de producto o galeria, no los swatches publicados para cada color. Stone 3D tambien muestra una galeria de familia separada cuando deberia reutilizar la galeria principal, y el bloque de detalles publicos necesita un control de disclosure mas claro.

La respuesta publica de detalle entrega los swatches convencionales en `specs.selector_images.colors[]`, con `name`, `code` y `filename`. Los acabados Stone 3D se entregan en `specs.finish_image_map` con claves `familyKey:finish`; las demos de familia llegan en `product.images`/`specs.gallery_image_paths` y en `specs.family_image_map`. Las rutas relativas solo se resolveran con `asset_base_url` de la configuracion publica.

El cambio es frontend-only. Debe conservar las variantes, el presupuesto, el cliente API, la cache, los proveedores existentes, la landing, Vision y los assets originales.

## Goals / Non-Goals

**Goals:**

- Hacer que los detalles publicos sean un disclosure cerrado inicialmente, expandible por click, teclado y tecnologia asistiva.
- Reducir el selector de medidas a un `<select>` nativo cerrado por defecto, conservando las opciones y combinaciones reales de la API.
- Mostrar un swatch API por cada color disponible de cada modelo convencional cuando la respuesta publique su archivo.
- Hacer que el primer click seleccione y el segundo click sobre el mismo swatch alterne una ampliacion visual local.
- Mantener la etiqueta del color disponible por hover, foco, nombre accesible y estado seleccionado.
- Mostrar todos los demos de Stone 3D en la galeria principal al abrir la ficha.
- Cambiar la galeria principal a los demos disponibles de la familia elegida, sin un bloque de galeria separado.
- Mostrar los acabados Stone 3D con swatches de `finish_image_map`, selection real y ampliacion independiente de la galeria.
- Mantener la identidad `productId + variantId`, el presupuesto sin precios y el comportamiento de otros proveedores.

**Non-Goals:**

- No crear ni modificar imagenes, assets locales, `image-manifest.json`, SQL, Neon/PostgreSQL, n8n, proxy o API upstream.
- No usar `color_image_map` como fuente de swatches convencionales ni derivar swatches por nombre, color CSS o imagen de galeria.
- No inventar colores, acabados, familias, combinaciones, URLs o variantes cuando falten en la API.
- No cambiar la landing, navegacion principal, Vision, `CompareSlider`, Royo, Espejos, GME u otros proveedores salvo adaptaciones compartidas cubiertas por tests.
- No mostrar precios ni añadir navegacion automatica al presupuesto.

## Decisions

### 1. Disclosure de detalles publicos

El contenido de detalles se agrupara en un `div` contenedor. El titular visible sera un `span` con identificador estable dentro de un boton de control; el boton conservara `aria-expanded`, `aria-controls` y foco visible. El contenido sera otro `div` con `hidden` sincronizado con el estado React. Asi se respeta que el titular visible sea un `span` sin convertir el texto en un control no accesible.

Se conservaran los datos publicos actuales y se evitara serializar mapas, listas internas o campos tecnicos como texto `[object Object]`. El estado inicial sera cerrado por producto y la activacion no cambiara la seleccion ni la galeria.

Alternativa descartada: hacer clicable solo el `span` sin boton. No ofrece semantica ni teclado suficiente y obliga a recrear comportamiento nativo de disclosure.

### 2. Medidas en control nativo

Cuando la ficha sea Duplach y `measure` forme parte de `configuration_fields`, se renderizara un `<select>` con label visible o asociado. Las medidas se derivaran de variantes/facetas reales y conservaran el orden de la API. El control sera cerrado inicialmente por la naturaleza del elemento nativo y no se mostrara como una lista de decenas de botones.

Cambiar la medida limpiara solamente valores dependientes que ya no tengan una variante compatible. Las opciones de textura, color, rejilla, valvula, orientacion, familia y acabado se recalcularan sin producto cartesiano ni variantes sinteticas.

Alternativa descartada: envolver todos los botones en un acordeon. Reduce el espacio, pero sigue descargando y mostrando una lista extensa, ofrece peor busqueda de una medida concreta y no aprovecha la semantica de seleccion nativa.

### 3. Modelo de swatches convencionales

El adaptador Duplach parseara `specs.selector_images.colors[]` en una tabla por nombre de color y, cuando sea necesario, por codigo API. Cada entrada conservara el nombre y resolvera `filename` contra `asset_base_url`. Las opciones visibles seguiran viniendo de variantes compatibles; el mapa de swatches solo aporta la imagen publicada.

`color_image_map` se reservara para imagenes de producto/galeria y no se usara como swatch. Si un color no tiene `filename` publicado, se conservara su valor real con una tarjeta accesible sin inventar una imagen.

Cada tarjeta sera un boton con imagen dominante, nombre accesible, `aria-pressed` para la seleccion y `aria-expanded` para la ampliacion. El nombre se mostrara como etiqueta visual en hover y focus, y tambien estara disponible para lectores de pantalla. La ampliacion sera un estado de presentacion separado de la seleccion: primer click sobre otro color selecciona; segundo click sobre el color ya seleccionado alterna su escala/tamano local y no lo convierte en imagen principal.

Alternativa descartada: usar una imagen de galeria como aproximacion del color. Puede representar otra textura, medida o encuadre y contradice el contrato de swatch publicado.

### 4. Stone 3D y acabados

Stone 3D mantendra `product.images` completo al entrar, incluyendo portada y todas las demos publicadas de las familias. No se renderizara el bloque separado `Imágenes de demostración · ...`.

La familia seleccionada se mantendra en el estado del selector. Mientras no haya familia, la galeria principal seguira completa. Al seleccionar una familia, una funcion pura construira la galeria principal exclusivamente con sus rutas API de `family_image_map` o `finish_families[].demo_images`, deduplicadas y resueltas con `asset_base_url`. Si la API no entrega demos para la familia, no se crearan imagenes sustitutas.

Los acabados se derivaran solo de variantes compatibles con medida y familia. Cada swatch usara `finish_image_map[familyKey:finish]`, tendra el mismo comportamiento de primer click/segundo click que un color y nunca entrara en la galeria principal. La galeria seguira mostrando demos de la familia, no el swatch del acabado.

Alternativa descartada: conservar una segunda galeria embebida bajo el selector. Duplica navegacion, separa los demos del contexto visual principal y produce el comportamiento que este cambio debe eliminar.

### 5. Compatibilidad y presupuesto

Se reutilizaran `SelectableUnit`, `configuration_fields`, `variantId` y el store generico. La UI ocultara o deshabilitara valores incompatibles segun variantes reales. Las ampliaciones visuales no modificaran el snapshot, la identidad de la linea, la cantidad ni el payload.

Se conservaran los filtros de campos privados y de precios. Cualquier ampliacion de tipos compartidos se validara con tests de Royo, Espejos, GME y otros proveedores antes de considerarla compatible.

### 6. Verificacion

Se añadiran tests de modelo para parseo de swatches, disponibilidad dependiente, seleccion y composicion de galeria; tests de componente para clicks repetidos, foco, estados ARIA, select de medidas, disclosure y Stone 3D; y tests de no regresion para fichas existentes.

La validacion tecnica sera `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`. Como es un cambio visual, la validacion final incluira revision manual en navegador en desktop y movil, comparando la landing/luz existente y comprobando las interacciones de colores, acabados, medidas, detalles y galeria.

## Risks / Trade-offs

- [El backend cambia la forma de `selector_images.colors`] → Mantener un parser tolerante pero exigir `name` y `filename` API antes de renderizar un swatch; documentar cualquier campo ausente.
- [Un color real no tiene swatch publicado] → Mostrar el valor con nombre accesible y no inventar una imagen.
- [El segundo click puede confundirse con una nueva seleccion] → Mantener `aria-pressed`, `aria-expanded`, estilos de foco y una etiqueta de estado que diferencie seleccion de ampliacion.
- [Cambiar medida deja una seleccion dependiente invalida] → Recalcular por prefijos de `configuration_fields` y bloquear el presupuesto hasta encontrar un `variantId` completo.
- [La familia Stone 3D no tiene demos publicadas] → No crear fallback visual; conservar el ultimo conjunto valido o informar de que no hay demos disponibles.
- [Filtrar `product.images` pierde la portada] → Aplicar el conjunto de familia solo despues de una seleccion manual de familia y probar el orden inicial por separado.
- [Cambios compartidos afectan otros proveedores] → Encerrar toda la logica en el guard Duplach y ejecutar la suite de regresion completa.
- [Las rutas relativas no se resuelven] → Usar exclusivamente `asset_base_url` de `/api/catalog/config`; no hardcodear dominios ni copiar assets.

## Migration Plan

1. Actualizar el contrato de presentacion para conservar `selector_images.colors` y los mapas API necesarios sin importar assets.
2. Reemplazar el disclosure de detalles y convertir la medida Duplach en control nativo.
3. Implementar tarjetas de swatch para colores y acabados con seleccion, ampliacion y estados accesibles.
4. Conectar el estado de familia Stone 3D con la galeria principal y retirar la galeria separada.
5. Cubrir presupuesto, variantes reales y no regresion con tests.
6. Ejecutar validaciones tecnicas y revision manual desktop/movil.

Rollback: revertir los cambios de presentacion y adaptador de este cambio. No requiere migracion de datos, cambios de backend ni rollback de assets.

## Open Questions

Resueltas durante la implementación (ver `contract-notes.md`):

- `selector_images.colors[]` publica `filename` para los 18 colores de cada modelo convencional y ningún modelo usa códigos distintos del nombre de la variante; el matching por `code` queda solo como tolerancia.
- Familia Stone 3D sin demos publicadas: la galería principal queda vacía y `ProductGallery` muestra su estado `Imagen no disponible` (`role="status"`); no se inventan imágenes, no se conserva un conjunto anterior y el swatch del acabado nunca entra en la galería.
