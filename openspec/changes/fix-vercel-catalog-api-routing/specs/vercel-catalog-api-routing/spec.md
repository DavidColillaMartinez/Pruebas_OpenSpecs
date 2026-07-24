## ADDED Requirements

### Requirement: Funciones Vercel explicitas para el catalogo
El sistema SHALL exponer cada ruta publica del catalogo mediante un entrypoint serverless fisico y MUST NOT depender de un catch-all que reconstruya el recurso desde `request.query.path`.

#### Scenario: Ruta de configuracion
- **WHEN** Vercel recibe `GET /api/catalog/config`
- **THEN** ejecuta el handler explicito de configuracion y devuelve la respuesta JSON del upstream configurado

#### Scenario: Ruta de listado
- **WHEN** Vercel recibe `GET /api/catalog/products` con o sin query string
- **THEN** ejecuta el handler explicito de listado y conserva los parametros publicos al consultar el upstream

#### Scenario: Ruta de detalle
- **WHEN** Vercel recibe `GET /api/catalog/products/:slug`
- **THEN** ejecuta el handler dinamico de detalle con el slug como parametro de ruta y no responde con el 404 de plataforma

#### Scenario: Ruta de presupuesto
- **WHEN** Vercel recibe `POST /api/catalog/quote-requests`
- **THEN** ejecuta el handler explicito de presupuesto con el cuerpo JSON recibido

### Requirement: Delegacion server-side compartida
Los cuatro entrypoints SHALL delegar validacion de metodo, seleccion de upstream, construccion de URL, timeout, forwarding y respuesta en una unica implementacion server-side, y el modulo compartido MUST NOT crear una ruta publica adicional bajo `/api`.

#### Scenario: Handler de recurso
- **WHEN** un entrypoint procesa una request valida
- **THEN** aporta al helper solo su descriptor de recurso y los parametros propios de su ruta

#### Scenario: Metodo no permitido
- **WHEN** una ruta recibe un metodo distinto del permitido
- **THEN** el helper responde `405 METHOD_NOT_ALLOWED` con el header `Allow` y no consulta ningun upstream

#### Scenario: Error o timeout upstream
- **WHEN** el fetch server-side falla o supera el timeout
- **THEN** el helper responde con el error publico de upstream sin exponer detalles internos

### Requirement: Variables exactas y separadas por recurso
El proxy SHALL resolver cada endpoint usando exclusivamente su variable server-side aprobada y MUST NOT usar aliases, variables publicas ni fallbacks entre recursos.

#### Scenario: Configuracion
- **WHEN** el handler de configuracion construye su URL upstream
- **THEN** usa `N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL`

#### Scenario: Listado
- **WHEN** el handler de listado construye su URL upstream
- **THEN** usa `N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL`

#### Scenario: Detalle
- **WHEN** el handler de detalle construye su URL upstream
- **THEN** usa `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL`

#### Scenario: Presupuesto
- **WHEN** el handler de presupuesto construye su URL upstream
- **THEN** usa `N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL`

#### Scenario: Variable ausente
- **WHEN** falta la variable requerida por un endpoint
- **THEN** responde `500 CATALOG_PROXY_NOT_CONFIGURED` sin incluir el nombre, valor o URL del upstream

### Requirement: Cliente relativo y upstreams secretos
El frontend SHALL seguir consultando solo rutas relativas bajo `/api/catalog/*`, y el bundle MUST NOT contener host n8n, `/webhook`, `webhookId` ni nombres de variables server-side.

#### Scenario: Build de produccion
- **WHEN** se genera e inspecciona el bundle del frontend
- **THEN** las cuatro variables y los identificadores de workflows permanecen exclusivamente en el entorno server-side

#### Scenario: Cliente existente
- **WHEN** el frontend solicita configuracion, listado, detalle o presupuesto
- **THEN** conserva las URLs publicas actuales sin cambios de contrato

### Requirement: Producto inexistente conserva error con status publico correcto
El handler de detalle SHALL preservar el cuerpo `PRODUCT_NOT_FOUND` y SHALL normalizar el HTTP 200 defectuoso del upstream a HTTP 404 publico.

#### Scenario: Slug inexistente
- **WHEN** n8n responde HTTP 200 con `{ "error": "PRODUCT_NOT_FOUND" }`
- **THEN** `/api/catalog/products/:slug` responde HTTP 404 con el mismo error publico

#### Scenario: Producto valido
- **WHEN** n8n responde HTTP 200 con un producto valido
- **THEN** el handler conserva HTTP 200 y el cuerpo recibido

### Requirement: Pruebas representan el routing real
La suite SHALL importar y ejecutar los cuatro entrypoints fisicos con la forma de request de Vercel y MUST NOT depender de inyectar manualmente `request.query.path`.

#### Scenario: Request estatica de Vercel
- **WHEN** se prueban configuracion o listado
- **THEN** el handler funciona sin una propiedad sintetica `query.path`

#### Scenario: Request dinamica de Vercel
- **WHEN** se prueba detalle con `{ query: { slug } }`
- **THEN** el handler usa el parametro de ruta, codifica el slug una vez y excluye `slug` de la query upstream

#### Scenario: Presupuesto automatizado
- **WHEN** se prueba quote-requests
- **THEN** `fetch` esta mockeado y ningun POST sale del entorno de test

### Requirement: Verificacion de produccion solo mediante GET seguro
Tras configurar las cuatro variables y completar el redeploy, la auditoria SHALL verificar los recursos de lectura en el dominio Vercel y MUST NOT crear solicitudes reales de presupuesto.

#### Scenario: Matriz valida desplegada
- **WHEN** el deployment esta Ready
- **THEN** config, listado y los dos slugs aprobados responden HTTP 200 con JSON

#### Scenario: Detalle inexistente desplegado
- **WHEN** se consulta el slug inexistente aprobado
- **THEN** responde HTTP 404 JSON con `PRODUCT_NOT_FOUND` y no un 404 HTML de Vercel

#### Scenario: Exclusión de POST real
- **WHEN** se ejecuta la auditoria posterior al deployment
- **THEN** no se envia ninguna request POST a `/api/catalog/quote-requests`
