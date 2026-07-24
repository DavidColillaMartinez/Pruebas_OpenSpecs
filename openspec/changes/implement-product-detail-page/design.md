## Context

La aplicación es una SPA React 19 + Vite 8 + Tailwind 3 sin routing, capa de datos, tipado, tests ni integración con n8n. La landing mantiene una narrativa propia para escritorio y un árbol móvil separado; esa lógica no debe ejecutarse en rutas de producto. No existe actualmente `vercel.json`, `netlify.toml` ni una carpeta `api/`, por lo que la capa server-side debe añadirse explícitamente.

El contrato externo exige una ficha funcional por `slug`, una galería, selección de variantes y un formulario de presupuesto. Se verificaron estos endpoints el 15 de junio de 2026:

- `GET /webhook/lrmq/catalog/config` responde `catalog-api-v1`, `database_ready_for_public_api: true` y un `asset_base_url` público.
- `GET /webhook/lrmq/catalog/products?limit=3` responde correctamente con productos y slugs publicables.
- El upstream real es `https://n8n.colilladavid.es/webhook/35f1a0c4-e2e1-443d-8390-56f0027d0742/lrmq/catalog/products/:slug` y responde `200` para `mt-espejos-alba` y `royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17`.
- Un slug inexistente mantiene HTTP `200` con `{ "error": "PRODUCT_NOT_FOUND", "message": "Producto no encontrado" }`.
- El upstream mantiene ese `200` por una configuración fija del nodo de respuesta; el proxy público normaliza únicamente ese caso a HTTP `404` y conserva el JSON.

El usuario ha decidido conservar Vite y añadir React Router. También ha decidido corregir primero `LRMQ Obtener Producto` en n8n. Esta API operativa es una precondición de implementación, no una responsabilidad del frontend.

## Goals / Non-Goals

**Goals:**

- Mantener la landing actual en `/` y añadir rutas SPA recargables para listado mínimo y detalle de producto.
- Consumir exclusivamente rutas relativas `/api/catalog/...` desde el navegador mediante una capa desacoplada y testeable.
- Mantener el webhookId y la URL n8n únicamente en variables de entorno server-side y en el proxy.
- Derivar el contrato `ProductDetail` de una respuesta real y fallar de forma controlada ante contratos inválidos.
- Cubrir los 18 estados funcionales definidos en el documento de contexto.
- Representar contenido, galería, variantes y ofertas sin inventar datos ni combinaciones.
- Enviar presupuestos reales con el payload canónico y gestionar `201`, `400`, `429`, red y `5xx`.
- Añadir una base incremental de TypeScript, validación runtime, tests y comandos reproducibles sin migrar toda la landing.
- Entregar HTML semántico, accesibilidad y responsive funcionales con estilos mínimos; la dirección visual queda para otra fase.

**Non-Goals:**

- Migrar a Next.js, añadir SSR/SSG o rediseñar la landing.
- Crear backend propio, acceder a PostgreSQL o modificar workflows n8n desde este repositorio.
- Implementar carrito, pago, stock, favoritos, comparación o relaciones de producto no confirmadas.
- Importar el catálogo local de `assets/Catalogo` en el bundle del navegador.
- Añadir dirección artística, animaciones decorativas o un diseño final de producto.

## Decisions

### 1. Proxy de aplicación y React Router sobre el shell actual

Se añadirá una función server-side compatible con Vercel en `api/catalog/[...path].js` y un proxy equivalente para desarrollo en `vite.config.js`. El navegador solo llamará a rutas relativas `/api/catalog/...`. Cada upstream se leerá de una variable server-side específica del recurso (`N8N_CATALOG_*_UPSTREAM_BASE_URL`); si falta, el proxy devolverá un error de configuración sin revelar la URL.

Se añadirá `react-router-dom` y se moverá el contenido actual de `App` a `LandingPage`. El router montará:

- `/`: landing existente.
- `/productos`: listado funcional mínimo procedente de n8n, necesario para navegar por slug.
- `/productos/:slug`: detalle de producto.
- `*`: estado de ruta no encontrada.

El hook narrativo solo se instanciará dentro de `LandingPage`. El header y el drawer distinguirán rutas de aplicación de anchors internos. El despliegue deberá reescribir rutas desconocidas a `index.html`.

