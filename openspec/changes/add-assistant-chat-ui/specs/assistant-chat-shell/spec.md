## ADDED Requirements

### Requirement: Lanzador discreto con apertura animada
El sistema SHALL mostrar un lanzador flotante discreto (botón pop-up) en las rutas `/`, `/productos` y `/productos/:slug` que, al activarse, abra el panel del asistente con una animación dinámica y fluida de entrada.

#### Scenario: Apertura del panel desde la portada
- **WHEN** el usuario pulsa el lanzador en `/`
- **THEN** el panel "Asistente de Area LRMQ" se abre con animación de entrada y el foco pasa al campo de mensaje

#### Scenario: El lanzador no tapa controles importantes
- **WHEN** el panel está cerrado en escritorio y móvil
- **THEN** el lanzador no solapa el header principal, enlaces de contacto ni el botón de presupuesto visibles

### Requirement: Composición del panel de chat
El panel del asistente SHALL incluir el mensaje inicial ("Hola, soy el asistente virtual de Area LRMQ. Puedo orientarte sobre reformas y ayudarte a encontrar productos de nuestro catálogo. ¿Qué necesitas?"), un campo de texto con botón enviar, un control de cerrar panel y un control de empezar conversación nueva.

#### Scenario: Panel recién abierto sin conversación
- **WHEN** el usuario abre el panel por primera vez en la pestaña
- **THEN** se muestra el mensaje inicial como mensaje del asistente, el campo de texto está vacío y el botón enviar está deshabilitado sin texto

### Requirement: Estados de la interfaz
La interfaz SHALL distinguir y representar estados de espera (envío en curso), error recuperable (con acción reintentar), servicio no disponible y sesión caducada, sin exponer detalles internos del error.

#### Scenario: Envío en curso
- **WHEN** se ha enviado un mensaje y la respuesta no ha llegado
- **THEN** se muestra un indicador de espera, el campo permanece deshabilitado y no se admite un segundo envío del mismo mensaje

#### Scenario: Error recuperable
- **WHEN** el servidor responde `CHAT_UNAVAILABLE` retryable con un fallo temporal de transporte
- **THEN** se muestra el mensaje de error del contrato con botón "Reintentar" que repite el envío

#### Scenario: Servicio no disponible
- **WHEN** en producción no hay backend de chat disponible (fallo de red permanente o endpoint ausente)
- **THEN** se muestra un aviso de servicio no disponible y no se activa el modo demostración automáticamente

#### Scenario: Sesión caducada
- **WHEN** el servidor responde `SESSION_EXPIRED`
- **THEN** la interfaz informa de la caducidad, limpia el identificador local y prepara una conversación nueva manteniendo el texto que el usuario estaba escribiendo

### Requirement: Cerrar el panel conserva el chat
Cerrar el panel SHALL ocultar la ventana sin borrar el historial de la interfaz ni el identificador de conversación activo.

#### Scenario: Reabrir después de cerrar
- **WHEN** el usuario cierra el panel y lo reabre tras enviar mensajes
- **THEN** el historial y el estado de conversación se mantienen intactos

### Requirement: Tarjeta de producto recomendado
Cuando el backend devuelve productos, la interfaz SHALL renderizar cada uno como tarjeta con nombre, características verificadas (facts) y motivo de recomendación, con enlace interno al fichero de producto; SHALL NOT mostrar precios ni campos técnicos internos.

#### Scenario: Respuesta con productos
- **WHEN** llega una respuesta con `products` válidos
- **THEN** cada tarjeta muestra nombre, facts, motivo y enlace interno funcional; ningún elemento muestra precio ni identificadores técnicos internos salvo el enlace interno

#### Scenario: Respuesta sin productos
- **WHEN** llega una respuesta con `products: []`
- **THEN** solo se muestra el texto de respuesta del asistente, sin área de carrusel vacía
