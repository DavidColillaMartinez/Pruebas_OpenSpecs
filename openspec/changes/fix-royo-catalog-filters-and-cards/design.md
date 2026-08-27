## Context

La integración Royo ya dispone de un perfil de filtros, normalización de modularidad y una tarjeta común, pero el perfil solo se activa cuando están seleccionados simultáneamente proveedor y categoría. Por eso una entrada directa a `category=muebles-y-lavabos` cae en los filtros generales. Además, `CatalogProductCard` sigue usando `product.name` como título y deja que el bloque textual tenga altura natural, de modo que el modelo Royo puede repetirse o quedar desalineado con otras tarjetas.

El cambio es frontend-only y debe aprovechar el cliente, el normalizador, la caché de facetas y la plantilla de tarjeta existentes. No se modificarán landing, Vision, assets, API, backend, base de datos, n8n, rutas de infraestructura ni datos recibidos.

## Goals / Non-Goals

**Goals:**

- Activar el perfil Royo para la categoría exacta `muebles-y-lavabos` cuando el proveedor esté vacío o sea únicamente `royo`.
- Desactivar el perfil Royo para proveedores ajenos, proveedores múltiples o contextos incompletos.
- Mantener las claves Royo en el orden `modularity`, `collection`, `subcategory`, `finish`, `measure`, `product_kind`, seguidas de Categoría y Proveedor.
- Conservar URL, conteos de facetas, fallback desde productos normalizados y peticiones servidor sin filtrar la página en React.
- Limpiar filtros incompatibles al cambiar de contexto sin perder el comportamiento existente de Espejos, Mamparas/GME y otros proveedores.
- Usar el modelo entregado por API como título Royo y mostrar `Modular` o `Normal` como metadato independiente.
- Reservar el mismo bloque de imagen y texto para todas las tarjetas del catálogo, sin alterar imágenes ni proporciones de contenido.
- Cubrir el comportamiento con tests unitarios y de componentes, además de las validaciones del proyecto.

**Non-Goals:**

- Cambiar el contrato del backend, el proxy, la base de datos, n8n, assets o dependencias.
- Derivar modelo, modularidad, filtros o imágenes desde slug, nombre, URL, nombre de archivo o texto de interfaz.
- Crear facetas o valores que no entregue la API ni produzca el fallback normalizado existente.
- Modificar `product.name` o la presentación de datos de Espejos, Mamparas/GME y otros proveedores.
- Realizar capturas, pruebas de navegador o comprobaciones visuales.

## Decisions

### 1. Predicado específico para el contexto de catálogo Royo

Se añadirá o ajustará un predicado de catálogo que normalice los filtros y devuelva verdadero cuando la categoría sea exactamente `muebles-y-lavabos` y la lista de proveedores esté vacía o contenga únicamente `royo`. El guard estricto de producto, que exige proveedor y categoría para reglas de detalle, no se reutilizará de forma que bloquee el caso de categoría sin proveedor.

Con proveedor diferente de Royo, con más de un proveedor o sin la categoría exacta, el perfil será el de la familia ajena o el general. Esto evita enviar modularidad y filtros exclusivos de Royo a proveedores que no los soportan. `pruneCatalogFilters` usará el mismo contexto para retirar filtros que ya no pertenecen al perfil activo.

Alternativas descartadas:

- Activar Royo por nombre visible, slug o marca: no representa el contrato de filtros.
- Activarlo cuando la categoría sea parcial o cuando figure Royo entre varios proveedores: aplicaría reglas Royo a productos ajenos.
- Mantener el requisito de proveedor seleccionado: reproduce el defecto de entrada directa por categoría.

### 2. Orden y serialización gobernados por el perfil

El perfil Royo declarará las claves específicas en el orden normativo y el panel combinará después las claves raíz `category` y `supplier`. Las funciones de serialización y construcción de peticiones conservarán los filtros seleccionados en la URL y enviarán los cambios al endpoint. `modularity` solo se serializará dentro del contexto Royo de catálogo; las claves compartidas como `finish` seguirán perteneciendo al perfil activo y no se conservarán si `pruneCatalogFilters` determina que son incompatibles.

No se añadirá un filtrado posterior de productos en React. La página mostrará exactamente los elementos, paginación y conteos devueltos por la consulta activa.

Alternativas descartadas:

- Filtrar localmente los productos ya cargados: rompería paginación, total y conteos de servidor.
- Ordenar grupos según el orden de la respuesta: produciría una UI inestable y no garantizaría Modularidad como primer filtro.
- Enviar todos los campos Royo a cualquier proveedor: contaminaría contratos existentes.