Alternativas descartadas:

- Next.js: mejor para SEO a gran escala, pero excede el alcance acordado.
- History API manual: evita una dependencia, pero duplica resolución, navegación, parámetros y not-found.
- Proxy directo desde el navegador: expone el webhookId, acopla CORS al upstream y viola la nueva restricción.

### 2. TypeScript incremental y validación runtime sin migración global

Los nuevos módulos de catálogo se escribirán en TypeScript/TSX. Se añadirá una configuración que permita convivir con JS/JSX existentes. Los contratos externos se validarán con funciones explícitas y type guards pequeñas, sin introducir una librería de schemas hasta conocer la respuesta real.

El mínimo estructural de `ProductDetail` debe permitir identificar producto, slug y nombre; el resto se normalizará solo si existe y conserva su significado. Una respuesta `200` que no cumpla el mínimo producirá `ContractError`.

Alternativas descartadas:

- Migración completa del repositorio: demasiado amplia.
- Confiar solo en tipos estáticos: no protege frente a respuestas reales inválidas.
- Inventar un tipo desde el documento: el documento prohíbe asumir claves conceptuales.

### 3. API central, cancelable y con errores discriminados

El cliente frontend tendrá como base fija relativa `/api/catalog`; no leerá ni expondrá la URL upstream. La función server-side y el proxy local leerán la variable `N8N_CATALOG_*_UPSTREAM_BASE_URL` correspondiente a cada recurso. Un cliente HTTP común aplicará timeout mediante `AbortController`, parseo seguro y clasificación por estado/código.

Errores de dominio previstos:

- `NotFoundError` para `404 PRODUCT_NOT_FOUND`.
- `ValidationError` para `400 VALIDATION_ERROR`.
- `RateLimitError` para `429 RATE_LIMITED`.
- `ServerError` para `5xx`.
- `NetworkError` y `TimeoutError`.
- `ContractError` para JSON inválido o respuesta `200` inutilizable.

Los componentes no harán `fetch` directamente. Los hooks descartarán respuestas obsoletas al cambiar el slug o desmontarse.

### 4. Precondición backend/n8n

Antes de cerrar tipos o construir UI de detalle, n8n deberá cumplir:

1. `GET /catalog/products/:slug` devuelve `200` para un slug que aparece en el listado.
2. La respuesta procede de `catalog.v_product_detail_public` y contiene únicamente datos públicos.
3. Slug inexistente puede devolver `200` con `PRODUCT_NOT_FOUND` en n8n; la ruta pública debe responder `404`.
4. CORS permite el origen del frontend y las respuestas incluyen el cache policy acordado.
5. `POST /catalog/quote-requests` acepta el payload canónico y conserva los contratos `201`, `400` y `429`.

El usuario desarrollará los ajustes n8n. Se guardará un fixture anonimizado del `GET` real solo para tests; nunca se usará como sustituto de producción.

### 5. Normalización centralizada y modelo de presentación

La API se adaptará en tres pasos:

1. Validación estructural mínima.
2. Normalización de arrays, nulls y URLs relativas con `asset_base_url`.
3. Proyección a un modelo de presentación que excluya claves internas.

No se renombrará silenciosamente un campo para atribuirle otro significado. Los campos desconocidos permanecerán fuera de la UI hasta estar mapeados explícitamente.

### 6. Variantes como unidades reales, no producto cartesiano

La selección se derivará de variantes y variantes de oferta presentes. Se conservarán los identificadores persistentes. La selección inicial será:

1. La única opción válida.
2. La marcada como predeterminada por la API.
3. La primera opción publicable y completa según el orden de la API.

Los selectores se construirán desde atributos públicos de las opciones reales. Al elegir un atributo, las opciones incompatibles se deshabilitarán calculando si existe al menos una unidad seleccionable que contenga la selección parcial. No se crearán combinaciones nuevas.

### 7. Galería derivada de producto y variante

Las imágenes se normalizarán y deduplicarán por URL resuelta. La prioridad será:

1. Imágenes propias de la selección actual, si existen.
2. Imágenes generales del producto.
3. Fallback local existente o un placeholder semántico ligero creado para esta funcionalidad.

La activa se restablecerá de forma determinista cuando cambie el conjunto. Errores de carga reemplazarán la imagen sin romper la ficha.

