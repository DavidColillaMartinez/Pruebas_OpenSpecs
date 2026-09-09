## ADDED Requirements

### Requirement: Contrato V1 de mensajes
El cliente SHALL enviar cada mensaje con `POST /api/chat/messages` con el cuerpo `{ version: 1, conversationId: <opaque|null>, requestId: <uuid>, message: <texto>, context: { pagePath, productSlug, filters, locale: "es" } }`, con `conversationId: null` en el primer mensaje de la conversación. El cliente SHALL NOT reenviar el historial: la memoria es del backend.

#### Scenario: Primer mensaje de una conversación
- **WHEN** el usuario envía su primer mensaje y no hay identificador de conversación
- **THEN** el cuerpo incluye `conversationId: null`, un `requestId` nuevo y el contexto de navegación permitido

#### Scenario: Mensajes siguientes
- **WHEN** el usuario envía un mensaje y existe identificador devuelto por el servidor
- **THEN** el cuerpo incluye ese `conversationId` opaco y un `requestId` nuevo, sin historial en el cuerpo

### Requirement: Procesado segura de la respuesta
El transporte SHALL aceptar únicamente respuestas válidas del contrato V1 (`{ version, conversationId, requestId, message, products, actions }` o errored tipados) y SHALL HAS descartar cuerpos que no validen el esquema, sin renderizar nunca HTML arbitrario del modelo ni errores internos sin validar.

#### Scenario: Respuesta satisfactoria
- **WHEN** el servidor responde 200 con cuerpo válido y `conversationId` opaco
- **THEN** el transporte entrega el mensaje, los products y las actions al estado del chat y memoriza el identificador para los siguientes mensajes

#### Scenario: Errores del contrato
- **WHEN** el servidor responde con `INVALID_REQUEST`, `RATE_LIMITED`, `SESSION_EXPIRED`, `REQUEST_IN_PROGRESS` o `CHAT_UNAVAILABLE`
- **THEN** el transporte los traduce a los estados de la interfaz (`RATE_LIMITED`, con espera indicada; `REQUEST_IN_PROGRESS` no vuelve a lanzar la misma petición) y nunca muestra el cuerpo crudo ni trazas internas

### Requirement: Punto de entrada server-side sin secretos en el navegador
La aplicación SHALL exponer `POST /api/chat/messages` en su servidor (entrypoint Vercel/recurso `api/chat/**` y módulo `server/chat/**` con inicial) que reenvíe la llamada al backend futuro, con allowlist de claves del cuerpo, límite de tamaño de payload y sin claves de IA, URLs de n8n ni secretos accesibles desde el navegador.

#### Scenario: Payload fuera de contrato
- **WHEN** llega un POST con cuerpo mayor que el límite o con claves no permitidas
- **THEN** el entrypoint responde `INVALID_REQUEST` (o `PAYLOAD_TOO_LARGE` como los entrypoints del catálogo) sin reenviar al backend

#### Scenario: Backend no configurado en producción
- **WHEN** la variable de entorno del upstream de chat no está configurada
- **THEN** el entrypoint responde `CHAT_UNAVAILABLE` retryable=false y el navegador no actúa demo mode

### Requirement: Adaptador de demostración opt-in
El sistema SHALL incluir un adaptador de demostración con escenarios deterministas basados en fixtures de productos del catálogo ya verificados (sin inventar medidas ni referencias). El adaptador SHALL activarse solo mediante una bandera de desarrollo/pruebas, SHALL announce claramente "Modo de demostración" en la interfaz y SHALL NOT activarse automáticamente cuando falle el backend real (ni nunca en producción sin la bandera).

#### Scenario: Activación intencionada
- **WHEN** el desarrollo se ejecuta con la bandera de demostración activada (solo dev)
- **THEN** la interfaz muestra "Modo de demostración" y las respuestas provienen de escenarios deterministas reproducibles

#### Scenario: Fallo del backend real no activa demo
- **WHEN** el transporte real falla en dev sin la bandera de demostración
- **THEN** se muestra el estado de error/indisponibilidad; el adaptador demostrativa no se usa

## ADDED Requirements: Sin streaming
El transporte SHALL NOT implementar streaming (SSE/WebSockets/chunks) en esta versión; toda respuesta llega como un único cuerpo JSON del contrato.

#### Scenario: Respuesta única
- **WHEN** llega la respuesta del backend
- **THEN** se renderiza una única vez al terminar de recibir completa; no hay renderizado incremental parcial
