## Why

Area LRMQ no tiene canal conversacional en la web: los visitantes de portada, catálogo y fichas de producto no disponen de una orientación guiada sobre reformas o productos publicados. Se solicita una primera interfaz funcional de pruebas del asistente, compartida entre las tres rutas y con el transporte preparado para conectarse después a un backend n8n (que se desarrollará por separado).

## What Changes

- Añade un chat flotante único en la web: lanzador discreto con animación de apertura tipo pop-up y panel identificado como "Asistente de Area LRMQ", disponible en `/`, `/productos` y `/productos/:slug` (y visible en el resto de rutas navegables).
- Añade mensaje inicial fijo, campo de texto, enviar, cerrar panel y "nueva conversación"; estados de espera, error recuperable, servicio no disponible y sesión caducada.
- Renderiza productos devueltos por el backend (nombre, características verificadas, motivo de recomendación y enlace interno), sin precios ni campos técnicos internos.
- Añade estado del chat a nivel compartido (provider en `App.jsx`) que sobrevive a la navegación; historial e identificador opaco de conversación se conservan en `sessionStorage` (no en `localStorage`); cerrar el panel no borra el chat; "nueva conversación" descarta identificador y respuestas pendientes.
- Añade contexto de navegación mínimo enviado con cada mensaje: ruta actual, slug del producto, filtros de catálogo leídos sin tocar su lógica, idioma `es`. Nunca DOM, textos de página, precios, formularios ni historial de navegación.
- Añade transporte HTTP contra `POST /api/chat/messages` según contrato V1 (version/conversationId/requestId/message/context; respuesta con message, products y actions navigate_internal | contact_official; errores INVALID_REQUEST, RATE_LIMITED, SESSION_EXPIRED, REQUEST_IN_PROGRESS, CHAT_UNAVAILABLE) con errors tipados, sin renderizar cuerpos sin validar ni HTML del modelo.
- Añade un adaptador de demostración (solo dev/pruebas, escenarios deterministas, fixtures de catálogo verificado) etiquetado "Modo de demostración"; nunca se activa automáticamente al fallar el backend real; en producción sin backend se muestra indisponibilidad.
- Añade proxy server-side de chat reutilizando el patrón del proxy de catálogo existente (`allowlist`, límite de tamaño, sin secretos en el navegador) — el endpoint del servidor queda dispuesto pero su backend IA es otra tarea.
- Revisión SEO ligera de portada y catálogo para asimilar el añadido (robots/meta adecuados al widget; sin contenido duplicado indexable).
- No modifica: workflows n8n, Neon, consultas del catálogo, sistema de presupuestos, landing visual ni del flujo de compra. Sin streaming, voz, adjuntos, login ni funciones de compra. Sin push ni despliegue.

## Capabilities

### New Capabilities
- `assistant-chat-shell`: lanzador, panel, animaciones de apertura, estados de interfaz (espera/error/indisponibilidad/sesión caducada), controles (enviar, cerrar, nueva conversación) y comportamiento del historial.
- `assistant-chat-state`: estado compartido entre portada/catálogo/fichas: persistencia en sessionStorage, identificador opaco, descarte de respuestas obsoletas, evitación de envíos duplicados y limpieza de estado en "nueva conversación".
- `assistant-chat-transport`: adaptadores HTTP y demostración contra el contrato V1 ( payloads, errores tipados, timeouts, requestId, demo-mode explícito ), más el punto server-side `POST /api/chat/messages` que reenvía al backend n8n futuro.
- `assistant-context-safety`: contexto de navegación permitido, validación de rutas internas de productos/acciones, destinos contact_official restringidos a los canales oficiales ya publicados, orígenes de imagen permitidos y render seguro del texto.
- `assistant-accessibility-ui`: accesibilidad del chat: foco/trampa de foco, Escape, anuncios aria-live del último mensaje, scroll propio del panel sin activar el scroll narrativo, teclado móvil y no-ocultamiento del lanzador frente a controles clave.

### Modified Capabilities
(ninguna — `openspec/specs/` no tiene capacidades previas que cambien a nivel de requisitos; las rutas de catálogo/presupuesto no alteran su comportamiento; la revisión SEO es ajuste de metadatos, no cambio de especificación.)

## Impact

- **Nuevos módulos frontend**: `src/features/assistant/**` (componentes del panel/lanzador, estado compartido con `sessionStorage`, transporte HTTP + adaptador demo, contrato tipado) montado bajo `App.jsx`.
- **Server**: nuevo entrypoint `api/chat/messages.js` + `server/chat/**` con allowlist y límites (coincide con el patrón de `server/catalog/proxy.js`); reutiliza estilo de vercel.json/rutas de entrada.
- **Touch mínimo, no funcional**: `src/App.jsx` (provider del chat + montaje del shell) y `vite.config.js` (proxy dev para `/api/chat`); revisión SEO (meta/robots) en portada y catálogo.
- **Docs**: `docs/chatbot-api-contract.md` con el contrato V1 y las instrucciones demo/producción.
- **Sin cambios** en: `server/catalog/**` (salvo tests no relacionados), `src/features/catalog/**` lógica, `src/features/quote/**`, workflows n8n, Neon, y sin pushes/despliegues.