### 8. Presupuesto como estado local del detalle

No se añadirá store global. La ficha mantiene la selección y el formulario localmente; el artículo se construye al enviar a partir del producto y la selección actuales.

La validación cliente replica límites básicos, pero la respuesta del servidor es autoritativa. El formulario conserva los datos ante errores, bloquea dobles envíos y solo se limpia tras `201`. No se persiste PII ni se registra el payload.

### 9. Testing mínimo reproducible

Se añadirá Vitest + Testing Library para lógica y componentes, MSW o mocks de `fetch` locales para impedir POST reales, y ESLint/TypeScript incremental. Playwright solo se añadirá si el coste de configuración es razonable; de lo contrario, navegación y recarga se verificarán manualmente y quedarán documentadas.

Las pruebas de lógica cubrirán clasificación HTTP, normalización, variantes, galería, payload, límites, asociación de errores y doble envío. El build no dependerá de la API real.

### 10. SEO y accesibilidad compatibles con SPA

La ficha actualizará `document.title` y la meta description al cargar, restaurándolas al desmontar. No se añadirá canonical dinámico ni datos sociales si no existe una convención de rutas SPA compatible.

La página tendrá un único `h1`, regiones de estado con `aria-live`, controles nativos, labels, errores asociados y gestión de foco en notificaciones críticas. La estructura usará scroll nativo tanto en móvil como en escritorio.

## Risks / Trade-offs

- [El hosting no soporta funciones Vercel] → Confirmar el proveedor antes del despliegue; mantener la interfaz pública `/api/catalog` y trasladar el mismo handler a su API route equivalente sin cambiar el cliente.
- [La forma real de variantes/ofertas difiere del documento] → Derivar los adaptadores y specs de datos desde la respuesta real; no implementar selectores genéricos antes.
- [SPA con metadatos en cliente tiene SEO limitado] → Entregar routing y metadatos funcionales ahora; registrar SSR/SSG como mejora posterior, no ampliar alcance.
- [React Router y API routes requieren configuración de hosting] → Documentar rewrite de SPA, variables server-side y rutas de función; probar recarga y proxy en preview.
- [Incrementar TypeScript y tests en un proyecto JS puede ampliar tooling] → Limitarlo a nuevos módulos y scripts; no migrar la landing.
- [Duplicación desktop/mobile de la landing puede filtrar estilos o hooks] → Aislar producto en un layout propio y no reutilizar el controlador narrativo.
- [Campos públicos desconocidos podrían omitirse] → Mantener un inventario de claves reales y mapear únicamente conceptos confirmados; documentar diferencias.
- [CORS, rate limit o disponibilidad n8n pueden bloquear pruebas] → Usar mocks en tests y una verificación manual controlada con slugs publicables, sin POST automatizados reales.

## Migration Plan

1. Corregir y verificar n8n con un slug real y guardar el contrato anonimizado.
2. Añadir tooling incremental y cliente API sin cambiar la landing.
3. Instalar el router, extraer `LandingPage` y configurar rutas/rewrite.
4. Implementar listado mínimo enlazado por slug y estados de detalle.
5. Implementar contenido, galería y variantes desde el contrato real.
6. Implementar presupuesto y sus estados.
7. Completar accesibilidad, metadatos, responsive y pruebas.
8. Desplegar primero en preview y verificar URLs directas, CORS y respuestas reales.

Rollback: retirar las rutas nuevas y volver a montar la landing en `/`; la capa API y componentes nuevos son aditivos y no cambian datos persistidos en el frontend.

## Open Questions

- ¿Qué slug devolverá `200` después de corregir `LRMQ Obtener Producto` y cuál será la respuesta anonimizada de referencia?
- ¿Cuál es la estructura exacta de variantes, imágenes, ofertas, documentos y flags predeterminados del detalle real?
- ¿Existe ya una URL pública de política de privacidad para enlazar junto al consentimiento?
- ¿Qué proveedor de hosting ejecutará la función server-side? El repositorio no contiene configuración; el diseño usa convención Vercel como default operativo.
- ¿Debe aparecer `renovationType` en la primera interfaz o enviarse solo cuando el proyecto disponga de un valor real?
- ¿Qué recurso local debe usarse como fallback si una imagen de producto no existe o falla?
