## 1. Fuente y contrato de datos

- [x] 1.1 Contrastar `mt-espejos-manifest.json`, `README.md`, `OPEN_CODE_ESPEJOS_MT.md` y los SQL para fijar fixtures de 53 modelos, 355 variantes, 126 imágenes, tipos y páginas sin copiar opciones al código de presentación.
- [x] 1.2 Verificar en el contrato de la API pública que existen `shape`, `has_led`, `lighting_type`, `finish`, galerías ordenadas, variantes completas y ausencia de precios; registrar cualquier bloqueo sin modificar SQL, proxy, n8n ni rutas.
- [x] 1.3 Documentar para operación que el dry-run debe terminar en `ROLLBACK`, la migración real en `COMMIT` y `mt-espejos-verify.sql` debe confirmar 53 modelos, 355 variantes, 126 imágenes y cero precios antes de publicar.

## 2. Modelo y consulta del catálogo

- [x] 2.1 Extender `types.ts` con `shape`, `has_led` y `lighting_type` en `CATALOG_FACET_KEYS`, tipos de perfil/contexto y cualquier metadato de galería o snapshot necesario sin incluir precios.
- [x] 2.2 Crear el registro centralizado de perfiles para Espejos y Mamparas, con activadores OR, propietarios de facetas, orden de grupos y etiquetas específicas/genéricas.
- [x] 2.3 Extender `catalogQuery.ts` para serializar, parsear y solicitar `shape`, `has_led`, `lighting_type` y `finish`, incluyendo limpieza determinista de facetas dependientes cuando pierde contexto una familia.
- [x] 2.4 Extender `normalize.ts` para normalizar alias y valores API de las tres facetas nuevas, conservar counts/labels publicados y excluir precios de productos, variantes y atributos públicos.
- [x] 2.5 Eliminar la dependencia de páginas parciales para las facetas especializadas y adaptar `useCatalogDiscovery.ts` para cargar facetas API completas, recalcular compatibilidades y unir perfiles activos sin perder selecciones válidas.

## 3. Panel de filtros y listado

- [x] 3.1 Actualizar `CatalogFilterPanel.tsx` para mostrar solo las facetas del perfil activo en el orden requerido, con labels genéricos cuando haya claves compartidas ambiguas y sin opciones de cero resultados.
- [x] 3.2 Mantener el comportamiento de Mamparas/GME, incluidos Distribución y Acabado, al activar categoría o proveedor por separado.
- [x] 3.3 Asegurar que las tarjetas representan modelos únicos y usan exclusivamente la primera imagen ordenada por API, sin derivar URLs desde slugs ni mostrar precios.
- [x] 3.4 Añadir pruebas de panel para ausencia inicial de facetas, `category=espejos`, `supplier=manillons-torrent`, activación Mamparas, combinación de familias, counts compatibles, limpieza de estado/URL y etiquetas compartidas.
- [x] 3.5 Añadir pruebas de normalización/listado que cubran las tres facetas nuevas, 53 tarjetas por modelo, recuentos por tipo y descarte de campos de precio.

## 4. Ficha, variantes y galería

- [x] 4.1 Extender la normalización de variantes y atributos para soportar `dimension`, `finish`, `version`, referencia, `sort_order`, tecnología de iluminación y todos los atributos públicos sin sintetizar combinaciones.
- [x] 4.2 Rehacer las funciones de `selection.ts` para mostrar solo campos con más de una opción real, preservar atributos compatibles y elegir el primer fallback completo por `sort_order`.
- [x] 4.3 Actualizar `ProductVariantSelector.tsx` con el orden Medida, Acabado y Versión, labels correctos, semántica de selección y representación de Básica/Plus según los datos API.
- [x] 4.4 Actualizar `ProductDetailPage.tsx` para enviar la variante completa al presupuesto, mostrar especificaciones públicas sin precios y usar la galería del modelo para Espejos aunque cambie la variante.
- [x] 4.5 Verificar que `ProductGallery.tsx` admite de una a cuatro imágenes, ordena por API, conserva la secuencia del manifiesto y no cambia al seleccionar medida, acabado o versión.
- [x] 4.6 Añadir fixtures y pruebas obligatorias para Basic, Alba, Retro, Nova, Tango, Hula y Swing, incluyendo páginas 158/159 en ese orden y cero precios en ficha, respuesta o snapshot.

