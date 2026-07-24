## ADDED Requirements

### Requirement: Cliente de catalogo exclusivamente relativo
El navegador SHALL consultar el catalogo unicamente mediante rutas relativas bajo `/api/catalog` y MUST NOT incluir URLs n8n, segmentos `/webhook`, IDs de workflow ni variables server-side en el bundle.

#### Scenario: Consulta de listado
- **WHEN** la pagina `/productos` solicita productos
- **THEN** el navegador realiza un GET a `/api/catalog/products` sin conocer el upstream

#### Scenario: Consulta de detalle
- **WHEN** se abre un slug de producto
- **THEN** el navegador realiza un GET a `/api/catalog/products/:slug` con el slug codificado

### Requirement: Variables server-side verificadas
La funcion de catalogo y el proxy local SHALL usar una nomenclatura server-side unica y documentada que coincida con las variables configuradas. Si listado y detalle requieren bases distintas, el sistema SHALL declarar la cuarta variable real por su nombre exacto antes del despliegue y MUST NOT inventar aliases publicos.

#### Scenario: Una base de productos compartida
- **WHEN** la auditoria demuestra que listado y detalle funcionan desde la misma base configurada
- **THEN** ambos recursos usan la variable de productos confirmada sin duplicar configuracion

#### Scenario: Bases de productos distintas
- **WHEN** la auditoria demuestra que el detalle usa un upstream diferente al listado
- **THEN** se informa como requisito la variable server-side especifica de detalle y el despliegue queda bloqueado hasta confirmarla

### Requirement: Rewrite preserva API y estaticos
La configuracion de Vercel SHALL resolver recargas directas de `/productos` y `/productos/:slug` hacia la SPA, y MUST NOT interceptar `/api/*` ni archivos estaticos.

#### Scenario: Recarga de pagina de producto
- **WHEN** Vercel recibe un GET directo a `/productos/<slug>`
- **THEN** sirve la entrada SPA y React Router resuelve la ficha

#### Scenario: Peticion API
- **WHEN** Vercel recibe un GET a `/api/catalog/products`
- **THEN** ejecuta la funcion server-side y devuelve JSON en vez de `index.html`

#### Scenario: Peticion de asset
- **WHEN** el navegador solicita una imagen, video, CSS o JavaScript generado
- **THEN** Vercel sirve el archivo estatico sin reescribirlo a `index.html`

### Requirement: Normalizacion publica de producto inexistente
El proxy SHALL conservar el cuerpo `PRODUCT_NOT_FOUND` del upstream y SHALL convertir su HTTP `200` defectuoso en HTTP `404` publico.

#### Scenario: Slug inexistente
- **WHEN** n8n responde `200` con `{ "error": "PRODUCT_NOT_FOUND" }`
- **THEN** `/api/catalog/products/:slug` responde `404` con el mismo error publico

### Requirement: Auditoria sin presupuestos reales
La verificacion SHALL cubrir configuracion, listado, dos slugs validos y un slug inexistente mediante GET, y MUST NOT ejecutar un POST real a `quote-requests`.

#### Scenario: Auditoria local
- **WHEN** se ejecuta la matriz automatizada antes del despliegue
- **THEN** los POST se prueban solo mediante mocks y ninguna solicitud de presupuesto abandona el entorno de test

#### Scenario: Auditoria posterior al despliegue
- **WHEN** existe un push y despliegue autorizados
- **THEN** se verifican por GET config, listado, dos slugs validos, `404` inexistente y navegacion `Tienda -> /productos`
