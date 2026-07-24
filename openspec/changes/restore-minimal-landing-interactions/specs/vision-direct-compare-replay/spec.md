## ADDED Requirements

### Requirement: Reproduccion automatica unica en desktop
Vision desktop SHALL reproducir automaticamente el video del boceto solo durante la primera entrada de la sesion de pagina. Despues de haberse visto o intentado esa reproduccion, las entradas posteriores SHALL mostrar directamente el comparador.

#### Scenario: Primera entrada en Vision
- **WHEN** el usuario entra por primera vez en Vision durante la sesion
- **THEN** el video comienza automaticamente, el avance narrativo queda bloqueado durante la reproduccion y no se muestra el comparador hasta finalizar o fallar

#### Scenario: Regreso a Vision
- **WHEN** el usuario abandona Vision y vuelve despues de la primera reproduccion
- **THEN** el video no comienza automaticamente y el comparador drag esta disponible de inmediato

### Requirement: Transicion directa a comparador
Al terminar o fallar el video, Vision SHALL activar directamente el comparador y MUST NOT mostrar un boton ni overlay Revelar.

#### Scenario: Video finalizado
- **WHEN** el video emite `ended`
- **THEN** se libera el bloqueo narrativo y aparecen la imagen final, el divisor y el control drag

#### Scenario: Autoplay fallido
- **WHEN** el navegador rechaza la reproduccion automatica
- **THEN** se libera el bloqueo y se ofrece directamente el comparador en un estado utilizable

### Requirement: Replay permanente y explicito
El boton SVG de replay SHALL permanecer visible en su posicion inferior derecha durante video y comparador. Al activarlo SHALL reiniciar el video desde cero y, al finalizar, SHALL volver directamente al comparador.

#### Scenario: Replay desde comparador
- **WHEN** el usuario activa `Reproducir video de nuevo`
- **THEN** el comparador deja paso al video desde `currentTime = 0` sin reactivar ningun boton Revelar

#### Scenario: Fin del replay
- **WHEN** una reproduccion iniciada por replay termina
- **THEN** Vision vuelve al comparador y el boton replay sigue disponible

#### Scenario: Salida durante replay
- **WHEN** el usuario abandona Vision durante una repeticion
- **THEN** el video se pausa, el bloqueo se libera y la siguiente entrada muestra el comparador

### Requirement: Flujo mobile directo y bajo demanda
Vision mobile SHALL conservar la primera reproduccion bajo demanda, SHALL pasar directamente a compare cuando termine y SHALL mostrar un control replay permanente sin estado Revelar.

#### Scenario: Primera reproduccion mobile
- **WHEN** el usuario activa la reproduccion del boceto en mobile y el video termina
- **THEN** el comparador se activa inmediatamente sin solicitar una segunda accion Revelar

#### Scenario: Replay mobile
- **WHEN** el usuario activa replay desde el comparador mobile
- **THEN** el video se reproduce desde cero y vuelve al comparador al terminar

### Requirement: Comparador accesible y media intacta
El cambio SHALL preservar operacion por teclado, puntero y touch del comparador, SHALL mantener un nombre accesible para replay y MUST NOT modificar, recortar ni re-encodear los archivos de media.

#### Scenario: Comparacion por teclado
- **WHEN** el comparador esta activo y recibe ArrowLeft o ArrowRight
- **THEN** el valor del slider cambia dentro del rango 0 a 100 y sus atributos ARIA se actualizan

#### Scenario: Media proporcionada por el usuario
- **WHEN** se renderizan video e imagen final durante compare
- **THEN** se usan las rutas y archivos actuales sin alteraciones de assets

### Requirement: Vision no deja scrolls ciegos
La navegacion narrativa de Vision SHALL asignar cada paso a un cambio visible o al avance del siguiente capitulo, y MUST NOT consumir un gesto de rueda que no produzca animacion, estado nuevo ni navegacion.

#### Scenario: Comparador ya estabilizado
- **WHEN** el comparador esta activo, el texto lateral ya esta asentado y el usuario hace scroll hacia abajo
- **THEN** la navegacion avanza directamente a Contacto sin consumir un step vacio

#### Scenario: Regreso hacia Vision
- **WHEN** el usuario vuelve desde Contacto con scroll hacia arriba
- **THEN** Vision entra en un estado visible y no requiere un gesto adicional sin efecto para continuar
