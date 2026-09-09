## ADDED Requirements

### Requirement: Chat panel fits mobile viewports
El chatbot SHALL adapt between 320 px and 480 px de ancho, en alturas reducidas, landscape y con teclado virtual, sin overflow horizontal ni compresión o solapamiento entre el título, "Nueva conversación" y el cierre. El panel SHALL respetar `dvh`/`svh` y `safe-area-inset-bottom`, y sus controles táctiles principales SHALL medir al menos 44 px.

#### Scenario: Chat en móvil estrecho
- **WHEN** el usuario abre el chatbot a 320x568, 360x800 o 375x812
- **THEN** el título, nueva conversación, cierre, hilo y compositor permanecen utilizables dentro del viewport sin overflow horizontal

#### Scenario: Altura reducida y teclado virtual
- **WHEN** el usuario enfoca el compositor en 568x320 landscape o con el teclado virtual abierto
- **THEN** el panel conserva una zona razonable para la conversación, mantiene visible el compositor y respeta el área segura inferior

#### Scenario: Cierre táctil
- **WHEN** el usuario toca el botón de cierre en cualquier viewport móvil
- **THEN** el área interactiva tiene al menos 44x44 px y el panel se cierra sin tocar controles del fondo

### Requirement: Chat sigue el último mensaje sin secuestrar la lectura
El hilo SHALL desplazarse al último mensaje cuando el usuario está en el final o suficientemente cerca de él, incluyendo mensajes propios, respuestas del asistente, indicadores de espera y respuestas con productos. Si el usuario ha desplazado manualmente hacia mensajes antiguos, el sistema SHALL preservar su posición hasta que vuelva cerca del final.

#### Scenario: Respuesta normal en una conversación larga
- **WHEN** llega una respuesta después de 10 o más turnos y el lector está cerca del final
- **THEN** el hilo desplaza suavemente el último mensaje hasta una posición visible

#### Scenario: Respuesta con productos
- **WHEN** llega una respuesta con texto largo y varias tarjetas de producto
- **THEN** la respuesta completa y el comienzo de la primera tarjeta quedan visibles sin que el compositor tape la tarjeta

#### Scenario: Lectura manual del historial
- **WHEN** el usuario está leyendo mensajes antiguos y llega una nueva respuesta
- **THEN** la posición del hilo no cambia automáticamente y el usuario puede continuar leyendo

### Requirement: Chat usa modal y foco accesibles
El chatbot abierto SHALL tener semántica de diálogo modal, mantener el foco dentro del panel, devolverlo al launcher al cerrar, cerrar con Escape una sola vez y bloquear el scroll del `body` restaurando su estado anterior al cerrar. La rueda y el touch scroll del hilo SHALL no propagarse al fondo.

#### Scenario: Apertura y cierre por teclado
- **WHEN** el usuario abre el chat, pulsa Tab varias veces y después Escape
- **THEN** el foco entra en el textarea, no abandona el diálogo mientras está abierto y vuelve al launcher al cerrarlo

#### Scenario: Fondo bloqueado
- **WHEN** el chat está abierto sobre la portada, catálogo o presupuesto
- **THEN** el body no se desplaza por el scroll del fondo y recupera su comportamiento original al cerrar

### Requirement: Chat conserva estado y acciones en móvil
El comportamiento de nueva conversación, retry, persistencia por pestaña y bloqueo de envíos duplicados SHALL funcionar igual en móvil y escritorio. Los mensajes persistidos SHALL conservar productos y acciones validadas, y `ChatPanel` SHALL renderizar las acciones `navigate_internal` y `contact_official` mediante una única ruta de renderizado.

#### Scenario: Nueva conversación con petición pendiente
- **WHEN** el usuario pulsa "Nueva conversación" mientras hay una petición pendiente
- **THEN** se limpian mensajes, draft, `conversationId` y error, y cualquier respuesta tardía se descarta

#### Scenario: Acción persistida
- **WHEN** se recarga la misma pestaña con un mensaje que contiene una tarjeta y una acción oficial
- **THEN** la tarjeta y la acción siguen visibles, con sus destinos validados y sin datos técnicos internos

### Requirement: Compositor multilinea tipo mensajería
El campo de mensaje SHALL crecer automáticamente con el texto hasta un máximo razonable de varias líneas, ocultar la scrollbar visual interna y mantener el botón de envío integrado, visible y táctilmente accesible. `Enter` SHALL enviar y `Shift+Enter` SHALL insertar una nueva línea.

#### Scenario: Texto corto y largo
- **WHEN** el usuario escribe una frase corta y luego un mensaje de seis o más líneas
- **THEN** el campo crece hasta su límite sin mostrar una barra antiestética, el botón permanece visible y el panel no desborda

#### Scenario: Nueva línea y envío
- **WHEN** el usuario pulsa `Shift+Enter` y después `Enter`
- **THEN** el primer gesto conserva la nueva línea y el segundo envía el texto sin duplicar la petición
