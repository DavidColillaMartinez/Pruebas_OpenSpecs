# Auditoría SEO y seguridad del repositorio · AREA LRMQ

Cambio: `audit-harden-repo-seo-security` (biblioteca de evidencia de la primera etapa).
Fecha: 2026-09-10. Autor: análisis estático y pruebas automatizadas en local (sin navegador real disponible durante la sesión; ver §8).

## 0. Trazabilidad

- Commit base al iniciar: `921ec96` (`perf(catalog): defer facets and preload assistant`), rama `main`.
- Estado inicial de Git: limpio salvo tres directorios no versionados de artefactos OpenSpec (`openspec/changes/{audit-harden-repo-seo-security,refine-web-usability-accessibility,add-manual-light-dark-theme}/`), creados como planificación en la sesión anterior.
- Baseline antes de tocar código (green):
  - `npm test` → 47 archivos / 347 passed | 1 skipped (warnings preexistentes de jsdom `HTMLMediaElement.pause()`).
  - `npm run lint` → sin errores (cubre `src/features`, `src/routes`, `api`, `server`, `vite.config.js`).
  - `npm run typecheck` → sin errores (`tsc --noEmit`).
  - `npm run build` → correcto (bundle principal ≈ 344 kB / 104.8 kB gzip).
- Comandos al cierre (§7).
- Gestor de paquetes observado: `node_modules` con estructura pnpm (`.pnpm`) + `package-lock.json` y `pnpm-lock.yaml` coexistentes; `pnpm` no está en el PATH y `npm audit fix` termina en error interno de npm. Ver F-DEP-001.

## 1. Inventario de rutas y fronteras

### Rutas de usuario (React Router, `src/App.jsx`)
| Ruta | Componente | Notas |
|---|---|---|
| `/` | Landing narrativa desktop + móvil | metadatos en `index.html`; JSON-LD `BusinessJsonLd` |
| `/productos` | `CatalogPage` (lazy) | filtros/búsqueda/orden vía query string (`catalogQuery.ts`) |
| `/productos/:slug` | `ProductDetailPage` (lazy) | carga por `/api/catalog/products` con `slug`, 404 cuando no existe |
| `/presupuesto` | `QuoteSelectionPage` (lazy) | POST `/api/catalog/quote-requests` |
| `*` | `NotFoundPage` (lazy) | solo navegación cliente; petición directa lo gestiona Vercel |

### Entradas API versionadas
| Entrada pública | Método(s) | Upstream (env) | Validación servidor |
|---|---|---|---|
| `/api/catalog/config` | GET | `N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL` | allowlist query (`locale`), timeout 8 s, 1 reintento solo `TypeError` |
| `/api/catalog/products` | GET | `N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL` | allowlist de 27 claves de query, sin postal del cuerpo |
| `/api/catalog/products` (+ `?slug=`) | GET | `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL` | slug requerido, `encodeURIComponent` |
| `/api/catalog/quote-requests` | POST | `N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL` | **mejorado en esta auditoría** (F-SEC-003) |
| `/api/chat/messages` | POST | `CHAT_UPSTREAM_BASE_URL` (Header `LRMQ_Chat_Inbound`) | allowlist cuerpo/contexto, mensaje ≤2 000, requestId regex, timeouts por turno **+ mejorado en esta auditoría** (F-SEC-001/002) |

### Datos, almacenamiento y renderizado
- `sessionStorage` (pestaña): `lrmq:assistant:chat:v1` (historial+conversationId), `lrmq:assistant:welcome:v1`, `CATALOG_RETURN_STORAGE_KEY` (search+scrollY), clave de selección de presupuesto (`selectionStore`).
- `localStorage`: `lrmq:assistant:welcome:v1` (descarte de la burbuja).
- Render: React (escape por defecto). Único `dangerouslySetInnerHTML`: JSON-LD estático (`BusinessJsonLd`) — hardened en F-LOW-001.
- Serve: `vercel.json` con rewrites solo para `/presupuesto`, `/productos`, `/productos/:slug`; CSP/`X-Frame-Options`/`nosniff`/`Referrer-Policy` en `(.*)`; `robots.txt` y `sitemap.xml` añadidos en `public/` (F-SEO-003).