## 5. Presupuesto y snapshot extensible

- [x] 5.1 Generalizar `QuoteRequestItem` y `buildQuoteRequestItem` para enviar `productId`, `variantId` cuando exista, referencia y `selectedAttributes` con todos los atributos públicos no vacíos de la variante completa.
- [x] 5.2 Confirmar el nombre de campos aceptado por el endpoint/workflow y, si requiere compatibilidad con `variantSnapshot`, definir una serialización explícita que no pierda `reference` ni `selectedAttributes`; el proxy local es transparente y conserva ambos campos.
- [x] 5.3 Mantener `items[]` multi-item y la validación de cantidades/identificadores sin reducir el contrato a una sola variante.
- [x] 5.4 Actualizar `QuoteRequestForm` y sus textos para impedir el envío si no existe una variante completa, mostrar el resumen seleccionado sin precios y preservar la solicitud individual.
- [x] 5.5 Añadir pruebas de snapshot completo para Espejos y otras familias, validación de payload multi-item y ausencia de POST reales en toda la suite.

## 6. Validación y publicación

- [x] 6.1 Ejecutar `npm test` y corregir todas las pruebas de query, normalización, filtros, tarjetas, selección, galería, ficha y presupuesto.
- [x] 6.2 Ejecutar `npm run lint`, `npm run typecheck` y `npm run build`.
- [x] 6.3 Ejecutar `openspec validate --strict` y revisar que cada requisito tenga escenarios verificables.
- [ ] 6.4 Revisar desktop y móvil con el endpoint API disponible, incluyendo navegación, filtros combinados, galería Swing, selectores y ausencia de precios; si el proxy no está configurado, dejar la revisión visual explícitamente bloqueada.
- [x] 6.5 Revisar `git status` y `git diff` para mantener fuera del cambio assets protegidos, SQL no solicitado y modificaciones preexistentes no relacionadas.

## 7. Cesta de presupuesto

- [x] 7.1 Crear provider/store persistente en `localStorage` para líneas completas, con hidratación segura y clave `productId + variantId`.
- [x] 7.2 Añadir `Añadir al presupuesto` en ficha, sumar duplicados y conservar variantes distintas del mismo modelo.
- [x] 7.3 Añadir `QuoteSelectionPage` en `/presupuesto` con listado, cantidades, eliminación, estados vacío/error y formulario conjunto sin precios.
- [x] 7.4 Añadir acceso `Presupuesto (N)` o `Mis selecciones (N)` en landing y header del catálogo.
- [x] 7.5 Añadir pruebas de persistencia, deduplicación, dos variantes independientes y payload conjunto `items[]`.

## 8. Datos de ficha y API

- [x] 8.1 Normalizar `has_led`, `lighting_type`, `lighting_technology`, `light_temp` y sus valores de variante sin derivarlos del slug.
- [x] 8.2 Mostrar datos de iluminación y selección exacta en Alba, Retro/Nova y el snapshot enviado.
- [x] 8.3 Añadir pruebas de versión Básica/Plus, LED, tecnología, temperatura y ausencia honesta cuando el GET no entrega un campo.

## 9. Rediseño visual y validación

- [x] 9.1 Retirar fondos, sombras, paneles y overlays superpuestos a imágenes de tarjetas y galería; conservar proporción A4 y `object-contain`.
- [ ] 9.2 Revisar filtros, tarjetas, masthead y cesta en responsive desktop/móvil sin regresiones GME.
- [x] 9.3 Ejecutar `npm test`, `npm run lint`, `npm run typecheck` y `npm run build` tras la ampliación.
- [x] 9.4 Comprobar por GET configuración, listado y detalle; documentar exactamente los campos/webhooks ausentes.
- [ ] 9.5 Verificar visualmente filtros Espejos, ficha Alba, ficha Retro/Nova, dos variantes en cesta, envío conjunto y tarjetas sin overlays.
