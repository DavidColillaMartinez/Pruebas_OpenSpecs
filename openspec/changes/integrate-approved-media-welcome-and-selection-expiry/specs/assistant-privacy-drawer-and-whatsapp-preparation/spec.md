## ADDED Requirements

### Requirement: Collapsible privacy notice in the chat panel
El aviso de privacidad del panel del asistente SHALL mantener una información inicial breve con enlace permanente a la política y SHALL ocultar su detalle extenso mediante un control explícito «Ocultar información» / «Información de privacidad», accesible por teclado y reversible dentro de la sesión de interfaz, sin persistencia.

#### Scenario: Expanded by default with permanent link
- **WHEN** se abre el panel del asistente
- **THEN** el texto informativo existente es visible, el enlace a la política de privacidad está disponible con el panel plegado o desplegado, y el control muestra «Ocultar información»

#### Scenario: Collapse and reopen within the session
- **WHEN** el usuario pulsa «Ocultar información» y después vuelve a abrir el panel en la misma sesión
- **THEN** el detalle queda plegado, el espacio pasa al historial, el control muestra «Información de privacidad» y no se escriben cookies ni almacenamiento

#### Scenario: Composer description always resolves
- **WHEN** se plega el detalle
- **THEN** el `aria-describedby` del campo de mensaje apunta a un elemento siempre presente y no deja referencias huérfanas

### Requirement: Optional WhatsApp draft from backend actions
Las respuestas del chat con acciones de contacto oficial MAY incluir `draftText` para `target === 'whatsapp'`; la normalización SHALL conservarlo como texto plano de hasta 1000 caracteres y SHALL descartar un borrador inválido sin perder la acción oficial compatible ni registrar URLs arbitrarias del modelo.

#### Scenario: Draft is kept for whatsapp actions
- **WHEN** una acción incluye un `draftText` valido (cadena no vacía ≤ 1000) con destino whatsapp
- **THEN** la acción normalizada conserva el texto y se usa como punto de partida del mensaje editable

#### Scenario: Invalid draft does not break the action
- **WHEN** `draftText` excede el máximo, es vacío o no es cadena, o el destino no es whatsapp
- **THEN** la acción sigue disponible sin borrador y el resto de la respuesta no cambia

#### Scenario: Legacy responses without draft stay valid
- **WHEN** el backend responde sin `draftText`
- **THEN** las acciones se procesan igual que antes y ninguna URL nueva se acepta como destino

### Requirement: WhatsApp preparation view inside the panel
Las acciones de WhatsApp del chat SHALL abri primera vista de preparación dentro del panel con «Nombre (opcional)» (≤ 80), mensaje editable (≤ 1000 con la presentación incluida), Volver/Cancelar, el aviso de compartir y el botón «Abrir WhatsApp con este mensaje».
#### Scenario: Draft fills the editable message
- **WHEN** la acción incluye `draftText`
- **THEN** el campo de mensaje se rellena con ese texto, editable, sin pegar la transcripción completa

#### Scenario: Legacy action without draft
- **WHEN** la acción no incluye borrador
- **THEN** se ofrece un saludo de consulta general editable y el contacto no se bloquea

#### Scenario: Optional name without duplication
- **WHEN** el usuario escribe un nombre
- **THEN** el mensaje final incorpora una presentación con el nombre, sin duplicar el saludo del borrador, y el nombre no se envía al modelo ni se persiste

#### Scenario: Official encoded destination
- **WHEN** el usuario confirma
- **THEN** se abre `https://wa.me/<número oficial>` con `text` codificado, preservando acentos, `&`, `+` y saltos de línea, y el historial permanece intacto

#### Scenario: Cancel returns to the conversation
- **WHEN** el usuario cancela o pulsa Escape
- **THEN** la vista se cierra sin enviar nada, el historial y su posición de lectura se conservan y el foco regresa al control que abrió la preparación

#### Scenario: Minimal data footprint
- **WHEN** se prepara o abandona el mensaje
- **THEN** nombre y edición viven solo en esa preparación: sin localStorage/sessionStorage, sin logs ni analítica, y se borran al cancelar, finalizar o iniciar Nueva conversación