### Límites externos NO verificables desde este repositorio
Workflows n8n vigentes (`N8N_*`), permisos y aislamiento reales, rate limiting/protección en el gateway n8n, configuración real del panel de Vercel (más allá del `vercel.json` versionado), Neon, credenciales. Copias como `docs/n8n-chat-v1-backup-2026-09-09.json` son evidencia local, no prueba de lo desplegado.

## 2. Estado SEO por ruta (medición y política)

### 2.1 Medición (código + configuración versionada; sin navegador real en esta sesión)
| Caso | Petición directa (config. versionada) | HTML inicial | DOM tras JS |
|---|---|---|---|
| `/` | 200 `text/html; charset=utf-8` (Vercel estático) | título/descr./canonical `https://arealrmq.es/` + OG/Twitter + `robots index,follow` | idem (Landing no cambia metadatos) + JSON-LD LocalBusiness |
| `/productos` | 200 por rewrite → `index.html` | metadatos de portada (título/canonical de "Tienda") | **títulos propios por ruta** (F-SEO-001) |
| `/productos/slug-válido` | 200 (rewrite `:slug`) | metadatos de portada | título/descr. del producto + canonical self (F-SEO-001) |
| `/productos/slug-inexistente` | **200 soft 404** → SPA muestra "Producto no encontrado" (F-SEO-004/BLOQ-001) | metadatos de portada | "Producto no encontrado" recuperable; no declara retirado |
| `/presupuesto` | 200 por rewrite | metadatos de portada | noindex + título propio (F-SEO-001) |
| ruta desconocida `/xyz` | **404 con página genérica de Vercel** (sin rewrite; correcto en status, sin marca) | — | navegación cliente: NotFoundPage noindex + enlaces (F-SEO-002) |
| `/api/catalog/xyz` | 404 de Vercel (no hay función) | — | — |
| asset desconocido | 404 estático de Vercel | — | — |

Rastreador sin JS: portada OK; el resto de rutas heredan los metadatos de la portada hasta que se resuelva prerender (BLOQ-002). Cambiar solo `document.title` no se considera SEO completo en el informe.

### 2.2 Política de indexación por clase de URL (tabla de decisiones)
| Clase de URL | Status | Index | Canonical | Sitemap |
|---|---|---|---|---|
| `/` | 200 | index,follow | self (`https://arealrmq.es/`) | sí |
| `/productos` | 200 | index,follow | self (`/productos/`) | sí |
| `/productos?filtros|página` (query) | 200 por rewrite | index,follow | **canonical a `/productos/`** (los filtros no son URLs canónicas independientes; se evita duplicar inventario) | **no** (sin parámetros en sitemap) |
| `/productos/:slug` válido | 200 | index,follow | self (canonical per-route añadido) | **pendiente** (ver 4) |
| `/productos/:slug` inexistente | 200 (bloqueado, BLOQ-001) | noindex en DOM cuando SPA detecta `PRODUCT_NOT_FOUND` — anclado a la limitación | n/a | no |
| `/presupuesto` | 200 | **noindex,follow** (transaccional, datos personales) | self | no (`Disallow`/no visto por rastreo; no depende de robots para retirar del índice) |
| ruta desconocida | 404 | no indexada por status | — | no |
| `/api/**`, assets | 404/json según caso | n/a | — | no |

Justificación de descubrimiento de fichas: el descubrimiento orgánico basado solo en sitemap estático es imposible sin enumerar slugs verificados del upstream; se documenta la estrategia en §4 en lugar de inventar datos.

## 3. Hallazgos

Convención: ID, severidad (CRIT/ALTA/MEDIA/BAJA/INFO), evidencia (reproducible), estado.

