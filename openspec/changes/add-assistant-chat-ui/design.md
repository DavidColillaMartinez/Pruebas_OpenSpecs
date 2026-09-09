## Context

La web ya tiene: portada narrativa (scroll por capítulos `useNarrativeScroll`), catálogo con streaming/facetas, fichas con LazyRoutes, presupuesto sin backend IA y un proxy de catálogo endurecido (`server/catalog/proxy.js` con allowlist de query, límite 64 KB, headers de seguridad en `vercel.json` con CSP en enforce). La infraestructura del asistente (backend n8n + IA) es otra tarea; aquí se construye la interfaz, el estado compartido y el transporte/cliente de chat, + el entrypoint server-side dispuesto para el futuro upstream.

Restricciones vigentes (AGENTS.md):
- Preservar el light-mode y el flujo de compra actuales (smallest change).
- No tocar `server/catalog/**` ni el contrato de producción del catálogo.
- No secretos en el navegador; sin push/despliegues; los workflows n8n/Neon son out-of-scope.
- Aprovechar skills `impeccable`/`frontend-design`/`tailwind-css-patterns`/`seo` y los tokens existentes (porcelain/ink/clay, display/body) guardando la armonía visual.

Arquitectura actual de la App:
- `App.jsx` monta `QuoteSelectionProvider` + rutas; el landing usa composición por capítulos con scroll narrativo (de aquí la necesidad de scroll propio del panel).
- `sessionStorage` es el patrón ya existente en `features/quote/model/selectionStore` para persistencia por pestaña (sin `localStorage`).

## Goals / Non-Goals

**Goals:**
- Un único chat compartido (provider a nivel de App) puenteado al router.
- Interfaz sencilla para pruebas: lanzador animado, panel, estados, tarjetas de producto, acciones tipadas.
- Transporte HTTP según contrato V1 + adaptador demo reproducible solo para dev.
- Contrato documentado en `docs/chatbot-api-contract.md`.
- Accesibilidad y cabida visual respetuosa con el sistema existente.

**Non-Goals:**
- Backend IA real, workflows n8n, Neon,咀rates, streaming, voz, imágenes adjuntas, login, formularios adicionales, funciones de compra.
- Simular IA con respuestas comerciales prefabricadas en producción (el disponible en prod es el estado de indisponibilidad).
- Reestructurar catálogo, presupuestos o landing visual (solo revisión SEO ligera).

## Decisions

### D1 — Estado del chat: provider + `sessionStorage` (patrón `selectionStore`)
**Elección**: nuevo `src/features/assistant/model/assistantStore.tsx` con `AssistantProvider` montado bajo `App.jsx` (hermano de `QuoteSelectionProvider`). Estado: `messages`, `conversationId`, `isSending`, `lastError`, `status` (idle|sending|unavailable|expired), `pendingRequest` para descarto; persistencia `sessionStorage` con la misma convención de claves que el presupuesto (`area-lrmq:assistant:`).
**Racional**: reusuario del patrón existente (contexto + reducer) que ya garantiza una única fuente y storage por pestaña. Alternativa descartada: estado local en una página (se pierde al navegar) o `localStorage` (prohibido por el brief).

### D2 — Estructura de feature `src/features/assistant/**`
Separación por capas igual que `features/catalog`:
- `pages/index` no aplica: el chat no es una página, es un componente global `AssistantShell` montado en `App.jsx` (justo dentro de `BrowserRouter`).
- `components/` → `ChatLauncher`, `ChatPanel`, `ProductCard`, `AssistantMessage` (render seguro).
- `model/` → store + helper de contexto de navegación (`useChatContext()` que lee `useLocation`, `useParams` y señales del catálogo existentes vía hook ligero sin modificarlas).
- `transport/` → adapter HTTP (`httpFetchAdapter`) + adapter demo (`demoAdapter`), y contrato tipado en `transport/types.ts`.

### D3 — Transporte: adaptador con timeout + requestId estable
**Elección**: función `sendMessage()` del adapter HTTP con `AbortSignal.timeout(10000)` (coincide con el timeout del cliente del catálogo), bloqueo por `isSending`, `requestId` generado con `crypto.randomUUID()` (ya disponible y en uso en `payload.ts` del presupuesto), y manejo tipado de los 5 errores del contrato. Sin reintentos automáticos: reintentar es una acción del usuario.
**Racional**: mismo comportamiento que el flujo de presupuesto;simple y auditable. Alternativa descartada: reintentos automáticos ocultos (podría duplicar mensajes en el backend).

### D4 — Entrypoint server-side reutilizando el patrón del catálogo
**Elección**: `api/catalog/*` ya usa el patrón con `server/catalog/proxy.js`. Para chat: nuevo `server/chat/proxy.js` + entrypoint `api/chat/messages.js` con:
- allowlist de claves permitidas del cuerpo (`version`, `conversationId`, `requestId`, `message`, `context` con { pagePath, productSlug, filters, locale });
- límite de tamaño de cuerpo de envío (64 KB como el presupuesto);
- env upstream desde `process.env.CHAT_UPSTREAM_URL` (placeholder en `.env.example`, sin URL de n8n concreta);
- sinsellos (no keys), respuesta con shape del contrato y mapeo de timeouts del upstream a `CHAT_UNAVAILABLE` retryable:
-En dev, `vite.config.js` añade proxy `/api/chat` → `server` siguiendo el patrón de `/api/catalog`.
**Racional**: uniforme con el resto del server, sin secretos del navegador. Alternativa descartada: llamada directa del navegador a n8n (expondría URL de webhook: prohibido).

