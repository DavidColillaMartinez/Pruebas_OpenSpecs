## Why

La API de GME IO 2026 ya contiene 42 productos y 362 variantes, pero la tienda existente necesita reconocer sus facetas, separar imágenes comerciales y de selector, y conservar la variante real en el presupuesto. Integrar ese contrato en el frontend permite utilizar el catálogo publicado sin duplicar datos ni alterar otros proveedores.

## What Changes

- Aplicar reglas específicas únicamente a productos con `supplier_id=gme`, `category_id=griferia` y `specs.gme_io_2026=true`, preservando los tres criterios tras normalización.
- Incorporar filtros paginados de familia (`catalog_section`), serie (`collection`), tipo, instalación, mecanismo, acabado y subcategoría desde facetas del servidor, con limpieza de dependencias y reinicio de offset.
- Conservar las tarjetas comunes, portada API, imagen completa y nombre corto; evitar repetir colección y excluir precios/Puntos.
- Construir una galería completa deduplicada: portada, imágenes de producto y fotos grandes de variantes. Mantener navegación e imagen activa independientes de la selección comercial; activar fotos solo al cambiar manualmente acabado y si existen.
- Derivar opciones y combinaciones exclusivamente de variantes reales; usar muestras solo en selectores y texto cuando falten; permitir variantes reales sin referencia.
- Reutilizar cesta persistente y `/presupuesto`, con identidad producto + variante y snapshots completos sin precios, manteniendo el contrato de solicitud existente.
- Añadir pruebas técnicas y no regresión de Royo, Duplach, Espejos y Mamparas/GME; comprobar API real por el proxy cuando sea accesible, sin navegador ni capturas. La revisión visual y la subida de assets corresponden al propietario.

## Capabilities

### New Capabilities

- `gme-io-catalog-discovery`: alcance IO, filtros remotos, facetas dependientes, paginación y tarjetas comunes.
- `gme-io-product-configuration`: galería completa, muestras separadas y selección de variantes reales.
- `gme-io-quote-integration`: cesta persistente y snapshots de variantes GME para solicitudes sin precios.

### Modified Capabilities

Ninguna: `openspec list --specs` no encuentra especificaciones principales existentes.

## Impact

- Código previsto: `src/features/catalog/{model,api,components,pages}` y `src/features/quote/{model,components,pages}`, exclusivamente módulos y pruebas necesarios. Reutilizar rutas, caché, descubrimiento y estado compartido existentes; sin dependencias nuevas previstas.
- Referencias revisadas en `/media/test/Program/Downloads/switch/gme-griferia-io-2026-final`: `products.json`, `taxonomy-filters.json`, `variant-matrix.csv`, `image-manifest.json`, `covers-v2.csv`. Son documentación de contraste y pruebas, nunca fuente de catálogo en runtime. La API prevalece sobre IDs nulos, categorías de paquete y rutas locales.
- Bloqueo identificado: `server/catalog/proxy.js` no permite `catalog_section`, `tap_type`, `installation`, `mechanism` ni `series`. Resolver requiere autorización expresa para ampliar esa allowlist existente o que el propietario la actualice; no se autoriza aquí otro backend ni cambios n8n.
- Quedan fuera landing, chatbot, páginas ajenas, SQL, base de datos, n8n, VPS y archivos de imagen. Conservar cambios previos en `src/data/methodSteps.js` y `src/sections/desktop/QuienesSomos.jsx`.
- Commit y push de implementación solo al cerrar comprobaciones y revisar el diff, incluyendo únicamente cambios propios. La propuesta no constituye implementación ni evidencia de aceptación visual.