### F-SEC-001 · ALTA · /api/chat/messages recibía cualquier content-type
- Evidencia: `server/chat/proxy.js` procesaba `request.body` sin exigir `content-type: application/json` (reproducible con POST directo sin cabeca)。 El cuerpo parseado entraba en `sanitizeChatBody`.
- Corrección aplicada: 400 `INVALID_REQUEST` cuando el content-type no es JSON mediante `isJsonContentType` compartida con el proxy de catálogo. Pruebas: `server/chat/proxy.test.js` ("rejects a direct POST without the JSON content-type…"), ejecutada.
- Nota: el límite de bytes de la petición sigue dependiendo del body parser de la plataforma (no lectura progresiva). Registrado como límite: los cuerpos sobre el límite del runtime Vercel se rechazan antes de la función, pero el proxy no puede medir bytes antes del parseo (F-SEC-004 conserva el límite de respuesta de 64 KB).

### F-SEC-002 · ALTA · /api/chat/messages reenviaba content-type y cache-control del upstream
- Evidencia: el proxy copiaba `content-type` y `cache-control` del upstream; una respuesta upstream con `public, max-age=…` podía dirigir caché compartida sobre datos privados de conversación, y un upstream que devolviera HTML se reenviaba tal cual al navegador.
- Corrección aplicada: el proxy solo acepta JSON (content-type válido) del upstream; si es HTML/otro → 502 `CHAT_UNAVAILABLE` sin reenviar el cuerpo; siempre `content-type: application/json` y `cache-control: no-store` al cliente. Pruebas: "rejects non-JSON upstream replies…", "serves chat responses without public cache headers". Ejecutadas.

### F-SEC-003 · ALTA · POST /api/catalog/quote-requests reenviaba cuerpos no validados al upstream
- Evidencia: el proxy solo limitaba tamaño (64 KB) y reenviaba cualquier JSON al workflow n8n (reproducible POST directo con campos arbitrarios → llega al upstream).
- Corrección aplicada: `server/catalog/quoteBody.js` con validación estricta de contrato (claves permitidas, identificador regex, cantidad 1–999, límites de cadena espejo de `validateQuoteRequest`, claves prohibidas en atributos: `price|precio|internal|...`, consentimiento requerido, ausencia del honeypot); el proxy responde 400 `VALIDATION_ERROR` con `fields` y 0 llamadas upstream; además 415 `UNSUPPORTED_MEDIA_TYPE` para POST no JSON. Pruebas: `server/catalog/quoteBody.test.js` (6 casos) + casos ajustados en `proxy.test.js`. Ejecutadas.
- El texto legítimo con acentos/saltos/símbolos sigue aceptándose (test dedicado).

### F-SEC-004 · MEDIA · Datos manipulados en storage del asistente rehidrataba productos sin validación
- Evidencia: `assistantStore.readStoredState` mezclaba actions (filtradas por `isChatAction`) pero los `products` pasaban tal cual; storage manipulado podría restaurar `imageUrl` fuera del allowlist y textos arbitrarios. También no había límite de nº de mensajes ni longitud.
- Corrección aplicada: validación de `products` con `isChatRecommendedProduct` (origen de imagen `https://assets.colilladavid.es` permitido, internalPath regex), límites `MAX_STORED_MESSAGES=60` / `MAX_STORED_MESSAGE_LENGTH=8000`. Con las acciones ya existentes + allowlists, un storage manipulado degrada y conserva estado utilizable sin renderizar destinos inseguros. Pruebas: la suite existente del asistente sigue en verde. Nota: el texto de usuario/IA continúa tratándose como texto (React) y no ejecuta HTML.

### F-SEO-001 · MEDIA · Metadatos propios por ruta ausentes en catálogo/presupuesto/404 y canonical de ficha ausente
- Evidencia: navegando a `/productos` o `/presupuesto` no se modificaba nada; ficha solo cambiaba `document.title` + description sin canonical ni robots; 404 por navegación no exponía noindex.
- Corrección aplicada: helper `src/routes/routeMeta.ts` (`applyRouteMeta` con restauración completa: título, description, canonical, robots) usado por `CatalogPage`, `ProductDetailPage` (canonical `https://arealrmq.es/productos/<slug>`), `QuoteSelectionPage` (noindex) y `NotFoundPage` (noindex + enlaces útiles). Pruebas: `src/routes/NotFoundPage.test.tsx` (noindex y restauración de metadatos previos al desmontar). Navegación y Atrás restituyen los metadatos de la ruta previa (cleanup). Ejecutadas en suite.
- La verificación visual de estos metadatos en cada ruta queda en la matriz de la segunda etapa; no se declara revisión visual completa sin navegador.

