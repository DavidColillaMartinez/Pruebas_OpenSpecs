## 1. Contrato y foundation

- [ ] 1.1 Redactar `docs/chatbot-api-contract.md` con el contrato V1 (payload, respuesta satisfactoria, `products`, `actions navigate_internal|contact_official`, los 5 errores y `retryable`) y las instrucciones para probar el modo demostración y conectar el transporte real más adelante.
- [ ] 1.2 Crear `src/features/assistant/transport/types.ts` con los tipos del contrato V1 y los validadores de esquema de respuesta (message/products/actions, errores tipados) siguiendo el patrón de validación de `src/features/quote/model/payload.ts`.
- [ ] 1.3 Añadir `CHAT_UPSTREAM_URL` y `VITE_ENABLE_ASSISTANT_DEMO` como placeholders en `.env.example` (sin URLs de n8n reales ni secretos).

## 2. Estado compartido

- [ ] 2.1 Implementar `src/features/assistant/model/assistantStore.tsx` (Provider + reducer): mensajes, `conversationId`, `isSending`, estado (`idle|sending|unavailable|expired`), `pendingRequest` para descartar respuestas obsoletas y bloqueo de envíos duplicados; montar el provider en `App.jsx` junto a `QuoteSelectionProvider`.
- [ ] 2.2 Persistencia en `sessionStorage` (claves con prefijo `area-lrmq:assistant:`) del historial de interfaz e identificador opaco, con rehidratación al recargar la pestaña; sin `localStorage`.
- [ ] 2.3 Implementar la lógica de "nueva conversación": restablecer al mensaje inicial, invalidar el identificador anterior y descartar respuestas pendientes de la conversación previa.
- [ ] 2.4 Tests del store: continuidad al navegar (portada↔catálogo↔ficha), rehidratación tras recarga, nueva conversación descarta respuesta tardía, no envíos duplicados.

## 3. Transporte

- [ ] 3.1 Implementar `src/features/assistant/transport/httpFetchAdapter.ts`: `POST /api/chat/messages` con `AbortSignal.timeout(10000)`, `requestId` con `crypto.randomUUID()`, `version: 1`, `locale: "es"`, y mapeo de los 5 errores a los estados de la interfaz; sin reintentos automáticos y sin streaming.
- [ ] 3.2 Implementar `src/features/assistant/transport/demoAdapter.ts` con escenarios deterministas (saludo, búsqueda/lookup de productos, contacto por canales oficiales) sobre fixtures de productos ya verificados del catálogo (sin inventar medidas ni referencias), y banda "Modo de demostración" cuando actúe.
- [ ] 3.3 Cable de selección de adapter: HTTP por defecto; demo solo si `import.meta.env.DEV && VITE_ENABLE_ASSISTANT_DEMO === '1'`; nunca demo en producción ni autoactivado por fallo del backend real.
- [ ] 3.4 Tests de transporte: primer mensaje con `conversationId: null`, mensajes con identificador y sin historial en el cuerpo, context V1 correcto, rechazo de cuerpos no válidos del contrato, mapping de `SESSION_EXPIRED`→estado expirado, y `REQUEST_IN_PROGRESS` sin relanzar.

## 4. Contexto de navegación y seguridad de payloads

- [ ] 4.1 Implementar `src/features/assistant/model/useChatContext.ts`: lee `useLocation` (pagePath), slug de la ficha si existe, filters del catálogo leyendo el estado ya existente sin tocar la lógica de filtros ni consultas, y `locale: "es"`; nunca DOM, textos, precios, formularios ni historial.
- [ ] 4.2 Implementar validadores de seguridad: rutas internas permitidas (`/productos/**` y navegación interna de la web), `contact_official` restringido a los destinos oficiales ya publicados por la configuración de contacto del sitio, imágenes solo con los orígenes de assets aprobados del catálogo, y render de texto plano seguro (sin `dangerouslySetInnerHTML`).
- [ ] 4.3 Tests de los validadores: destino interno válido/inválido, canal oficial permitido/desconocido, origen de imagen aprobado/no aprobado, texto con HTML se renderiza literal.

## 5. Interfaz (shell)

- [ ] 5.1 Implementar `ChatLauncher`: botón pop-up flotante con animación dinámica y fluida de apertura (usando tokens existentes porcelain/ink/clay y las mismas convenciones de movimiento de la web), discreto en escritorio y móvil, que no tape header, contacto ni presupuesto.
- [ ] 5.2 Implementar `ChatPanel`: identificado "Asistente de Area LRMQ", mensaje inicial, campo de texto + enviar (con bloqueo durante envío), cerrar panel, y "nueva conversación"; scroll interno con `overscroll-behavior: contain` que no active el scroll narrativo de la portada.
- [ ] 5.3 Implementar `ProductCard` y `AssistantMessage` renderizando texto seguro, facts verificados, motivo de recomendación y enlace interno validado; sin precios ni campos técnicos internos; imagen solo de orígenes aprobados con `loading="lazy"`.
- [ ] 5.4 Estados de la interfaz: espera (con bloqueo de segundo envío), error recuperable con "Reintentar", servicio no disponible, y sesión caducada (limpia identificador y prepara conversación nueva conservando el texto en borrador).
- [ ] 5.5 Montar el shell en `App.jsx` dentro de `BrowserRouter` para las rutas existentes; el launcher no altera la composición visual de portada, catálogo ni fichas (smallest change, light-mode intact).

