## Why

La categoría `muebles-y-lavabos` no activa actualmente los filtros específicos de Royo hasta que el usuario selecciona también el proveedor, lo que oculta opciones válidas al entrar directamente en la categoría. Además, las tarjetas Royo pueden presentar títulos y proporciones distintas al resto del catálogo, dificultando comparar modelos y modularidad; este cambio corrige ambos problemas sin alterar la API ni la landing.

## What Changes

- Activar el perfil de filtros Royo cuando `category=muebles-y-lavabos`, con o sin `supplier=royo`, usando las facetas reales entregadas por API o derivadas mediante el fallback normalizado.
- Mostrar en el orden definido los filtros `modularity`, `collection`, `subcategory`, `finish`, `measure` y `product_kind`, junto con Categoría y Proveedor.
- Mantener los filtros en la URL y enviar cada cambio al catálogo; no aplicar filtrado Royo únicamente en React ni enviar parámetros Royo a proveedores ajenos.
- Limpiar filtros específicos incompatibles al cambiar proveedor y conservar las opciones seleccionadas aunque su conteo sea cero.
- Mostrar en tarjetas Royo únicamente el modelo API (`collection` o el campo explícito equivalente) como título y la modularidad como metadato independiente.
- Aplicar una estructura común de imagen y texto a todas las tarjetas, con proporción `object-contain`, altura reservada y alineamiento uniforme sin modificar imágenes ni datos.
- Añadir tests de filtros, facetas, URLs, peticiones, títulos, modularidad, estructura de tarjetas y no regresión de otros proveedores.
- No modificar backend, base de datos, n8n, assets, landing ni `product.name`.

## Capabilities

### New Capabilities

- `royo-catalog-filters`: Perfil de filtros Royo activado por categoría, con consultas y facetas gobernadas por API.
- `catalog-card-presentation`: Títulos y plantilla de tarjetas de catálogo consistentes, incluyendo la presentación Royo de modelo y modularidad.

### Modified Capabilities

Ninguna. `openspec/specs/` no contiene capacidades canónicas existentes que deban modificarse.

## Impact

- Código afectado: `src/features/catalog/model/catalogQuery.ts`, `useCatalogDiscovery.ts`, `normalize.ts`, `CatalogFilterPanel.tsx`, `CatalogProductCard.tsx` y sus tests.
- Se podrán ajustar tipos normalizados únicamente para consumir campos de modelo o facetas ya entregados por la API.
- No se requieren cambios de API, proxy, rutas, base de datos, migraciones, assets ni dependencias externas.
- La validación será mediante `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, revisión de diff y comprobación de estado git; no incluye capturas ni pruebas de navegador.
