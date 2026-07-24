## Context

El frontend ya consume exclusivamente `/api/catalog/*` y el proxy actual conserva las cuatro bases upstream server-side, pero produccion depende de una unica funcion catch-all `api/catalog/[...path].js`. Sus tests fabrican `request.query.path`, mientras que el deployment Vercel del commit `35499b5` demuestra que esa suposicion no representa el routing real: los endpoints estaticos llegan a una funcion que responde `405` y el detalle no encuentra funcion alguna.

La solucion afecta al limite entre el filesystem routing de Vercel y la logica comun del proxy. Debe preservar el cliente, las variables, los workflows n8n, la normalizacion de detalle y el POST de presupuesto sin hacer solicitudes reales durante validacion. Los cambios preexistentes del propietario en `assets/Catalogo/**`, `assets/Boceto/**` y `public/boceto-final.png` permanecen fuera de alcance.

## Goals / Non-Goals

**Goals:**

- Hacer que cada URL publica del catalogo corresponda a un archivo de funcion Vercel estable.
- Compartir toda la logica de forwarding para que los handlers sean adaptadores pequenos y declarativos.
- Probar los handlers fisicos usando `request.query.slug` solo para la ruta dinamica, sin fabricar `request.query.path`.
- Mantener las cuatro variables exactas, el secreto de upstreams y la normalizacion `PRODUCT_NOT_FOUND`.
- Validar el deployment con GET reales despues de confirmar la cuarta variable en Production.

**Non-Goals:**

- Cambiar el cliente frontend, rutas React, UI, navegacion, media, productos o formulario de presupuesto.
- Cambiar URLs, payloads o workflows n8n.
- Ejecutar un POST real a `/api/catalog/quote-requests`.
- Introducir aliases de variables, fallbacks generales o variables `VITE_*`.
- Cerrar tareas pendientes de otros cambios OpenSpec.

## Decisions

### 1. Cuatro funciones fisicas reemplazan al catch-all

Se eliminaran `api/catalog/[...path].js` y su test centrado en `query.path`. Las rutas de produccion se representaran con:

- `api/catalog/config.js` para `/api/catalog/config`.
- `api/catalog/products.js` para `/api/catalog/products`.
- `api/catalog/products/[slug].js` para `/api/catalog/products/:slug`.
- `api/catalog/quote-requests.js` para `/api/catalog/quote-requests`.

Se prefiere filesystem routing directo frente a rewrites adicionales en `vercel.json`: elimina una capa de traduccion, permite a Vercel descubrir cada funcion por nombre y evita que el fallback SPA participe en la API.

### 2. Los handlers son adaptadores de un proxy compartido

La seleccion de metodo, variable, path upstream, query, body, timeout, headers y respuesta vivira en un modulo server-only fuera de `api/`, por ejemplo `server/catalog/proxy.js`. Colocarlo fuera de `api/` evita publicar accidentalmente el helper como otro endpoint Vercel. La normalizacion existente se trasladara o reutilizara desde ese limite server-side, y `vite.config.js` actualizara solo el import si el archivo cambia de ubicacion.

Cada handler pasara al helper un descriptor estatico con recurso, metodos permitidos y nombre de variable. El detalle pasara ademas `request.query.slug` como identificador y el helper excluira ese parametro de la query reenviada. No existira reconstruccion de ruta desde `request.query.path`.

### 3. Las variables se resuelven mediante nombres cerrados

Los descriptores usaran exclusivamente:

- config: `N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL`.
- listado: `N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL`.
- detalle: `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL`.
- presupuesto: `N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL`.

No se usara una variable base general ni fallback entre listado y detalle. Si falta la variable del endpoint, el proxy respondera `500 CATALOG_PROXY_NOT_CONFIGURED` sin incluir nombre, valor ni URL upstream.

### 4. El contrato HTTP actual se conserva

Config, listado y detalle aceptaran solo GET; quote-requests aceptara solo POST. Un metodo no permitido respondera `405 METHOD_NOT_ALLOWED` con `Allow`. El helper reenviara query strings de config/listado, codificara el slug como un unico segmento, mantendra timeout de 10 segundos y copiara solo `content-type` y `cache-control` de la respuesta.

`normalizeCatalogResponseStatus` seguira convirtiendo solo una respuesta upstream HTTP 200 cuyo JSON contenga `error: PRODUCT_NOT_FOUND` en HTTP 404 publico, preservando el cuerpo. Los demas status se mantendran.

### 5. Las pruebas se ejecutan contra los modulos de ruta reales

Los tests importaran `config.js`, `products.js`, `products/[slug].js` y `quote-requests.js`. Las requests de config/listado no tendran `query.path`; el detalle recibira `{ query: { slug } }`, que es el parametro dinamico real de Vercel. `fetch` se mockeara para verificar URL, metodo, query, body, errores, timeout y normalizacion sin trafico saliente.

Una prueba estructural confirmara que el catch-all ya no existe y que los cuatro handlers delegan en el helper. El build se inspeccionara para comprobar que no contiene `webhook`, `webhookId`, host n8n ni nombres de variables server-side.

## Risks / Trade-offs

- [Vercel interpreta de forma distinta una ruta estatica y su directorio dinamico] -> usar archivos fisicos con precedencia estatica clara, validar el output de Vercel y comprobar las cuatro URLs tras el deploy.
- [El helper colocado dentro de `api/` crea una quinta funcion publica] -> ubicarlo fuera de `api/` y limitar ese directorio a los cuatro entrypoints.
- [El slug se duplica como query upstream] -> tratar `slug` como parametro de ruta reservado y excluirlo al reenviar query strings.
- [Mover la normalizacion rompe el proxy Vite] -> mantener una exportacion server-side unica y actualizar el import local con pruebas de status.
- [Un test unitario vuelve a ocultar un fallo de filesystem routing] -> importar los archivos de ruta concretos y completar con verificacion GET del deployment real.
- [La verificacion de quote crea datos reales] -> probar POST solo con `fetch` mockeado y excluirlo expresamente de la auditoria de produccion.

## Migration Plan

1. Registrar el estado Git y proteger los assets preexistentes.
2. Crear el helper server-only y los cuatro handlers explicitos.
3. Eliminar el catch-all y reemplazar sus pruebas por tests de entrypoints reales.
4. Actualizar documentacion e imports server-side necesarios sin modificar el cliente.
5. Ejecutar instalacion frozen, tests, lint, typecheck, build y escaneo del bundle.
6. Crear un commit focalizado y hacer push solo con autorizacion.
7. Confirmar en Vercel las cuatro variables, especialmente `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL`, y hacer redeploy.
8. Verificar mediante GET configuracion, listado, los dos slugs validos y el slug inexistente con HTTP 404.

Rollback: revertir el commit focalizado de routing. No restaurar el repositorio completo ni modificar los workflows n8n.

## Open Questions

- Ninguna para implementacion local. El estado Ready del redeploy y la presencia de la cuarta variable en Production son evidencias externas y permaneceran pendientes hasta verificarse.
