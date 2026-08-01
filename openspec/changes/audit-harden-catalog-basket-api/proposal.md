## Why

La cesta de presupuesto ya existe, pero la experiencia posterior necesita una auditoría funcional y de diseño antes de considerarse estable. El header del catálogo perdió su jerarquía anterior, la selección de variantes todavía debe ser genérica para todas las familias y el frontend debe consumir el contrato API actualizado sin inventar datos.

## What Changes

- Recuperar desde Git el header de catálogo anterior a la cesta e integrar discretamente el contador de selecciones sin revertir la cesta.
- Normalizar visualmente tarjetas y galerías sin fondos, overlays, recortes ni deformaciones, manteniendo proporción A4, `object-contain` y alturas estables.
- Corregir la visibilidad de los selectores de medida para que solo existan cuando hay alternativas comerciales reales y variantes completas.
- Generalizar la selección y `Añadir al presupuesto` para Espejos, GME/Mamparas y cualquier familia publicable con atributos reales de API.
- Añadir el resumen persistente de selecciones dentro del catálogo, con edición de cantidades, eliminación y acceso a `/presupuesto`.
- Mejorar `/presupuesto` como revisión conjunta de líneas completas, sin precios ni dobles envíos.
- Consumir la proyección actualizada de facetas/campos de Espejos, sin convertir ausencias en `false` ni inventar valores.
- Usar el upstream de detalle configurado y comprobar slugs de listado, dos Espejos y un GME sin modificar el backend.
- Eliminar fixtures, expectativas y contenido frontend obsoleto de `Accesorios de baño`, sin SQL, migraciones, n8n ni cambios de publicación.
- Mantener URLs de imágenes provenientes de API y estados de carga/error sin layout shift.

## Capabilities

### New Capabilities

- `catalog-header-and-minimal-imagery`: Header recuperado, tarjetas, galería A4 y composición responsive sin superficies innecesarias.
- `generic-catalog-variant-selection`: Selección de variantes real y genérica para todas las familias publicables.
- `catalog-selection-summary`: Resumen lateral/tablet/móvil sincronizado con la cesta persistente y `/presupuesto`.
- `espejos-api-data-contract`: Facetas y características LED/iluminación proyectadas por API y normalizadas sin inferencias.
- `catalog-detail-api-routing`: Contrato operativo del GET de detalle y comprobaciones de slugs/categorías.
- `accessories-bathroom-retirement`: Limpieza de fixtures, expectativas y contenido frontend obsoleto de Accesorios de baño.
- `catalog-media-integrity`: URLs API, proporciones, carga estable y fallback de imágenes.

### Modified Capabilities

<!-- No existen specs principales en openspec/specs/; las capacidades actuales se expresan como nuevos contratos de este cambio. -->

## Impact

- Frontend: header y navegación, `CatalogPage`, `CatalogMasthead`, `CatalogProductCard`, `CatalogFilterPanel`, `ProductGallery`, `ProductVariantSelector`, `ProductDetailPage`, selección genérica y componentes de presupuesto.
- Estado/persistencia: provider/store de selección, migración segura de `localStorage` y resumen responsive.
- API/n8n: consumo frontend del contrato actualizado de listado y detalle mediante las rutas públicas existentes; no se modificarán workflows ni proyecciones.
- Base de datos: fuera de alcance. No se ejecutarán SQL, migraciones, cambios de publicación ni borrados.
- Tests y validación: unitarios, integración API/base de datos disponible, `npm test`, lint, typecheck y build. No se realizarán capturas ni revisiones visuales automatizadas.
- Media: solo URLs entregadas por API, sin renombrar, re-encodear ni alterar imágenes del VPS.
