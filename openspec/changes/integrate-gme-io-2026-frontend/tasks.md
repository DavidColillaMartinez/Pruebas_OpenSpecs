## 1. Prerrequisitos y alcance

- [x] 1.1 Registrar `git status` y diff inicial, conservar cambios previos de `src/data/methodSteps.js` y `src/sections/desktop/QuienesSomos.jsx`, y enumerar los archivos estrictamente necesarios; verificar el inventario y explicar/confirmar con el propietario el alcance si supera cinco archivos antes de implementar.
- [x] 1.2 Resolver con el propietario el bloqueo de allowlist del proxy: obtener autorización expresa para habilitar únicamente `catalog_section`, `tap_type`, `installation`, `mechanism`, `series` en el proxy existente, o confirmar actualización por el propietario; verificar que los parámetros llegan al upstream mediante prueba de transporte aislada y mantener esta tarea pendiente hasta resolverlo.
- [x] 1.3 Identificar si el proxy configurado apunta a API real o mock sin modificar ni publicar secretos; registrar disponibilidad y contraste del contrato con los cinco archivos de referencia, verificando que ningún módulo runtime importa el paquete externo.

## 2. Tipos y normalización IO

- [x] 2.1 Preservar los tres criterios API en tarjetas y detalle y añadir helper estricto de alcance IO; verificar pruebas positivas y negativas para Mamparas/GME, GME/griferia sin marca, Royo, Duplach y Espejos.
- [x] 2.2 Extender tipos y normalización de facetas/metadatos IO, conservar variantes, dimensiones y URLs API, y excluir precios/Puntos; verificar tests con selector nulo, referencia nula y valores exactos de acabado.
- [x] 2.3 Crear fixtures mínimos aislados con formato API para los casos IO requeridos, diferenciándolos de evidencia de producción; verificar estructura y cobertura contra matriz y datos revisados sin construir un catálogo runtime paralelo.

## 3. Descubrimiento, filtros y tarjetas

- [x] 3.1 Añadir perfil GME/griferia y claves/etiquetas IO al flujo actual de query y filtros, desambiguando Mamparas; verificar parseo/serialización, transmisión de collection y acabado exacto `Níquel`, ausencia de categorías nuevas y offset cero tras cambios.
- [x] 3.2 Limpiar dependencias al cambiar familia/proveedor y ocultar filtros vacíos o irrelevantes; verificar tests de Duchas→Grifería, GME/griferia→Mamparas y accesibilidad de lavabo/bidé empotrables por instalación/subcategoría.
- [x] 3.3 Reutilizar solicitud/caché de facetas del descubrimiento, permitir facetas con cero resultados y evitar fallback de opciones IO desde páginas locales o llamadas duplicadas; verificar conteos de requests, paginación y prefetch alineado.
- [x] 3.4 Ajustar únicamente tarjetas IO para portada API, nombre corto y omisión de colección redundante, conservando marcos comunes y fallback de error; verificar tests de portada primera, título único, subcategoría y ausencia de precios/Puntos, más regresiones de otras familias.

## 4. Galería completa y configuración comercial

- [x] 4.1 Construir galería IO memoizada con portada primero, fotos de producto y de todas las variantes, deduplicada por URL y con respaldo grande de acabado cuando corresponda; verificar Fiore, portada repetida en images, variantes con fotos compartidas y exclusión de todas las muestras.
- [x] 4.2 Extender la galería actual con activación opt-in por evento/URL manteniendo navegación independiente; verificar portada inicial, flechas/miniaturas, navegación por otros acabados sin cambiar selección, persistencia de imagen al rerender y fallback de imagen existente.
- [x] 4.3 Adaptar el selector actual para derivar exclusivamente unidades IO de variantes reales y relacionar nombres de acabado con metadatos de muestras; verificar Sion sin alto, Paladio sin bidé, combinaciones incompatibles deshabilitadas y bloqueo de añadir sin variante completa.
- [x] 4.4 Mostrar ejes únicos como información y permitir instalación/mecanismo como selectores solo con alternativas intraproducto; verificar duchas de configuración fija y ausencia de combinaciones entre productos.
- [x] 4.5 Incorporar muestras API en controles con nombre accesible y fallback de texto; verificar Iony, Acero cepillado, Persio/Miox y bidé Round/Orion sin confundir muestra, acabado, SKU ni foto grande.
- [x] 4.6 Conectar metadata de cambio manual de acabado a activación de foto grande, conservando galería y sin efectos de selección inicial o cambio de tipo; verificar acabado con imagen, sin imagen, respaldo finish_image_urls, navegación previa y reactivación posterior.
- [x] 4.7 Confirmar que las seis variantes Níquel sin referencia son seleccionables mediante ID real y que Sirio 1 función nunca amplía muestras; verificar tests de ficha y selección sin referencia ni URL inventadas.

