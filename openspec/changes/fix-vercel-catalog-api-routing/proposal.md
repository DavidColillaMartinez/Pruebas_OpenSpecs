## Why

El deployment `35499b5` sirve correctamente la SPA, pero el catch-all `api/catalog/[...path].js` no se resuelve de forma estable en Vercel: configuracion y listado responden `405`, y el detalle responde con un `404` de plataforma. Se necesitan funciones fisicas que coincidan exactamente con las cuatro rutas publicas del catalogo, sin cambiar el contrato del frontend ni exponer los upstreams n8n.

## What Changes

- Sustituir el catch-all del catalogo por endpoints Vercel explicitos para `/api/catalog/config`, `/api/catalog/products`, `/api/catalog/products/:slug` y `/api/catalog/quote-requests`.
- Extraer la seleccion de upstream, validacion de metodo, forwarding, timeout, headers y normalizacion de respuestas a un modulo server-side compartido.
- Mantener exactamente las cuatro variables server-side confirmadas y las bases separadas de listado y detalle.
- Conservar el cliente frontend relativo bajo `/api/catalog/*`, sin incluir URLs n8n, `webhook`, `webhookId` ni nombres de variables server-side en el bundle.
- Mantener la conversion del detalle inexistente desde `200 PRODUCT_NOT_FOUND` upstream a `404 PRODUCT_NOT_FOUND` publico.
- Reemplazar las pruebas centradas en `request.query.path` por pruebas que importen y ejecuten los handlers de las rutas fisicas con la forma de request que reciben en Vercel.
- Verificar localmente tests, lint, typecheck, build e instalacion reproducible; despues de configurar la cuarta variable y desplegar, auditar solo mediante GET configuracion, listado, dos slugs validos y un slug inexistente.
- No ejecutar ningun POST real de presupuesto y no modificar diseño, navegacion, datos, media ni otras funcionalidades.

## Capabilities

### New Capabilities
- `vercel-catalog-api-routing`: rutas serverless explicitas y estables del catalogo, delegacion compartida, secreto de upstreams, normalizacion publica y verificacion con requests reales de Vercel.

### Modified Capabilities
- (ninguna; no existen specs raiz en `openspec/specs/`).

## Impact

- API Vercel: se reemplaza `api/catalog/[...path].js` por handlers explicitos bajo `api/catalog/` y un modulo interno compartido.
- Pruebas: se cubren directamente los cuatro archivos de ruta, sus metodos permitidos, parametros de slug, query strings, errores upstream y `PRODUCT_NOT_FOUND`.
- Configuracion: se conservan `N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL`, `N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL`, `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL` y `N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL`.
- Frontend: `src/features/catalog/api/client.ts` mantiene sin cambios su contrato relativo `/api/catalog/*`.
- Despliegue: requiere redeploy posterior a confirmar la cuarta variable en Production y validacion GET contra el dominio Vercel.