### 3. Facetas de servidor con fallback normalizado

La carga de facetas seguirá priorizando las facetas de la API. Cuando falten, la caché de descubrimiento recorrerá el universo permitido y usará `deriveCatalogFacets` sobre productos normalizados. El fallback solo podrá generar valores observados en esos productos; no completará tipos de presentación, medidas, modelos o modularidades ficticias.

El panel filtrará únicamente opciones con conteo positivo o seleccionadas, por lo que una opción seleccionada con conteo cero permanecerá visible. Se añadirán casos para respuestas parciales, facetas ausentes y conteos reales.

### 4. Título Royo y metadato de modularidad

El normalizador expondrá `collection` y, si el contrato ya entrega uno, el campo explícito de modelo sin transformarlo. La tarjeta usará el modelo API como título solo dentro del contexto Royo; si el contrato no entrega un modelo utilizable, no se fabricará uno desde `name` o `slug` y se conservará el fallback de datos existente hasta que el contrato lo aporte.

La modularidad se convertirá únicamente mediante la correspondencia cerrada `modular` → `Modular` y `normal` → `Normal`, en una línea separada. El modelo no se repetirá bajo el título. Las tarjetas de otras familias mantendrán su título y metadatos actuales.

### 5. Plantilla estructural única de tarjeta

`CatalogProductCard` mantendrá un único bloque de imagen con la proporción estándar existente y `object-contain`, sin ramas Royo. El bloque textual tendrá una altura mínima común suficiente para título, modularidad y metadatos permitidos, con el mismo flujo y alineamiento para todas las tarjetas. No se recortarán ni reencodificarán imágenes y no se calculará el marco según su aspecto natural.

Alternativas descartadas:

- Añadir una plantilla horizontal exclusiva para modulares Royo: rompe la comparación entre tarjetas.
- Usar `line-clamp` como solución principal: podría ocultar el modelo o la modularidad.
- Cambiar el tamaño de la imagen para compensar títulos: altera la cuadrícula y el contenido visual.

### 6. Verificación y alcance

Los tests cubrirán query/profile, URL y petición, facetas API/fallback, limpieza al cambiar proveedor, títulos, modularidad y clases estructurales. Se conservarán tests de Espejos, Mamparas/GME y otros proveedores. La revisión final comprobará el listado de archivos para excluir landing, Vision, assets y backend.

## Risks / Trade-offs

- [La API no entrega `collection` o una faceta específica] → Mantener el valor ausente como opcional, documentar endpoint y campo, y no derivar un sustituto.
- [El proveedor vacío se interpreta como catálogo global] → Aplicar el perfil Royo solo con la categoría exacta y mantener el guard de proveedores múltiples.
- [Filtros Royo antiguos sobreviven al cambio de proveedor] → Ejecutar `pruneCatalogFilters` contra el perfil recalculado y probar los cambios de URL.
- [La derivación de facetas oculta una diferencia entre página y universo] → Mantener la preferencia por facetas API y usar el fallback solo cuando falten.
- [La altura textual común no cubre combinaciones largas] → Reservar espacio para todas las líneas permitidas y verificar títulos de una y varias líneas mediante tests estructurales.
- [Un cambio compartido afecta familias existentes] → No introducir ramas en normalización de datos ajenos y ejecutar la regresión completa.

## Migration Plan

1. Revisar el perfil actual, el guard de catálogo, la serialización, la caché de facetas, el normalizador y la tarjeta.
2. Implementar el contexto Royo por categoría y ajustar limpieza, orden, etiquetas y peticiones.
3. Añadir o corregir la derivación de facetas únicamente desde datos API normalizados.
4. Adaptar título, metadato y estructura común de tarjetas sin modificar datos de API.
5. Añadir tests positivos y negativos, incluyendo otros proveedores y ausencia de facetas.
6. Ejecutar `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`, revisar diff/status y confirmar que no hay cambios fuera del alcance.
7. Crear el commit descriptivo y hacer push a la rama actual.

Rollback: retirar el predicado de categoría, las claves Royo y los cambios de título/altura, conservando el comportamiento previo de catálogo. No hay migración de datos ni cambios de infraestructura.

## Open Questions

- ¿La API entrega algún campo explícito de modelo distinto de `collection` en todos los listados Royo?
- ¿Las respuestas de categoría sin proveedor incluyen todas las facetas Royo o requieren siempre el fallback normalizado?
- ¿Existe algún proveedor no Royo que use `muebles-y-lavabos` y requiera una regla de exclusión adicional basada en la API?
