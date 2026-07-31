## Context

El catálogo actual ya tiene un flujo genérico de listado, facetas raíz, fichas, selección de variantes, galería y presupuesto individual. El perfil contextual existente solo distingue el contexto raíz de Mamparas/GME, y el modelo de variante reconoce algunos campos comunes (`dimension`, `finish`, `distribution`) pero no garantiza todavía la selección de una variante completa para las combinaciones de Espejos.

El paquete de Manillons Torrent situado en `/media/test/Program/Downloads/switch/mt-espejos-2026-2027-package/output/mt-espejos-2026-2027` contiene el manifiesto definitivo, 53 modelos, 355 variantes y 126 imágenes WebP. El SQL no se considera ejecutado: la migración real comienza con `BEGIN`, registra el `import_run`, hace upsert de `image_assets`, archiva productos anteriores de la familia, hace upsert de `products`, reemplaza enlaces de imagen y variantes, y termina con `COMMIT`. El dry-run es idéntico en contenido y termina con `ROLLBACK`; `mt-espejos-verify.sql` comprueba 53 productos, 355 variantes, 126 enlaces y cero precios.

La fuente exige consumir URLs de imagen proporcionadas por la API, conservar el orden del manifiesto y no transportar precios. Antes de cualquier ejecución operativa del SQL se deben comprobar los IDs vigentes `manillons-torrent` y `espejos`, así como las vistas y workflows que publican las nuevas facetas.

## Goals / Non-Goals

**Goals:**

- Modelar Espejos como una familia contextual activada por categoría o proveedor, con unión de perfiles cuando se activan varias familias.
- Hacer que `shape`, `has_led`, `lighting_type` y `finish` se consulten, normalicen y serialicen como facetas API reales.
- Mantener solo opciones compatibles con la selección actual, actualizar sus cantidades y limpiar facetas invisibles cuando desaparece su activador.
- Representar 53 tarjetas por modelo y fichas con galerías del modelo ordenadas por `sort_order`, sin cambiar la galería al cambiar una variante de Espejos.
- Seleccionar únicamente variantes reales completas en el orden `dimension`, `finish`, `version`, respetando `sort_order` para los fallbacks.
- Enviar la línea individual con identidad de producto/variante, referencia y todos los atributos públicos seleccionados, sin cerrar `items[]` a un único elemento.
- Persistir selecciones completas en `localStorage`, deduplicar por `productId + variantId` y enviar varias líneas desde una página de revisión.
- Exponer en ficha los datos de iluminación directos de la variante seleccionada, sin reemplazarlos por etiquetas genéricas.
- Reducir la envolvente visual del catálogo a tipografía, espacio y líneas sutiles, manteniendo la proporción A4 real de las imágenes.
- Cubrir los casos obligatorios del manifiesto y validar sin POST reales.

**Non-Goals:**

- No ejecutar `mt-espejos-migration.sql`, no migrar la base de datos y no modificar n8n, SQL, proxy o rutas por iniciativa de este cambio.
- La cesta de presupuesto forma parte de este alcance: no se implementarán pagos, checkout ni precios.
- No inventar modelos, opciones, combinaciones, rutas de imagen, precios o facetas locales.
- No modificar la landing, Vision, navegación existente fuera de lo necesario para el catálogo, ni los assets protegidos del repositorio.

## Decisions

### Registro centralizado de familias

Se añadirá un registro de perfiles de catálogo con activadores (`category` y `supplier`), facetas dependientes, orden y etiquetas específicas. El perfil de Espejos se activa con `category=espejos` **o** `supplier=manillons-torrent`; el de Mamparas conserva `category=mamparas` **o** `supplier=gme`. La UI consultará este registro para decidir qué grupos mostrar y no dispersará IDs de activación en componentes de presentación.

Alternativa considerada: añadir una cadena de condicionales en `CatalogFilterPanel` y `catalogQuery`. Se descarta porque duplicaría reglas, impediría combinar familias de forma coherente y haría más probable que una faceta quedara activa pero invisible.

### Facetas calculadas por API, no por páginas parciales

`CATALOG_FACET_KEYS`, el estado URL y `catalogQueryToRequest` incluirán `shape`, `has_led` y `lighting_type`. `normalizeFacets` aceptará sus alias y conservará el valor/etiqueta/count publicados por API. `useCatalogDiscovery` cargará el universo facetado con `include_facets=1`, combinará facetas globales y activas según los perfiles y no derivará las facetas especializadas de las tarjetas cargadas en páginas parciales.

Cuando solo haya categoría/proveedor raíz se mostrarán únicamente esas facetas. Con una familia activa se mostrará su grupo en el orden definido; con varias, se mostrará la unión. Para `subcategory`, `collection` y `finish`, se usarán etiquetas genéricas si las etiquetas específicas de varias familias fueran ambiguas.

