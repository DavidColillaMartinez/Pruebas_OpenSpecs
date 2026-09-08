## Context

El frontend ya dispone de un cliente público de catálogo, normalización de productos, descubrimiento paginado, selector genérico de variantes, galería y store persistente de presupuesto. Actualmente el query builder solo conoce los perfiles de Mamparas/GME, Espejos y Royo, y la ficha usa atajos de imágenes de variante fuera de esos perfiles.

El paquete `/media/test/Program/Downloads/switch/duplach-platos-2025-ready-v2/duplach-platos-2025` contiene material de referencia extraído del catálogo de Duplach. `model-metadata.json` describe ocho modelos y las familias de Stone 3D; `selector-options.csv` cubre colores y acabados con imágenes de muestra; `image-manifest.json` declara `database_applied: false`. Estos archivos sirven para conocer el dominio, pero no serán importados, copiados ni tratados como respuesta de producción. La API pública es la única fuente de opciones, variantes y URLs.

La solución debe ampliar el frontend sin tocar la landing, los proveedores existentes, los assets, la infraestructura o los sistemas de datos. Las optimizaciones ya presentes (caché TTL, deduplicación de peticiones en vuelo, abort/timeout, facetas server-side, paginación incremental, prefetch y deduplicación de imágenes) se conservarán como parte del flujo Duplach.

## Goals / Non-Goals

**Goals:**

- Hacer que el catálogo Duplach opere únicamente en `supplier_id=duplach` y `category_id=platos-de-ducha`.
- Enviar al endpoint los filtros `product_id`, `measure`, `texture`, `color`, `grille`, `valve`, `orientation`, `finish_family` y `finish`, sin filtrar un listado genérico en React.
- Mostrar los modelos oficiales Stone Zeus, Stone Plus, Stone Smart, Stone Mio, Stone Side, Stone Sorty, Stone Cach y Stone 3D únicamente cuando los devuelva la API.
- Derivar controles y combinaciones de las variantes y facetas reales, con dependencias y restricciones de Stone Plus.
- Separar el flujo de familias/acabados Stone 3D de los selectores convencionales y de la galería principal.
- Mantener la portada, la galería completa, las imágenes rápidas API y el estado de selección de forma no destructiva.
- Integrar las variantes válidas con el store genérico de presupuesto y cubrir la no regresión de proveedores existentes.
- Reutilizar las optimizaciones de red, caché, paginación, prefetch y carga de imágenes ya implementadas.

**Non-Goals:**

- Modificar landing, página principal, navegación principal o páginas ajenas a tienda, catálogo y presupuesto.
- Modificar Royo, Espejos, Mamparas/GME u otros proveedores, salvo tests de no regresión y adaptaciones compartidas estrictamente necesarias.
- Modificar Neon/PostgreSQL, SQL, n8n, VPS, proxy, API upstream, migraciones, assets o imágenes.
- Inventar opciones, familias, colores, combinaciones, URLs o referencias a partir de slugs, nombres, colores aproximados o archivos locales.
- Mostrar, calcular o enviar precios.
- Hacer capturas, pruebas de navegador, Firefox, harness visual o revisión visual automatizada.

## Decisions

### 1. Guard de ámbito exacto y query server-side

Se añadirá un guard reutilizable que solo active reglas Duplach cuando los identificadores normalizados sean exactamente `duplach` y `platos-de-ducha`. El query builder incorporará las claves Duplach y su correspondencia de parámetros, manteniendo los parámetros existentes para el resto de perfiles. Una consulta Duplach siempre incluirá ambos identificadores y los valores de opciones se enviarán al endpoint en lugar de aplicarse sobre `data.items`.

El filtro visible de Modelo usará `product_id` como valor real de API. Sus opciones se construirán desde facetas o datos de respuesta que la API publique, no desde una lista derivada de slugs. Los ocho IDs aceptados por este cambio son `duplach-stone-zeus`, `duplach-stone-plus`, `duplach-stone-smart`, `duplach-stone-mio`, `duplach-stone-side`, `duplach-stone-sorty`, `duplach-stone-cach` y `duplach-stone-3d`; no se presentará un ID si la respuesta no lo entrega.