## 5. Cesta y solicitud de presupuesto

- [x] 5.1 Enriquecer snapshot IO con proveedor, categoría, modelo, tipo, acabado, instalación/mecanismo, referencia si existe e imagen comercial API, excluyendo precios y muestras; verificar payload camelCase aceptado por el validador existente y equivalencia de campos items[] requeridos, sin POST real.
- [x] 5.2 Conservar identidad producto+variante y estado persistente compartido, incluyendo variantes sin referencia; verificar tests de cantidades, variantes distintas, navegación, recarga y coincidencia entre resumen de catálogo y `/presupuesto`.
- [x] 5.3 Mantener feedback breve al añadir y bloquear selección GME incompleta sin usar modo compacto; verificar test de ausencia de navegación automática, presupuesto inválido sin ID y cesta mixta con Duplach compacto válido.

## 6. Comprobaciones técnicas integradas

- [x] 6.1 Añadir/ejecutar comprobaciones de no regresión de Royo, Duplach, Espejos y Mamparas/GME para filtros, tarjetas, ficha, galería y cesta compartidos; verificar resultados de pruebas existentes y nuevas, incluido GME/griferia sin marca IO.
- [x] 6.2 Ejecutar `npm test`, `npm run lint`, `npm run typecheck` y `npm run build` (test ya usa `vitest run`); registrar resultados exactos y fallos previos ajenos sin corregir páginas fuera de alcance ni marcar éxito si falla una comprobación.
- [ ] 6.3 Comprobar por proxy real accesible `/api/catalog/products?supplier_id=gme&category_id=griferia&include_facets=true&limit=60`, `/api/catalog/products?supplier_id=gme&category_id=griferia&catalog_section=duchas&installation=empotrable&mechanism=termostatico&include_facets=true`, `/api/catalog/products?supplier_id=gme&category_id=griferia&series=Persio&tap_type=lavabo_alto&finish=N%C3%ADquel&include_facets=true` y `/api/catalog/products?supplier_id=gme&category_id=griferia&series=Sion&tap_type=lavabo_alto&include_facets=true`; registrar totales esperados 42/2/1/0, facetas y destino real. Si no es accesible, registrar bloqueo y mantener comprobación real pendiente: fixtures/mock no cuentan como evidencia.
- [ ] 6.4 Contrastar detalles reales por proxy de `/api/catalog/products/gme-fiore`, `/api/catalog/products/gme-persio` y `/api/catalog/products/gme-bide-empotrable-round`, y URLs de imagen accesibles mediante GET/HEAD técnicos; verificar variantes, separación de muestras, límites de snapshot y registrar URL/archivo exacto de fallos sin modificar assets ni usar navegador/capturas/harness.

## 8. Ronda de correcciones del propietario (2026-10-08)

