## Context

El commit `7148f4a` añadió la cesta persistente y una superficie visual más minimalista, pero también sustituyó el header anterior del catálogo. La implementación actual reconoce perfiles de Espejos y Mamparas, pero el selector genérico todavía debe distinguir entre campos configurables y datos técnicos, y el resumen de selecciones solo existe como página final, no como ayuda durante la navegación.

La API actualizada proyecta directamente `shape`, `has_led`, `lighting_type`, `lighting_technology` y sus facetas desde JSONB. El listado conserva la ruta pública y el detalle usa el upstream UUID configurado en `.env.example`. Este cambio consume esos valores desde React y no modifica la proyección, n8n, Neon, PostgreSQL ni Supabase.

## Goals / Non-Goals

**Goals:**

- Recuperar mediante comparación Git el header pre-cesta, preservando el contador como una acción secundaria.
- Normalizar visualmente imágenes A4 sin recorte, deformación, paneles, overlays ni saltos de altura.
- Convertir la selección de variantes en una capa genérica basada en `configuration_fields`, atributos públicos y variantes reales, manteniendo las reglas específicas de GME como datos/configuración y no como flujo exclusivo de Espejos.
- Mantener una selección completa y persistente, mostrar un resumen contextual durante el catálogo y enviar el mismo contrato desde la revisión conjunta.
- Consumir por frontend las facetas y campos de Espejos almacenados, sin convertir un campo ausente en `false` ni derivarlo del slug.
- Usar el GET de detalle configurado y comprobar dos Espejos y un GME mediante sus slugs publicados.
- Eliminar `Accesorios de baño` de fixtures, expectativas y contenido frontend obsoleto sin modificar la publicación backend.
- Validar código, contratos, integración API/DB disponible, lint, typecheck y build sin capturas ni revisión visual automatizada.

**Non-Goals:**

- No capturar pantallas, abrir navegadores para inspección visual ni automatizar una revisión visual; la revisión visual queda a cargo del propietario.
- No ejecutar SQL, migraciones, cambios de Neon/PostgreSQL/Supabase/n8n/VPS ni re-encoding de imágenes.
- No eliminar productos de otras categorías por coincidencias parciales de texto.
- No introducir precios, checkout, pagos ni modificar el contrato de presupuesto para incluir importes.
- No usar fixtures frontend como prueba de que la API de producción funciona.

## Decisions

### Recuperación Git del header

Antes de editar se comparará `CatalogMasthead` actual con la versión del commit padre de la implementación de la cesta y con el commit que introdujo el header original. Se recuperará la estructura, spacing, imagen y jerarquía válida mediante un patch mínimo. El contador se añadirá como `QuoteSelectionLink` secundario, sin convertirlo en un bloque protagonista ni cambiar navegación/filtros.

Alternativa considerada: rediseñar nuevamente el header desde cero. Se descarta porque contradice la fuente de verdad histórica y puede reintroducir regresiones visuales.

### Normalización estable de imágenes

El listado y la galería reservarán una caja con proporción basada en A4 y centrarán las URLs API con `object-contain`. La tarjeta no aplicará nombres de archivo derivados ni un fondo decorativo; el nombre y atributos vivirán fuera de la caja de imagen. `onError` conservará la altura reservada y mostrará un estado discreto.

Alternativa considerada: normalizar todas las imágenes con `object-cover` o reencuadrar el WebP. Se descarta porque recorta páginas completas y altera media proporcionada por el proveedor.

### Selector genérico de variantes

La capa de selección recibirá un producto normalizado y calculará unidades completas desde sus variantes. Solo las claves declaradas en `configuration_fields` y con más de un valor real se renderizarán como botones. Las claves presentes como información técnica se mostrarán en especificaciones, no como controles. La elección de una opción filtrará unidades compatibles y, si la combinación exacta deja de existir, elegirá la primera unidad completa por `sort_order`.

Las reglas GME de acabado/distribución se conservarán como una estrategia de compatibilidad de familia. No se introducirá una rama `if espejo` para construir líneas: todas las familias pasarán por la misma identidad y snapshot, con labels/configuración provenientes de API.

Alternativa considerada: crear un selector separado para Espejos y otro para cada familia. Se descarta porque duplica resolución de variantes y permite que una familia envíe productos genéricos o combinaciones inexistentes.