Alternativas descartadas:

- Filtrar todos los productos en React: rompería paginación, facetas y el requisito de consulta server-side.
- Identificar Duplach por marca, slug o nombre: aplicaría reglas a productos fuera del ámbito exacto.
- Hacer los filtros Duplach globales: contaminaría Royo, Espejos, Mamparas/GME y otros proveedores.

### 2. Adaptador API-preserving y campos opcionales

Se ampliarán los tipos y el normalizador para conservar, cuando estén presentes, los atributos de variante `measure`, `texture`, `color`, `grille`, `valve`, `orientation`, `finish_family` y `finish`, además de `variantId`, referencia e imágenes rápidas. Se añadirán estructuras tipadas para `finish_families` y `family_image_map` sin asumir que todos los productos las tienen.

Los campos ausentes permanecerán ausentes. Durante la implementación se registrará en el cambio el endpoint exacto y el nombre de cada parámetro o campo no observado. No se crearán fixtures sintéticos para hacer pasar un flujo que la API no soporta y no se usarán los archivos extraídos como sustituto del contrato público.

El título de Duplach se tomará del campo de modelo/nombre oficial entregado por API. No se eliminarán fragmentos del nombre mediante heurísticas; si la respuesta no proporciona un nombre de modelo que cumpla la presentación requerida, se documentará el campo faltante.

### 3. Selector Duplach acotado y variantes reales

Se preferirá un adaptador o componente de presentación específico para Duplach que reutilice las unidades seleccionables y el callback de selección del frontend, en lugar de añadir reglas Duplach al selector visual común. Así, los controles existentes de Royo, Espejos, Mamparas/GME y otros proveedores mantienen su camino actual.

Las medidas y opciones se derivarán de variantes completas y facetas activas. Una opción incompatible se ocultará o deshabilitará según los conteos/compatibilidad API; nunca se calculará un producto cartesiano. Stone Plus conservará las restricciones de textura por medida que entregue la API. El selector solo emitirá una unidad con `variantId` real y el botón de presupuesto rechazará una combinación inexistente.

Stone 3D comenzará sin acabado seleccionable hasta que exista una familia elegida. Las familias se leerán de `finish_families`; los acabados se limitarán a la familia activa y usarán el swatch entregado por el acabado. No se hardcodearán las siete familias.

Alternativas descartadas:

- Añadir todas las nuevas claves al fallback global del selector: podría exponer controles a proveedores ajenos.
- Convertir `size_options` o textos informativos sin referencia en variantes comerciales: no garantiza una identidad de presupuesto real.
- Inicializar Stone 3D con la primera variante: incumpliría la selección obligatoria de familia.

### 4. Galería completa y atajos no destructivos

Se creará una función pura para la galería Duplach que reciba `product.images`, la unidad seleccionada y los mapas API aplicables. La portada de `product.images` permanecerá primera al abrir la ficha y toda la galería seguirá navegable sin cambiar opciones. Una imagen rápida real se antepondrá únicamente cuando la API la asocie inequívocamente a color, textura o acabado; después se conservarán las imágenes originales y se deduplicará por URL.

Los swatches nunca se convertirán en imagen principal. Las imágenes de demostración de una familia Stone 3D se renderizarán en una galería de familia separada de la galería principal, con navegación propia. La selección inicial no cambiará la portada; una interacción manual podrá activar el atajo API. Si no existe imagen rápida asociada, se conservará la imagen activa siempre que el recurso siga perteneciendo a la galería efectiva.

### 5. Store genérico y payload sin precios

La ficha construirá la línea mediante `buildQuoteRequestItem` y `useQuoteSelection`, conservando `productId`, `variantId`, referencia, proveedor, categoría, nombre de modelo, imagen principal, cantidad y todos los atributos públicos Duplach disponibles. La identidad continuará siendo `productId + variantId`; repetir la unidad incrementará cantidad y otra variante creará otra línea.

