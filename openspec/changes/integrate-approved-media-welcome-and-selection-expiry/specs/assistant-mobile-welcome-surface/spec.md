## ADDED Requirements

### Requirement: Mobile welcome bubble renders as a floating card only
La burbuja SHALL renderizarse como tarjeta flotante, sin superficie ni franja mayores que la propia tarjeta.
La burbuja de bienvenida del asistente en móvil es una tarjeta flotante con su propio fondo; no introduce backdrop, máscara,
reserva opaca, bloqueo de scroll ni una zona rectangular mayor que la tarjeta detrás de ella.

#### Scenario: First entry shows welcome without an opaque strip
- **WHEN** una sesión limpia entra en móvil (ancho <1024) sin bienvenida descartada
- **THEN** tras el retardo de aparición solo son visibles la burbuja y el botón flotante, no existe una franja opaca
  adicional asociada a la burbuja y la web permanece visible y operativa alrededor

#### Scenario: Interactions outside the bubble keep working
- **WHEN** la burbuja está visible y el usuario pulsa o desplaza fuera de ella
- **THEN** los elementos de la web responden con normalidad y no hay un rectángulo que intercepte pulsaciones

#### Scenario: Tool dock unaffected
- **WHEN** la burbuja está visible en catálogo móvil
- **THEN** el dock de herramientas (64px + safe-area) conserva su fondo y sus controles (filtros, cesta, subir) operativos

### Requirement: Welcome lifecycle preserved
El ciclo de la bienvenida SHALL preservarse intacto tras el arreglo.
Se conservan el retardo de aparición, el autodescarte, el cierre manual, abrir el chat desde la burbuja, la preferencia de
bienvenida (sessionStorage), el teclado, `prefers-reduced-motion`, los márgenes seguros y la coordinación con los botones
flotantes existentes, incluida la inhibición desktop cuando queda prohibido mostrar la burbuja.

#### Scenario: Delayed appearance and auto-hide
- **WHEN** la primera entrada ocurre sin interactions
- **THEN** la burbuja aparece pasados ~1,2 s y se descarta sola tras ~8 s, grabando la preferencia

#### Scenario: Dismissal remembered in the session
- **WHEN** la bienvenida se cierra (manual, auto o al abrir el chat)
- **THEN** el resto de la sesión no vuelve a mostrarla y la apertura del chat sigue funcionando desde el botón flotante

#### Scenario: Desktop behaviour unchanged
- **WHEN** se navega en desktop (≥1024) con contexto no foto
- **THEN** la burbuja permanece oculta por coordinación existente, sin depender del mecanismo retirado en móvil