Alternativa considerada: mantener `deriveCatalogFacets` como fuente de respaldo para todas las claves. Se descarta para facetas de Espejos porque una página parcial no representa compatibilidades ni cantidades completas. Si la API no entrega facetas, se mostrará un estado de disponibilidad honesto, no opciones inventadas.

### Limpieza contextual determinista

Al cambiar categoría o proveedor, se recalcularán los perfiles activos y se eliminarán solo las facetas cuyo perfil ya no tenga activador. Las facetas compartidas se conservarán si aún pertenecen a otro perfil activo. Al parsear una URL con una faceta dependiente sin contexto válido, se eliminará antes de serializarla y pedir datos.

Alternativa considerada: limpiar siempre todas las facetas dependientes al tocar cualquier raíz. Se descarta porque pierde selecciones válidas cuando se combinan Mamparas y Espejos.

### Variantes completas y prioridad estable

La selección se basará en unidades normalizadas que incluyen todos los atributos públicos de la variante y `sort_order`. Los controles visibles se limitarán a `dimension`, `finish` y `version`, en ese orden, y solo aparecerán cuando haya más de una opción real compatible. Al cambiar un campo se conservarán los restantes si existe una combinación completa; si no, se elegirá la primera unidad compatible según `sort_order`.

Los modelos Basic, Alba, Retro, Nova y Tango se usarán como fixtures de combinaciones; Hula verificará que tipo y forma son independientes, y Swing verificará que la galería conserve las páginas 158 y 159.

Alternativa considerada: combinar campos independientes y buscar después una variante aproximada. Se descarta porque puede producir una medida/acabado/versión que no existe en el catálogo y enviar una selección parcial.

### Galería propiedad del modelo

La respuesta de producto conservará la galería a nivel de producto, ordenada por `sort_order` y deduplicada por URL. Para productos Manillons Torrent de categoría Espejos, `ProductDetailPage` siempre pasará `product.images` a `ProductGallery`; la selección de medida, acabado o versión solo cambia el snapshot y el resumen de la variante. Las URLs se resolverán únicamente mediante `normalizeImage` y la configuración/URL entregada por API.

Alternativa considerada: preferir siempre imágenes de la variante como hace el flujo genérico actual. Se descarta para Espejos porque el manifiesto declara que las imágenes pertenecen al modelo y no varían por acabado, medida o versión.

### Snapshot extensible de presupuesto

Se generalizará la línea de presupuesto para identificar `productId` y `variantId` cuando exista, conservar la referencia y enviar `selectedAttributes` como un mapa de todos los atributos públicos no vacíos de la variante. En Espejos incluirá medida, acabado y versión cuando estén presentes; en otras familias podrá incluir distribución, códigos u otros campos públicos. La validación seguirá aceptando de 1 a 50 elementos y no se limitará el tipo a un único item.

Alternativa considerada: enviar solo un `variantSnapshot` con campos conocidos por Espejos o solo el producto genérico. Se descarta porque pierde identidad y atributos de otras familias y puede construir presupuestos ambiguos.

### Selección persistente y presupuesto conjunto

La selección se gestionará con un provider de React montado por encima de las rutas y un almacenamiento `localStorage` validado al hidratar. Cada línea se construirá con el mismo `buildQuoteRequestItem` que usa el presupuesto individual. El provider sumará cantidades cuando coincida `productId + variantId` y conservará líneas distintas para variantes distintas del mismo producto. La página `/presupuesto` permitirá editar cantidades, eliminar líneas y enviar todas las líneas en `items[]`.

Alternativa considerada: guardar solo IDs y reconstruir el resto al abrir la cesta. Se descarta porque perdería el snapshot exacto si cambia la respuesta de la API o no está disponible al recargar.

### Datos de iluminación de ficha

La normalización aceptará `has_led`, `lighting_type`, `lighting_technology` y `light_temp` tanto a nivel de producto como de variante. La ficha mostrará primero el valor de la unidad seleccionada y solo usará valores de producto o especificaciones API cuando la variante no los publique. Si el GET real no entrega un campo, se omitirá el dato y se dejará constancia del bloqueo, sin derivarlo del slug.

### Superficie visual del catálogo

Las tarjetas y la galería usarán wrappers transparentes, proporción A4 `1489 / 2105`, `object-contain`, separadores finos y espacio tipográfico. Se retirarán fondos, sombras, esquinas y capas decorativas que compitan con las páginas del catálogo. Los paneles de interacción conservarán contraste y foco, pero no se presentarán como una cuadrícula de tarjetas anidadas.

### Migración operativa separada del frontend

