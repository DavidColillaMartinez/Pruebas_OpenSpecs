# Contrato de chat del asistente de Area LRMQ — V1

Estado: propuesta V1 implementada en la interfaz/cliente. El backend de IA (n8n) se desarrolla por separado y se conectará a través del servidor de la aplicación.

## Endpoint

`POST /api/chat/messages`

- Transporte: JSON (`content-type: application/json`), sin streaming en V1.
- El navegador nunca llama a n8n directamente: pasa por el propio servidor de la app (entrypoint `api/chat/messages.js` → `server/chat/proxy.js`), igual que el catálogo. El upstream se configura con `CHAT_UPSTREAM_BASE_URL` y `CHAT_UPSTREAM_AUTH_VALUE` en el servidor; el proxy envía el secreto como cabecera `LRMQ_Chat_Inbound` y no hay claves ni URLs de n8n en el navegador.

## Petición

```json
{
  "version": 1,
  "conversationId": null,
  "conversationTurn": 0,
  "requestId": "9f7d0d61-8a44-4bfa-b7e2-8ff3d20716a1",
  "message": "Busco un mueble de baño de 80 cm",
  "context": {
    "pagePath": "/productos",
    "productSlug": null,
    "filters": {},
    "locale": "es"
  }
}
```

- `conversationId`: `null` en el primer mensaje de la conversación; en los siguientes, el identificador opaco devuelto por el servidor. El cliente no reenvía el historial: la memoria es del backend.
- `conversationTurn`: contador acotado de mensajes enviados en esta conversación, empezando en `0`. Solo sirve para coordinar un margen de espera progresivo; el servidor lo valida y nunca permite solicitar tiempos ilimitados. Un cliente antiguo puede omitirlo y el servidor usará `0` o `1` según exista `conversationId`.
- `requestId`: UUID generado en el navegador por mensaje; permite rastrear/descartar respuestas tardías (`REQUEST_IN_PROGRESS`).
- `context`: solo ruta actual, slug del producto abierto (si existe), filtros ya activos del catálogo (leídos sin modificar su lógica) e idioma `es`. Nunca DOM, textos de página, precios, datos de formularios ni historial de navegación.

## Respuesta satisfactoria

```json
{
  "version": 1,
  "conversationId": "opaque-session-id",
  "requestId": "9f7d0d61-8a44-4bfa-b7e2-8ff3d20716a1",
  "message": "Respuesta del asistente",
  "products": [
    {
      "productId": "royo-…",
      "slug": "royo-royo-alfa-compact-…",
      "name": "Alfa Compact fondo 46 100 2C - Mueble + Lavabo",
      "internalPath": "/productos/royo-royo-alfa-compact-…",
      "imageUrl": "https://assets.colilladavid.es/…",
      "facts": ["76–100 cm", "Acabados lacados"],
      "recommendationReason": "Coincide con la anchura aproximada que buscas."
    }
  ],
  "actions": [
    { "type": "contact_official", "label": "WhatsApp", "target": "whatsapp" }
  ]
}
```

Producto: `productId`, `slug`, `name`, `internalPath` e `imageUrl` opcional; solo orígenes de imagen aprobados del catálogo (`assets.colilladavid.es`). Cuando existe, `imageUrl` es la portada publicada del producto y se muestra como preview lazy en la tarjeta; si el asset falla o falta, la tarjeta conserva el enlace y muestra un fallback accesible. La interfaz no muestra precios ni campos técnicos internos.

Acciones: `type` (`navigate_internal` | `contact_official`), `label`, `target`.

- `navigate_internal`: `target` = ruta interna (mismo origen, normalmente `/productos/...`); se valida antes de renderizar.
- `contact_official`: `target` = canal oficial exacto ya publicado en la web (`whatsapp`, `phone`, `instagram`, `map`). Nunca enlaces arbitrarios; el destino real se resuelve desde `src/data/business.js`.

Si el contrato difiere de lo implementado el día de la integración, documentar la discrepancia aquí antes de introducir alternativas en el cliente.

## Errores

```json
{
  "version": 1,
  "requestId": "9f7d0d61-8a44-4bfa-b7e2-8ff3d20716a1",
  "error": {
    "code": "CHAT_UNAVAILABLE",
    "message": "Ahora mismo no podemos responder. Inténtalo de nuevo más tarde.",
    "retryable": true
  }
}
```

Códigos:

| Código | Significado | `retryable` típico |
|---|---|---|
| `INVALID_REQUEST` | Cuerpo fuera de contrato | `false` |
| `RATE_LIMITED` | Demasiadas peticiones | `true` |
| `SESSION_EXPIRED` | La conversación del servidor expiró | `false` |
| `REQUEST_IN_PROGRESS` | Ya hay otra petición en curso para esa conversación | `true` |
| `CHAT_UNAVAILABLE` | Servicio no disponible (sin upstream, fallo de red) | según caso |

La interfaz nunca muestra cuerpos crudos ni detalles internos; solo el estado asociado.

## Proxy del servidor (comportamiento del servidor propio)

- Allowlist de claves: `version`, `conversationId`, `conversationTurn`, `requestId`, `message`, `context` (con `pagePath`, `productSlug`, `filters`, `locale`). Cualquier otra clave → `INVALID_REQUEST`.
- El tiempo de espera del upstream es adaptativo: `15 s` para el primer turno, `19 s` para el segundo, `23 s` para el tercero y `30 s` como máximo desde el cuarto. El navegador, el proxy y n8n aplican la misma escala con margen para transportar y validar la respuesta.
- Límite de cuerpo: 64 KB; excedido → `413 PAYLOAD_TOO_LARGE` sin reenviar al upstream.
- Sin `CHAT_UPSTREAM_BASE_URL` o `CHAT_UPSTREAM_AUTH_VALUE` configurada: `502` con `CHAT_UNAVAILABLE` (`retryable: false`) — la interfaz muestra "servicio no disponible" y el modo demostración no se activa nunca de forma automática.
- El proxy no reintenta POST automáticos y no contiene secretos de IA.

## Modo demostración

Solo desarrollo/dev: bandera `VITE_ENABLE_ASSISTANT_DEMO=1` (ver `.env.example`). El adaptador demo responde con escenarios deterministas construidos sobre los fixtures ya verificados del catálogo (`src/features/catalog/api/fixtures/`), etiqueta "Modo de demostración" en la interfaz y nunca se activa automáticamente si el backend real falla.

## Cómo conectar el transporte real (futuro backend n8n)

1. Configurar `CHAT_UPSTREAM_BASE_URL` con la URL de producción `/webhook/lrmq-chat-v1` y `CHAT_UPSTREAM_AUTH_VALUE` con el valor de la credencial Header Auth `LRMQ_Chat_Inbound`, siempre como secretos del servidor y no como `VITE_*`.
2. El backend debe implementar el payload de respuesta de arriba y la política de caducidad de sesión del lado servidor.
3. El frontend ya llama a `/api/chat/messages`; no se requiere ningún cambio de dominio en la interfaz.
4. Turn on rate limiting en n8n/proxy correspondientes (acción backend, fuera del alcance del frontend).