## 6. Accesibilidad

- [ ] 6.1 Gestión de foco: al abrir, foco en el campo; focus trap dentro del panel con Tab; Escape cierra devolviendo el foco al lanzador (con test de interacción).
- [ ] 6.2 `aria-live="polite"` en un contenedor del último mensaje (sin releer todo el historial) y `role="dialog"` con `aria-label`.
- [ ] 6.3 Scroll del panel contenido (wheel/gesto no arrastra la portada) y comportamiento con teclado virtual en móvil: altura con `dvh`/visualViewport-safe, último mensaje visible y lanzador sin tapar controles.
- [ ] 6.4 Tests de accesibilidad y del componente (roles, labels, teclado, scroll del panel).

## 7. Entrypoint server-side (dispuesto, sin backend IA)

- [ ] 7.1 Implementar `server/chat/proxy.js` con el patrón del proxy de catálogo: allowlist de claves del cuerpo, límite de payload (64 KB), headers aceptables, upstream `CHAT_UPSTREAM_URL`, timeout del upstream y mapeo de fallos a errores del contrato (`CHAT_UNAVAILABLE` retryable=false cuando no hay upstream configurado; `INVALID_REQUEST` para cuerpo inválido; `SESSION_EXPIRED` passthrough).
- [ ] 7.2 Crear `api/chat/messages.js` como entrypoint explicit (mismo patrón que `api/catalog/*`) para despliegue en el servidor de la app.
- [ ] 7.3 Añadir proxy dev de `/api/chat` en `vite.config.js` (como el de catálogo) para desarrollo.
- [ ] 7.4 Tests del proxy: cuerpo inválido → `INVALID_REQUEST`, payload sobre el límite → 413 sin reenviar, sin upstream → `CHAT_UNAVAILABLE`, passthrough satisfactorio de una respuesta válida simulada, y sin listar secretos.

## 8. Integración y revisión ligera de ecosistema

- [ ] 8.1 Revisión SEO ligera de portada y catálogo (metadatos vigentes no alterados; chat no genera DOM indexable nuevo; sin JSON-LD duplicado) — ajustes mínimos solo si detectamos impacto del widget.
- [ ] 8.2 Verificar que no se toca nada protegido: sin cambios en `server/catalog/**`, lógica de `features/catalog`, `features/quote`, workflows n8n, Neon, y sin tocar CompareSlider/Vision (brief de temas no aplica aquí pero sí: no redeñar secciones).
- [ ] 8.3 GitHub Actions/lint: comprobar que lint y typecheck cubren los ficheros nuevos (añadir las rutas de `features/assistant` y `server/chat` a los globs del script de lint si es preciso); ejecutar lint, typecheck, build y suite completa.

## 9. Validación y entrega

- [ ] 9.1 Suite completa en verde: `npx vitest run`, `npm run typecheck`, `npm run lint`, `npm run build`.
- [ ] 9.2 Validación funcional manual (dev con backend real no disponible → debería ver CHAT_UNAVAILABLE, no demo): abrir, enviar, cerrar y reabrir; continuar mientras navega portada↔catálogo↔ficha; recargar y recuperar estado; empezar conversación nueva sin respuestas pendientes; estados de espera, fallo y sesión caducada; tarjetas y enlaces seguros.
- [ ] 9.3 Validar modo demostración manualmente en dev con la bandera activa: escenarios deterministas y banda "Modo de demostración" visible.
- [ ] 9.4 Validación visual escritorio y móvil de portada, catálogo y ficha con el chat: coherencia con el light-mode existente, sin solapes con header/contacto/presupuesto, revisando también que la interacción de scroll de portada sigue intacta, y que filtros y presupuesto no cambian su comportamiento.
- [ ] 9.5 Comprobar que el bundle principal no crece de forma desproporcionada (el shell del asistente carga de forma perezosa o vw; documentar el tamaño resultante); sin secretos ni URLs de n8n en `dist/` (grep anti-filtración).
- [ ] 9.6 Recapitular la entrega en el resumen final: archivos modificados, `docs/chatbot-api-contract.md`, instrucciones demo y de conexión de transporte, evidencias de validación y pendientes (backend n8n IA es otra tarea). Sin push ni despliegues.