### D5 — Adaptador demo: fixtures del catálogo verificado y opt-in por env de dev
**Elección**: `demoAdapter` con 3 escenarios deterministas (saludo, búsqueda de producto de mueble de baño, contacto) leyendo fixéstes del catálogo ya existentes (`src/features/catalog` fixtures de test más relevantes, o seeds de productos que aparecen en tests de `DOMContentLoaded del catálogo). Activación: `VITE_ENABLE_ASSISTANT_DEMO=1` (solo dev en `.env.example` nunca en prod) — sin autoactivar si el backend real falla, siempre con banda "Modo de demostración".
**Racional**: reproducible y revisable sin IA real; protegido contra activación accidental en producción.

### D6 — Accesibilidad del panel: focus trap + aria-live de último mensaje
Componente panel con `role="dialog"`, `aria-label="Asistente de Area LRMQ"`, `inert`/focus-trap manual (misma convención de foco que ya usa `MobileDrawer`), `aria-live="polite"` sobre un contenedor "último mensaje"resumido, y `Escape` cierra. Scroll del panel con `overscroll-behavior: contain` (evita interferir con `useNarrativeScroll` del landing). Feed solo del último mensaje para no releer el historial completo.

### D7 — Render seguro y validación de payloads
- Mensajes: `React.Fragment` texto plano (nunca `dangerouslySetInnerHTML`).
- `ProductCard`/acciones: validador del contrato (`isInternalPath`, `isOfficialContactTarget`, `isApprovedImageSrc`) basado en la lista de orígenes de assets ya aprobados del catálogo.
- Adoptamos el patrón de validación ya usado en `payload.ts` del presupuesto (`IDENTIFIER_PATTERN` y errores por prefixo), no estructuras nuevas.

### D8 — SEO-light de portada y catálogo
El widget no añade indexable (JS toggle + contenido), así que solo:
- portada y catálogo: comprobar robots semanticos (transclusion del contenido del chat no lo cambiará), y revisar los meta descriptions vigentes.
- No se añaden JSON-LD nuevos (evita espacio sin comportamiento del asistente cuando el chat no es part del indexado).
**Racional**: el asistente es funcional, no contenido SEO; la revisión se limita a que portada/catálogo no pierdan los metade datos ni generen un segundos DOM indexable.

## Risks / Trade-offs

- **[Riesgo] El panel puede interferir con el scroll narrativo de la portada** → Mitigado con `overscroll-behavior: contain` en el chat + `stopPropagation` en wheel dentro del panel; verificado manualmente en desktop.
- **[Riesgo] `SESSION_EXPIRED` llega al usuario por sorpresa** → estado informativo específico que reinicia localmente sin borrar lo que el usuario escriba; backend mantendrá su propia caducidad.
- **[Riesgo] El entrypoint server-side queda expuesto sin backend IA configurado** → responde `CHAT_UNAVAILABLE` (retryable=false) y los tests del proxy garantizan tal default; la interfaz muestra indisponibilidad.
- **[Riesgo] Modo demo se olvida activado en despliegues** → bandera solo leída en dev (`import.meta.env.DEV && VITE_ENABLE_ASSISTANT_DEMO=1`), y banda visible "Modo de demostración" mientras esté activo.
- **[Riesgo] El lanzador tapa el botón de presupuesto en vista móvil corta** → posición probada en móvil y tablet; el lanzador se oculta cuando el panel de presupuesto del header tiene foco (o se aloja en un corner seguro).
- **[Trade-off] Sin streaming, los mensajes largos del backend future tardaran más en verse** → aceptado por el brief; primera versión.
- **[Trade-off] La revisión SEO es ligera y no específica del chatbot** → aceptado: el chat no es contenido indexable; el detalle SEO general pertenece a otra tarea.

## Migration Plan

Feature flag del lado del server: el endpoint `POST /api/chat/messages` se despliega junto con el resto del bundle y RTP del asistente, pero no exige al backend n8n (que no existe aún). Rollback trivial: hacer revert del commit de implementación (todo bajo `src/features/assistant/**`, `server/chat/**`, `api/chat/**`, másАнfew lines en `App.jsx`/`vite.config.js` y `vercel.json`).

## Open Questions

- La URL definitiva y del backend n8n de chat es desconocida (se queda `CHAT_UPSTREAM_URL` placeholder). La integra real será otra tarea.
- Dónde"It If corre exactamente el backend de producción (¿mismo Vercel serverless o un servicio aparte?) puede cambiar el entrypoint; lo documentamos en `docs/chatbot-api-contract.md`.