- [x] 8.1 Portada IO: `buildGmeIoGallery` conserva los metadatos API de la portada ya normalizada y una portada sintética recibe `sort_order: 0`; `ProductDetailPage` evita el reordenado en `ProductGallery` para galerías IO (`preserveInputOrder`); verificar portada primera y activa con Rhio (seis fotos, `sort_order` real) y con portada fuera de la galería; el cambio manual de acabado sigue activando su foto y la selección automática no cambia portada.
- [x] 8.2 Resúmenes comerciales: formateador común `quote/model/summary.ts` con campos explícitos por familia, traducción de tipo/instalación/mecanismo, ocultación de URLs, `reference_status`, `catalog_section` y `source_*` manteniéndolos en el snapshot de API; sin `Object.values` genérico ni recortes arbitrarios; medidas equivalentes deduplicadas conservando opciones distintas; serie/modelo no se repite bajo el título; cantidad en su control.
- [x] 8.3 Protección de Modularidad: la etiqueta solo se muestra dentro del alcance Royo ante caché antigua; verificación de que ausencia nunca se convierte en `Normal`.
- [x] 8.4 Configuración fija: Niagara/Suderland muestran su configuración traducida aunque exista una única variante (`Configuración del grifo`, sin selectores).
- [x] 8.5 Confirmación de presupuesto: `createQuoteRequest` exige identificador, estado de éxito (`received|created|accepted`) e `item_count` igual a las líneas enviadas; `/presupuesto` captura las líneas enviadas antes de la limpieza y elimina solo las enviadas; bloques de edición, cantidad, vaciado y eliminación deshabilitados durante el envío; errores por línea para `fields` del proxy y `errors` del upstream; sin reintentos automáticos del POST.
- [x] 8.6 Límites y contrato: tamaño medido en bytes UTF-8 con `TextEncoder` (64 KiB), sin truncado; honeypot `website` solo local (nunca se envía); las líneas no llevan `variantId` y `commercialOfferVariantId` simultáneos; POST de cliente con 15 s de margen sobre el proxy sin modificar GET; 50 líneas y cantidades 1..999 mantenidos.
- [x] 8.7 Contexto y timeouts del chat: `useChatContext` admite valores con guiones bajo y la clave `series` manteniendo claves y longitudes acotadas; proxy 17/21/25/28 s y navegador 20/24/28/31 s con margen sobre el modelo n8n (15/19/23/26) y dentro de `maxDuration` 35; prueba de transporte GME en `server/chat/proxy.test.js`; sin cambios en n8n ni en el flujo del chat.
- [x] 8.8 Pruebas: portada con `sort_order`, cambio manual de acabado con/sin foto, resúmenes sin metadatos, caché antigua de Modularidad, configuración única, contexto de chat, confirmación completa/parcial/erróneas, límite UTF-8, identidad única; suite completa estable (52 archivos, 408 passed, 1 skipped) tras dos ejecuciones.
- [ ] 8.9 Comprobar las 42 portadas asignadas del anexo mediante el proxy real (portada = `main_image_url`/`main_image_path`); registra bloqueo: upstreams locales configurados y `localhost:5173` no accesibles durante la sesión; pendiente de URL de despliegue real del propietario.

## 7. Revisión y entrega

- [x] 7.1 Revisar `git diff`, `git diff --check` y `git status`, contrastar contra el inventario inicial y confirmar que no hay cambios propios en landing, chatbot, páginas ajenas, SQL, n8n, VPS ni imágenes; verificar que los dos archivos previos del usuario siguen fuera del staging de esta tarea.
- [x] 7.2 Entregar informe técnico con archivos, funcionalidades, resultados de comandos, API real frente a fixtures y bloqueos; verificar que declara explícitamente revisión visual a cargo del propietario y no afirma aceptación visual ni assets publicados sin evidencia.
- [x] 7.3 Obtener revisión manual del propietario del comportamiento afectado antes del commit conforme a AGENTS.md, sin abrir navegador ni generar capturas; verificar confirmación expresa y mantener pendiente hasta que exista.
- [x] 7.4 Tras gates de entrega resueltos, inspeccionar status/diff/historial, stage explícito únicamente de cambios propios y crear commit descriptivo de esta tarea; verificar hash y lista de archivos del commit sin artefactos de build ni cambios ajenos.
- [x] 7.5 Hacer push a la rama de trabajo actual solicitado por el propietario y entregar hash y resultado; verificar salida del push y estado de rama, dejando pendientes cualquier bloqueo real o aceptación que aún no haya sido confirmada.
