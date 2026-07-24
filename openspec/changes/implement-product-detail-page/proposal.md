## Why

AREA LRMQ necesita una página de producto funcional, enlazable y recargable que consuma el catálogo público real y permita solicitar presupuestos con una selección válida. El repositorio actual solo contiene una landing Vite sin router ni capa API; el upstream de detalle ya responde con datos reales, pero debe quedar oculto tras una ruta pública de aplicación antes de construir la ficha.

## What Changes

- Añadir React Router sobre la aplicación Vite y separar la landing de una ruta estable `/productos/:slug`, con navegación desde el catálogo, recarga directa, retorno y estado de ruta no encontrada.
- Exponer rutas públicas relativas `/api/catalog/...` mediante proxy de la aplicación; el navegador no consumirá URLs n8n ni verá `/webhook` o el webhookId.
- Centralizar la configuración privada del upstream n8n en variables de entorno server-side y reutilizar el proxy para detalle, listado y presupuesto.
- Derivar `ProductDetail` de una respuesta real de `catalog-api-v1`; la implementación queda bloqueada hasta que `LRMQ Obtener Producto` responda `200` para un slug devuelto por el listado.
- Implementar todos los estados funcionales de la ficha: carga, producto válido, ausencia de variantes o imágenes, campos opcionales ausentes, `404`, red, `5xx` y contrato inválido.
- Renderizar únicamente información pública presente, con galería resiliente, documentos condicionales, metadatos básicos, semántica accesible y estructura responsive mínima sin cerrar el diseño visual.
- Derivar variantes y ofertas seleccionables exclusivamente de combinaciones reales, elegir una selección inicial determinista y actualizar referencia, medios, atributos y oferta según la selección.
- Implementar el formulario completo de solicitud de presupuesto contra n8n, incluyendo snapshot de variante, límites, consentimiento, honeypot, prevención de doble envío y respuestas `201`, `400`, `429`, red y `5xx`.
- Añadir una base de pruebas ligera compatible con Vite para normalización, errores, selección, payload y navegación, además de scripts reproducibles de lint, tipos, pruebas y build.
- No añadir backend propio, acceso directo a PostgreSQL, cambios de catálogo, ecommerce, pago ni reglas de negocio no confirmadas por la API.

## Capabilities

### New Capabilities
- `catalog-api-proxy`: Proxy server-side para reenviar rutas públicas relativas a los workflows internos de n8n sin exponer sus URLs.
- `product-api-client`: Configuración pública relativa, contratos, normalización, resolución de activos y clasificación de errores para las rutas `/api/catalog`.
- `product-detail-page`: Ruta por slug, navegación, estados de petición, contenido público, metadatos, accesibilidad y comportamiento responsive de la ficha.
- `product-variant-selection`: Selección inicial y cambio entre variantes, ofertas y combinaciones válidas sin generar posibilidades inexistentes.
- `product-media-gallery`: Resolución y selección determinista de imágenes generales o de variante, deduplicación, alt text y fallback resiliente.
- `product-quote-request`: Construcción, validación y envío del presupuesto vinculado al producto y a la selección, con todos los estados HTTP exigidos.

### Modified Capabilities

Ninguna. `openspec/specs/` no contiene capacidades canónicas existentes que deban modificarse.

## Impact

- Código: bootstrap y shell de rutas, landing actual, header/drawer, tarjetas de catálogo, nueva capa API y nuevos componentes de producto/presupuesto.
- Dependencias: React Router y una infraestructura mínima de pruebas/tipado o validación compatible con Vite; se evitarán dependencias de estado global o UI innecesarias.
- API upstream privada: workflows n8n configurados por variables `N8N_CATALOG_*_UPSTREAM_BASE_URL`; actualmente el detalle verificado responde `200` para `mt-espejos-alba` y `royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17`.
- API pública de aplicación: `/api/catalog/config`, `/api/catalog/products`, `/api/catalog/products/:slug` y `/api/catalog/quote-requests`.
- Backend/n8n: no se modificarán workflows; el frontend no implementará ni duplicará su lógica.
- Despliegue: la SPA requerirá rewrite de rutas hacia `index.html` y una función/API route server-side para `/api/catalog/*`; no existe configuración de despliegue en el repositorio y se añadirá la convención Vercel documentada.
- Calidad: se incorporarán pruebas y comandos reproducibles sin rediseñar la landing ni migrar a Next.js.