### F-SEO-002 · MEDIA · Ruta desconocida en petición directa: status correcto pero sin recuperación de marca
- Estado: **abierto/bloqueado**. Con rewrites actuales, una URL desconocida responde 404 (correcto); el cuerpo es el genérico de la plataforma. Un rewrite del estilo catch-all hacia `index.html` devolvería 200 (soft 404) — no se aplica por diseño D4. Puede considerarse `public/404.html` solo si el alojamiento definido lo soporta; ver BLOQ-002.

### F-SEO-003 · MEDIA · Sitemap y robots inexistentes
- Evidencia: no existía `public/`, por lo que `robots.txt` y `sitemap.xml` devolvían 404 de Vercel.
- Corrección aplicada: `public/robots.txt` (Allow total, Disallow `/api/` y `/presupuesto/`, enlaza sitemap) y `public/sitemap.xml` con `/` y `/productos/` (URLs canónicas verificables del propio repo; no incluye fichas porque enumerarlas inventaría datos). No se bloquea rastreo de ninguna página que dependa de leer `noindex`.
- Estrategia de fichas (pendiente decidir con owner): (a) regenerar el sitemap en build desde el inventario del upstream (requiere acceso a n8n en build), (b) fragmentos con solo slugs confirmados manualmente. Faltan datos disponibles offline; reproducible y verificable cuando se elige la ruta. No inventado.

### F-SEO-004 · INFO · Directo `/productos/slug-inexistente` = 200 (soft 404) — BLOQ-001
- Causa: el rewrite `/productos/:slug` → `index.html` es necesario para fichas válidas y presupuesto; sin prerender/SSR no se puede conocer la validez del slug en el borde. Status correcto requeriría prerender o reglas por alojamiento; **no se implementa catch-all ni migración a ciegas** por D4. La ruta se comporta con recuperación de marca en navegación cliente; queda explícito para la etapa 2.

### F-LOW-001 · BAJA · JSON-LD sin escapar `<`
- `BusinessJsonLd.jsx` serializaba con `JSON.stringify` sin proteger `</script>`. Los datos son estáticos y no contienen la secuancia (no explotable hoy), pero se aplica endurecimiento "defense-in-depth": `replace(/</g,'\\u003c')`.

### F-LOG-001 · MEDIA · Log de depuración en producción
- `assistantStore.tsx` registraba con `console.log('STORE_SEND'…)` requestId y estado. Eliminado (contenía requestId contextual); los logs del proxy guardan eventos JSON sin cuerpos ni secretos (verificado).

### F-DEP-001 · RESUELTO · Vulnerabilidades en árbol de dependencias (audit inicial: 11; final: 0)
- `npm audit`: directas afectadas — `postcss` ≤ 8.5.22 (GHSA-r28c-9q8g-f849, GHSA-fxqj-rqcc-2cmp), `react-router-dom@7.18.1` (GHSA-qwww-vcr4-c8h2 en modo RSC; la app usa BrowserRouter sin RSC ni "actions", riesgo aplicable bajo, la exposición exige desplegar como server), `vitest@4.1.10` (moderado, solo dev).
- Explotabilidad en este proyecto, evaluada por ruta de uso real: `postcss` solo actúa en build; `react-router` no usa RSC/actions; `undici` del runtime de Node y `vitest` quedan por evaluar junto a la re-instalación del árbol. La prioridad práctica para `server/**` en producción es la versión de Node del runtime.
- Estado: **corregido en esta sesión** (con pnpm v10.34.5 instalado vía npm -g y `pnpm install --frozen-lockfile` verificando el árbol primero). Actualización dirigida sin saltos mayores: `postcss@8.5.28`, `undici@7.29.0` (transitiva de jsdom), `react-router-dom@^7.18.3` (fix RSC CSRF), `vitest@^4.1.11`, `brace-expansion@5.0.9`, `browserslist@4.28.7`, `baseline-browser-mapping@2.11.0`, `postcss-selector-parser@6.1.3`. `pnpm audit` → **No known vulnerabilities found**. Comparación de main/lockfile: solo menciones de versiones (`react-router-dom ^7.18.1→^7.18.3`, `vitest ^4.1.10→^4.1.11`, un `zebra-stripes` de lock reload). Suite completa (359 passed | 1 skipped), lint/typecheck/build en verde tras la actualización.

