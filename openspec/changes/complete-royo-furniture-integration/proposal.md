## Why

La integración frontend de los muebles de baño Royo todavía no cubre de forma completa la separación entre muebles modulares y normales, la selección de variantes reales, ni la continuidad de la galería y del presupuesto. La base de datos, el proxy y los workflows ya están preparados; ahora hace falta consumir ese contrato sin inventar combinaciones, rutas de imágenes ni datos comerciales.

## What Changes

- Limitar la integración a `supplier_id=royo` y `category_id=muebles-y-lavabos`, sin alterar la landing, otras familias, otros proveedores, backend, SQL, n8n, VPS ni assets.
- Añadir al listado de Royo un primer filtro Modular/Normal que envíe `modularity=modular|normal` al proxy y preserve los filtros existentes de Espejos, Mamparas/GME y demás proveedores.
- Consumir `modularity`, portadas, galería, `specs.modular_notice`, `specs.module_configuration`, `specs.finish_image_map`, variantes y atributos únicamente desde la API.
- Completar la ficha de muebles modulares y normales con selectores basados exclusivamente en combinaciones reales, incluyendo tipos de presentación cuando la API los entregue.
- Mantener la portada y la galería recibidas por API; ante una imagen rápida de acabado, mostrarla primero sin sustituir ni ocultar `product.images`.
- Mantener la imagen activa cuando un acabado no tenga correspondencia inequívoca y conservar el acabado seleccionado para el presupuesto.
- Integrar todos los muebles Royo con la cesta genérica existente, persistiendo líneas por `productId + variantId`, cantidades, atributos reales y sin precios.
- Hacer que el resumen del catálogo y `/presupuesto` compartan el mismo estado y que el payload final envíe todas las líneas en `items[]` sin navegación automática tras añadir.
- Añadir pruebas unitarias y de componentes para filtros, API, galería, variantes, cesta, payload y no regresión de familias ajenas.
- Documentar cualquier campo ausente indicando el endpoint y mantenerlo como `undefined` o `null`, sin derivaciones ni fixtures usados como prueba de producción.

## Capabilities

### New Capabilities

- `royo-furniture-catalog`: Listado Royo limitado por proveedor y categoría, filtro de modularidad enviado a API y preservación de filtros de otras familias.
- `royo-furniture-detail`: Ficha Royo con variantes reales, galería completa, portadas API y atajos de imágenes de acabados o tipos sin combinaciones ficticias.
- `royo-furniture-budget`: Selección persistente de muebles Royo en la cesta genérica, resumen compartido, edición en `/presupuesto` y payload sin precios.

### Modified Capabilities

Ninguna. `openspec/specs/` no contiene capacidades canónicas existentes que deban modificarse.

## Impact

- Código potencialmente afectado: listado y ficha del catálogo, hooks, tipos, normalizadores, componentes compartidos de variantes/galería, store de selección, resumen y `/presupuesto`, además de sus tests relacionados.
- API consultada mediante el proxy existente: `/api/catalog/products?category_id=muebles-y-lavabos&supplier_id=royo&modularity=modular`, `/api/catalog/products?category_id=muebles-y-lavabos&supplier_id=royo&modularity=normal` y `/api/catalog/products/royo-modular-logika`.
- No se modificará el backend ni se reconstruirán URLs: `main_image_url`, `main_image_path`, `images` y las imágenes asociadas se usarán tal como las entregue la API.
- No se mostrarán ni calcularán precios. La validación se limitará a comportamiento, tests, API, lint, typecheck, build y revisión del diff; no incluye capturas, harness visual ni Firefox.