La implementación usará los IDs y campos publicados por la API, pero no ejecutará SQL. La secuencia revisada queda documentada para operación posterior: ejecutar primero el dry-run, verificar IDs/permisos y resultados, ejecutar la migración transaccional, ejecutar `verify.sql`, y hacer rollback no destructivo si las comprobaciones no coinciden. El frontend no incluirá imágenes locales ni asumirá que el SQL ya fue aplicado.

Alternativa considerada: copiar datos del manifiesto a fixtures de producción o ejecutar la migración desde scripts de test. Se descarta porque la base de datos y sus vistas/workflows son responsabilidad operativa y la fuente definitiva debe permanecer fuera del código de presentación.

## Risks / Trade-offs

- [Riesgo] La API pública todavía no expone las tres nuevas facetas o devuelve valores con claves distintas. → Mitigación: normalizar alias documentados, probar el contrato de respuesta y bloquear la publicación si `include_facets=1` no devuelve opciones/counts reales.
- [Riesgo] La migración SQL archiva productos existentes de la familia que no estén en la lista de 53 IDs. → Mitigación: ejecutar primero el dry-run, revisar el `UPDATE` de archivado y confirmar el conjunto de IDs antes del `COMMIT`.
- [Riesgo] La URL conserva una faceta de una familia ya desactivada. → Mitigación: centralizar propietarios de facetas y probar eliminación del último activador en estado y URL.
- [Riesgo] El contrato de presupuesto existente usa `variantSnapshot` y consumidores externos podrían esperar esa forma. → Mitigación: revisar el contrato del endpoint antes de cambiar nombres; si el backend aún lo requiere, mantener una serialización explícita compatible sin perder `reference` y `selectedAttributes`.
- [Riesgo] Las imágenes de página completa son pesadas. → Mitigación: conservar WebP y dimensiones del manifiesto, cargar la galería progresivamente y no duplicar imágenes en variantes.
- [Riesgo] El proxy/API local no está configurado para revisión visual. → Mitigación: validar con fixtures y pruebas unitarias, ejecutar build y dejar la revisión visual real como criterio pendiente si el endpoint no está disponible.
- [Riesgo] El detalle público devuelve 404 y no permite validar fichas reales en producción. → Mitigación: usar fixtures contractuales para pruebas y no declarar verificada la integración real hasta que se registre el webhook.
- [Riesgo] `localStorage` contiene líneas antiguas o incompletas. → Mitigación: validar cada línea al hidratar y descartar entradas sin identidad, referencia o atributos seleccionados.

## Migration Plan

1. Confirmar que el paquete, manifiesto y SQL son los entregables vigentes y que los IDs `manillons-torrent`/`espejos` coinciden con el entorno objetivo.
2. Confirmar que las vistas/workflows exponen `shape`, `has_led`, `lighting_type`, `finish`, imágenes y variantes sin precios.
3. Ejecutar `mt-espejos-migration-dry-run.sql` en el entorno de revisión y comprobar que no produce errores ni efectos persistentes.
4. Tras la aprobación del propietario de datos, ejecutar `mt-espejos-migration.sql` dentro de su transacción y después `mt-espejos-verify.sql`; los resultados esperados son 53, 355, 126 y 0 precios.
5. Publicar el frontend solo cuando la respuesta API real satisfaga el contrato. Si falla una verificación, no ejecutar el `COMMIT` operativo y corregir la fuente o el SQL de forma separada.

## Open Questions

- ¿El endpoint de presupuesto aceptará `reference` y `selectedAttributes` como campos públicos de cada item, o requiere conservar también `variantSnapshot` por compatibilidad con el workflow actual?
- ¿La API pública ya está preparada para filtrar y facetar `shape`, `has_led`, `lighting_type` y `finish`, o la habilitación de vistas/workflows debe aprobarse en un cambio operativo independiente?
- ¿Quién confirma los IDs vigentes, permisos de ejecución y aprobación del `COMMIT` de la migración en el entorno real?

## GET Verification Record

- `GET /webhook/lrmq/catalog/config`: HTTP `200`; devuelve `catalog-api-v1`, `asset_base_url` y `database_ready_for_public_api=true`.
- `GET /webhook/lrmq/catalog/products?limit=1&offset=0&include_facets=1&category_id=espejos`: HTTP `200`; devuelve Alba y las facetas actuales `brand`, `category`, `collection`, `commercial_mode`, `distribution`, `finish`, `measure`, `product_kind`, `subcategory` y `supplier`. No devuelve las facetas `shape`, `has_led` ni `lighting_type` requeridas por este cambio.
- `GET /webhook/lrmq/catalog/products/mt-espejos-alba`: HTTP `404`; n8n responde que el webhook de detalle no está registrado/activo.
- La interfaz implementa el contrato esperado y omite valores ausentes; no deriva esos campos del slug ni inventa opciones en React. La verificación visual y la validación contra detalle real quedan pendientes hasta registrar el workflow y publicar las facetas.