El filtrado de campos privados/precio existente se mantendrá en la normalización, store y validación del payload. El resumen del catálogo y `/presupuesto` seguirán leyendo el mismo provider y añadir no navegará automáticamente. Si se amplía un tipo compartido, se cubrirán explícitamente líneas de Espejos, Mamparas/GME, Royo y otros proveedores antes de considerarlo compatible.

### 6. Optimización y verificación

Las consultas usarán el cliente existente para conservar caché de respuestas, deduplicación de solicitudes idénticas y en vuelo, abort de efectos, timeout, revalidación, facetas por universo, paginación por páginas solicitadas y prefetch. No se añadirá un fetch paralelo que descargue un catálogo completo para filtrar localmente.

Los tests serán unitarios o de componentes con respuestas controladas del contrato observado. Cubrirán Duplach y no regresión explícita de Royo, Espejos, Mamparas/GME y otros proveedores. La validación final será `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `git diff` y `git status`, sin navegador ni revisión visual.

## Risks / Trade-offs

- [La respuesta real de la API no expone alguno de los parámetros o estructuras de Duplach] → Registrar endpoint/campo ausente, dejarlo opcional y no simular controles ni fixtures de producción.
- [El nombre API contiene opciones seleccionables] → Mostrar solo un campo de modelo oficial si existe; no recortar nombres con heurísticas y documentar la ausencia si no existe.
- [Las variantes usan nombres de atributos distintos] → Inspeccionar el contrato antes de fijar aliases y conservar los nombres públicos entregados sin reinterpretar valores.
- [Una adaptación compartida altera otro proveedor] → Activar reglas Duplach con el guard exacto, preferir presentación aislada y exigir tests de no regresión.
- [Una imagen rápida reemplaza accidentalmente la galería] → Centralizar la composición en una función Duplach que anteponga y deduplique sin descartar `product.images`.
- [Stone 3D mezcla swatches, demos y galería] → Modelar los tres recursos por separado y probar que la galería principal no recibe swatches.
- [Los datos locales no representan producción] → No importar assets ni usar `image-manifest.json` como evidencia de API; validar contra las respuestas públicas disponibles.
- [El store recibe atributos de precio ocultos dentro de variantes] → Mantener filtros de campos privados y añadir assertions de payload sin `price`, `precio`, `coste`, `importe` ni equivalentes.

## Migration Plan

1. Consultar las respuestas públicas de listado y detalle Duplach y documentar campos presentes y ausentes.
2. Extender tipos, guard de ámbito, query builder y normalizador sin cambiar consultas ajenas.
3. Añadir el perfil de filtros y conectarlo con las facetas server-side y optimizaciones existentes.
4. Implementar tarjetas y ficha con títulos API, selector Duplach, restricciones reales, colores y Stone 3D.
5. Integrar la galería completa, atajos API no destructivos y galería independiente de demos de familia.
6. Conectar unidades válidas con la cesta genérica y verificar persistencia, cantidades, identidad y payload.
7. Añadir tests Duplach y tests de no regresión; ejecutar las validaciones no visuales indicadas.
8. Revisar únicamente archivos permitidos, crear un commit descriptivo y hacer push en la fase de implementación.

Rollback: retirar el perfil, los tipos/presentación y los tests Duplach añadidos, conservando los caminos existentes del cliente, catálogo, fichas y presupuesto. No habrá migración de datos, cambios de assets ni cambios de backend que revertir.

## Open Questions

- ¿Qué nombres exactos usa la respuesta pública para las facetas de modelo, textura, color, rejilla, válvula, orientación y familia de acabado?
- ¿`finish_families` y `family_image_map` llegan en la raíz del detalle, dentro de `specs` o en otra estructura pública?
- ¿Cada variante Duplach entrega todos los atributos comerciales y una referencia propia, o algunos quedan solo como facetas de producto?
- ¿La imagen rápida llega en `variants[].images`, en mapas de producto o en ambos casos?
- ¿El campo API que debe mostrarse como título es `model`, `model_name` o `name` ya normalizado al nombre oficial?
