# Catalog API Proxy

The browser uses only relative application routes:

- `GET /api/catalog/config`
- `GET /api/catalog/products`
- `GET /api/catalog/products/:slug`
- `POST /api/catalog/quote-requests`

The n8n upstreams are server-only and are configured with:

```text
N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL
N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL
N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL
N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL
```

The first three names are the confirmed resource variables. Product detail is the required fourth server-side variable because its verified n8n workflow uses a distinct UUID route from the products list workflow.

Do not use a `VITE_*` variable for this value. Variables prefixed with `VITE_` are exposed to the browser bundle.

## Local Development

Use npm with Node `>=20.19.0`. Set the resource-specific upstream variables from `.env.example` in the local environment before starting Vite. `vite.config.js` proxies `/api/catalog` to the corresponding upstream without changing frontend request code.

## Production

The project includes `api/catalog/[...path].js`, a Vercel-compatible server function. Configure the resource-specific variables in the deployment environment. The function forwards only the approved catalog resources and never returns the upstream URL to the browser.

`vercel.json` rewrites only `/productos` and `/productos/:slug` to the SPA entry point. API routes and static files are not matched by these rewrites, so `/api/catalog/*` remains enabled by the hosting provider.

## Verification

The proxy was verified against:

- `mt-espejos-alba`
- `royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17`

Both return HTTP `200` through `/api/catalog/products/:slug`. An unknown slug returns HTTP `404` publicly with the upstream `PRODUCT_NOT_FOUND` object; n8n itself still returns that object with HTTP `200`.

## Not-found Normalization

The active n8n detail workflow has HTTP `200` fixed on its response node even when it emits `PRODUCT_NOT_FOUND`. The application proxy preserves the JSON body but normalizes that case to public HTTP `404`. The upstream workflow is intentionally unchanged.