### Selección persistente y resumen contextual

El store versionará su formato de `localStorage`, validará al hidratar `productId`, `variantId`, referencia, nombre, cantidad y atributos, y descartará entradas antiguas incompatibles. La clave de deduplicación será `productId + variantId`; un cambio de variante producirá otra línea. Cada línea incluirá proveedor, categoría, imagen principal y snapshot completo para que la revisión no dependa de una nueva llamada de detalle.

En desktop, `CatalogPage` usará tres columnas solo cuando el ancho lo permita: filtros, resultados y resumen compacto sticky. El resumen no duplicará la página final y tendrá acciones de cantidad/eliminación. En tablet/móvil se convertirá en una barra/botón que abre un panel con foco gestionado, cierre Escape, scroll propio y retorno de foco.

Alternativa considerada: navegar automáticamente a `/presupuesto` después de cada adición. Se descarta porque interrumpe la exploración y contradice el objetivo del resumen contextual.

### Contrato API y detalle

El frontend conservará los campos directos del contrato actualizado: `shape`, `has_led`, `lighting_type`, `lighting_technology`, sus facetas y los campos equivalentes de la variante. La ruta del navegador seguirá siendo `/api/catalog/products/:slug`; el proxy server-side ya usa `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL` con el upstream UUID y añade `/products/:slug`.

La normalización distinguirá `undefined` de `false`: solo un booleano explícito de API producirá `hasLed`. Los campos de variante (`measure`, `dimension`, `finish`, `lighting_technology`, `light_temp`, `version`, etc.) tendrán precedencia sobre datos de producto; si faltan, la UI los omitirá.

Alternativa considerada: completar la respuesta con `false`, textos genéricos o datos del manifiesto en frontend. Se descarta porque falsear la ausencia puede filtrar productos incorrectos y el manifiesto no sustituye el contrato público.

### Contenido frontend obsoleto

Se eliminará `Accesorios de baño` únicamente de `src/data/categories.js`, fixtures y expectativas frontend cuando aparezca como contenido público. No se aplicará una blacklist para reescribir respuestas API ni se modificará la publicación backend.

### Validación sin revisión visual automatizada

Se añadirán tests de comportamiento para header, filtros, selector real, cesta, payload, persistencia, API normalizada e integridad de media. La entrega ejecutará `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y las suites API/DB disponibles. No se incluirán capturas ni harness visual en el flujo.

## Risks / Trade-offs

- [Riesgo] Un consumidor usa un campo antiguo o un slug incorrecto. → Mitigación: mantener la ruta pública, probar el upstream UUID configurado y usar únicamente slugs publicados por el listado.
- [Riesgo] La capa genérica puede romper combinaciones GME existentes. → Mitigación: conservar fixtures GME, tests de selección exacta y pruebas de regresión del panel.
- [Riesgo] Datos viejos de `localStorage` pueden perderse. → Mitigación: versión explícita, validación por línea y migración solo cuando el snapshot cumple el contrato nuevo.
- [Riesgo] La API todavía puede publicar `Accesorios de baño`. → Mitigación: eliminar solo contenido frontend obsoleto y no afirmar que el frontend cambia la publicación backend.
- [Riesgo] Imágenes A4 con tamaños distintos pueden producir cajas desiguales. → Mitigación: wrapper de ratio fijo, contain, dimensiones API y fallback que no altera la caja.

## Migration Plan

1. Comparar header y componentes de imagen contra el historial Git y registrar los archivos objetivo.
2. Ejecutar auditoría GET de configuración/listado/detalle usando el contrato actualizado y el upstream UUID configurado.
3. Consumir los campos directos de API en normalización, filtros, ficha y snapshots.
4. Implementar y probar la capa genérica de variantes, resumen contextual, persistencia y payload conjunto.
5. Eliminar fixtures, expectativas y contenido frontend obsoleto de `Accesorios de baño`.
6. Ejecutar tests, lint, typecheck y build. No realizar capturas ni revisión visual automatizada.

Rollback: revertir solo el commit frontend del cambio sin tocar assets, API, n8n, base de datos ni modificaciones preexistentes.

## Open Questions

- ¿Debe el proveedor/categoría de cada línea de cesta proceder de campos directos del API o de un contrato de catálogo ya versionado?
