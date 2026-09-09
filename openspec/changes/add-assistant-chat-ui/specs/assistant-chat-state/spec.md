## ADDED Requirements

### Requirement: Estado compartido entre rutas
El estado del chat (mensajes de la interfaz, identificador de conversación y estado de envío) SHALL residir en un shared provider montado en `App.jsx`, de forma que sobreviva a la navegación entre `/`, `/productos` y `/productos/:slug` sin reiniciarse.

#### Scenario: Continuar al navegar
- **WHEN** el usuario mantiene una conversación abierta y navega de la portada al catálogo
- **THEN** el historial de la interfaz y el identificador de conversación persisten sin reinicio ni petición nueva

### Requirement: Persistencia por sesión de pestaña
El historial de interfaz y el identificador opaco de conversación SHALL conservarse en `sessionStorage` para recuperarse al recargar la misma pestaña. El sistema SHALL NOT usar `localStorage` para memoria entre visitas.

#### Scenario: Recarga de pestaña
- **WHEN** el usuario recarga la pestaña tras una conversación iniciada
- **THEN** el historial y el identificador se restauran desde `sessionStorage`; si un envío estaba en curso se muestra en estado recuperable, sin mostrar una respuesta que nunca llegó

### Requirement: Nueva conversación descarta estado y respuestas pendientes
El control "nueva conversación" SHALL limpiar el estado local (historial de interfaz restablecido al mensaje inicial) e invalidar el identificador anterior, y SHALL NOT incorporar a la conversación nuevas respuestas pendientes de la anterior.

#### Scenario: Respuesta antigua tras reiniciar
- **WHEN** hay una petición en curso y el usuario empieza una conversación nueva antes de recibirse la respuesta
- **THEN** la respuesta tardía se descarta y no aparece en el chat nuevo

#### Scenario: Peticiones no duplicadas
- **WHEN** el usuario pulsa "enviar" de forma repetida mientras una petición está en curso
- **THEN** solo se envía una petición (bloqueo por estado de envío en curso)

### Requirement: Duración del backend no comprometida por la interfaz
La interfaz SHALL NOT prometer que cerrar la pestaña borra datos en el servidor; la caducidad de la conversación en el backend es responsabilidad del propio backend y la interfaz solo informa de `SESSION_EXPIRED` mediante su estado correspondiente.

#### Scenario: Copia informativa
- **WHEN** se muestra cualquier aviso sobre caducidad
- **THEN** el texto habla del estado de la sesión con el asistente y no garantiza borrado inmediato de datos en el servidor