### F-PRIV-001 · INFO · Confirmación de consentimiento existe; URL legal y hosting pendientes
- `QuoteSelectionPage` exige `consentPrivacy` (checkbox) y `payload.ts` lo revalida. Pero la versión pública del enlace a la política no está confirmada en el repo (texto "Acepto la política de privacidad" sin `href` verificable). Permanece en pendiente del propietario (aparece también en `implement-product-detail-page` 1.5/8.10). No se inventa URL ni consentimiento.

## 4. Sinks revisados y puentes IA
- SQL/comandos: sin consultas SQL versionadas en `api/**`/`server/**` (DB solo se palpita vía n8n externo). Sink no verificado → frontera registrada, no obra "protegido".
- HTML: única pasada `dangerouslySetInnerHTML` (JSON-LD, hardened). Ningún `innerHTML`, `eval`, `new Function`, `window.open` con datos no codificados (`ContactForm` usa `encodeURIComponent` hacia `https://wa.me`).
- URLs/acciones IA: `AssistantActions` valida con `INTERNAL_PATH_PATTERN` + destinos oficiales allowlist; `transport/types.ts` valida `internalPath` (rechaza protocol-relative y esquemas) e imágenes contra `APPROVED_IMAGE_ORIGINS`. Los protocolos `javascript:`/destinos externos no se vuelven interactivos (escenarios del spec). Rehidratación validada (F-SEC-004).
- Inyección de prompts: el texto adversario viaja al workflow externo; el cliente/proxy no elevan permisos por él y ninguna salida del workflow decide permisos de aplicación. **El workflow global real no está probado desde aquí**; no se atribuye inmunidad.

## 5. Abuso y sesiones
- Rate limiting: no existe en el código versionado; un contador en memoria serverless no sería protección distribuida. El error `RATE_LIMITED` proviene del upstream (no verificado vigente). Pendiente de decisión de infraestructura externa (bloqueo documentado, no bloqueado local).
- CSRF: los endpoints son JSON-only sin cookies de sesión y encandidate CORS the same-origin; los clientes directos se sirven por `LRMQ_Chat_Inbound` hacia el upstream — dicho header autentica al frontend, no al usuario final (registrado como limitación). Quote `website` honeypot validado también server-side.
- Concurrencia de chat: bloqueo por `inFlightRequestIdRef` (un envío por pestaña); `REQUEST_IN_PROGRESS` gestionado como contrato del upstream.
- Timeout/reintentos: chat timeouts escalonados por turno; catálogo GET 8 s/2 intentos solo `TypeError`, POST sin reintentos, 10 s. Cubiertos por tests existentes.

## 6. Privacidad, secretos y logs
- `.env.example` sin secretos reales (placeholders + instrucciones); `.env*` real no versionado. Upstreams fuera de `VITE_*`.
- `dist/` grepeado: sin `n8n`, Neon, postgres ni URLs upstream en assets (build de verificación).
- Logs servidor: `logUpstream` JSON de eventos sin URLs/cuerpos/errores internos; los catch de chat/catálogo devuelven mensajes genéricos controlados. Informe no incluye valores sensibles.

## 6b. Conciliación de cambios anteriores (sin archivo automático)

- **Declaración del propietario (evidencia del propietario, no técnica); registrada en la conversación**: las comprobaciones visuales de `fix-responsive-chat-mobile`, del asistente y de la ficha se hicieron antes. No se atribuyen capturas, dispositivos ni medidas no entregados.
- `fix-responsive-chat-mobile` (28/31): restantes 6.2 (matriz de 19 viewports con acciones reales), 6.3 (comparación light-mode antes/después), 6.5 (informe por viewport). Son tareas de verificación visual, no de implementación; permanecen abiertas.
- `add-assistant-chat-ui` (0/36): incluye implementación, contratos y pruebas que el código ya cubre en parte, pero su casillero nunca se marcó; no se archiva por la aprobación visual. La revisión de seguridad de su servidor/proxy se audita aquí (F-SEC-001/002).
- `implement-product-detail-page` (73/78): abiertas 1.5 (URL de privacidad y hosting reales), 8.10 (foco/errores/enlace legal), 10.6 (recorrido real con n8n), 10.7 (criterios/evidencia), 11.5 (integración real); son pendientes técnicos/legales/externos distintos de la confirmación visual y no se cierran por inferencia.
- Cambios históricos en 100% (`audit-harden-catalog-basket-api`, `fix-duplach-details-and-visual-selectors`, `integrate-duplach-shower-trays`): consultables para el archivo cuando el propietario lo ordene; no se archiva nada aquí.
- **No se han cambiado casillas ni archivado cambios en esta etapa.**

## 7. Verificación ejecutada
- Repro executable: `npx vitest run server` (52 passed: 12 chat + 29 proxy + 6 quoteBody + 5 response) y suite completa `npm test` → **47 archivos / 359 passed | 1 skipped** (de 347 antes del cambio: +12 pruebas nuevas). En una de las ejecuciones completas se observó 1 fallo transitorio no reproducible en tres ejecuciones posteriores completas y en las repetidas del archivo implicado; queda en seguimiento durante la etapa siguiente.
- `npm run lint` (sin output), `npm run typecheck` limpio, `npm run build` correcto, `openspec validate audit-harden-repo-seo-security` OK.
- No ejecutado: verificación visual en navegador (matriz de viewports, revisión de metadatos renderizados en device real) — necesario para la etapa 2; previsto con Playwright/Chromium si está disponible.

## 8. Bloqueos externos y pendientes
1. **BLOQ-001** (F-SEO-004): soft 404 en URL directa de producto inexistente. Requiere prerender/SSR o configuración del hosting no disponible desde este repo. No se aplica catch-all.
2. **BLOQ-002** (F-SEO-002): cuerpo 404 de marca en petición directa. Depende del hosting definitivo confirmado por el owner (`implement-product-detail-page` 1.5). Alternativa local ya implementada para navegación cliente.
4. **BLOQ-004** (F-PRIV-001): URL pública de la política de privacidad + confirmación del hosting; el consentimiento y su almacenamiento tienen control local, pero la evidencia legal externa aún no existe.
5. Enumeración de fichas para sitemap (F-SEO-003): decisión con owner (generación en build con inventario del upstream vs. sitemap manual solo con fichas verificadas). ~~BLOQ-003 (F-DEP-001)~~: resuelto en esta sesión (ver F-DEP-001); reproducción: `pnpm audit` → 0 vulnerabilidades + suite en verde.

## 9. Gate hacia `refine-web-usability-accessibility`
- Correcciones locales aplicadas y verificadas con pruebas: F-SEC-001/002/003/004, F-DEP-001, F-SEO-001/003, F-LOW-001, F-LOG-001.
- Sin hallazgos CRIT locales abiertos. Hallazgos ALTA abiertos: **ninguno** (los tres ALTA se corrigieron y se prueban). Pendientes documentados: BLOQ-001, BLOQ-002 y BLOQ-004 (bloqueos/decisiones externas registradas, no éxitos).
- **Gate emitido**: la etapa 1 queda lista para pasar a usabilidad/accesibilidad con BLOQ-001/002/004 abiertos hasta evidencia específica. La segunda etapa debe leer este informe y no asumir cierres visuales o externos.
- Sin commit, push, archivo ni despliegue: quedan a decisión manual del propietario.
