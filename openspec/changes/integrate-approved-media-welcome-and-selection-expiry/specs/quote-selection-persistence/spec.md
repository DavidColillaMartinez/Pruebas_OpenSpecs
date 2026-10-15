## ADDED Requirements

### Requirement: Selection SHALL persist with a 7-day inactivity window by default
La selección SHALL guardarse con vencimiento de 7 días sin cambios reales; las visitas y las escrituras sin efecto SHALL no renovar el plazo.
La selección local se guarda con vencimiento de 7 días sin cambios reales («Recordar» desactivado). Sólo una operación que
altere la selección (añadir, eliminar, cambiar cantidad) renueva el plazo; leer, visitar, recargar, re-renderizar o abrir la
cesta no lo hace. Una operación sin cambio real (p. ej. guardar la misma cantidad) tampoco lo renueva.

#### Scenario: Modified selection renews the window
- **WHEN** cambia la selección (añadir/eliminar/cantidad distinta)
- **THEN** `updatedAt` se actualiza y el vencimiento vuelve a 7 días desde ese instante

#### Scenario: Visit does not renew
- **WHEN** el usuario recarga o vuelve a abrir la web sin cambiar la selección
- **THEN** la fecha guardada no cambia y el vencimiento original se mantiene

#### Scenario: No-op write does not renew
- **WHEN** se guarda una cantidad equivalente a la ya existente
- **THEN** el registro no cambia su vencimiento

### Requirement: An explicit remember option SHALL keep the selection without automatic expiry
La casilla compartida SHALL desmarcarse por defecto y SHALL conservar la selección sin caducidad al activarse.
Existe una casilla compartida entre la cesta y la página de presupuesto, desmarcada por defecto, con el texto exacto
«Recordar mi selección en este dispositivo hasta que la borre». Al activarla la selección no caduca automáticamente; al
desactivarla vuelven a contar siete días desde ese momento.

#### Scenario: Remember keeps selection indefinitely
- **WHEN** el usuario marca la casilla
- **THEN** el registro pierde el vencimiento automático y la selección persiste hasta que la borre

#### Scenario: Unchecking restores the 7-day window
- **WHEN** el usuario desmarca la casilla
- **THEN** el vencimiento vuelve a 7 días desde ese momento

#### Scenario: Both surfaces share state
- **WHEN** se cambia la casilla en la cesta y se visita /presupuesto
- **THEN** el estado del modo es único y no aparecen casillas contradictorias

### Requirement: Expired selections SHALL be discarded before display
Una selección vencida SHALL descartarse antes de mostrarse y su registro SHALL eliminarse.
Al montar el proveedor y al recuperar foco/visibilidad se comprueba el vencimiento; una selección vencida se descarta antes
de mostrarse y su registro se elimina.

#### Scenario: Expired on load
- **WHEN** el registro guardado tiene vencimiento anterior al instante actual
- **THEN** la selección queda vacía, la clave se elimina y el modo vuelve al predeterminado

#### Scenario: Long-open tab re-checks
- **WHEN** la pestaña recupera foco/visibilidad tras mucho tiempo con una selección ya vencida en memoria
- **THEN** se descarta el estado vencido sin esperar a recargar

### Requirement: Cross-tab sync SHALL use native storage events without resurrections
La sincronización SHALL usar el evento nativo `storage` y SHALL no renovar el TTL ni resucitar selecciones vaciadas o vencidas.
La sincronización entre pestañas usa el evento nativo `storage`, sin dependencias nuevas: aplica los cambios ajenos sin
renovar el TTL y una pestaña antigua no restaura una selección vaciada o caducada por otra.

#### Scenario: Another tab clears the basket
- **WHEN** una pestaña vacía la selección y la otra recibe el evento o recupera foco
- **THEN** la pestaña antigua sincroniza el estado vacío, no restaura su copia previa y no escribe metadatos nuevos

### Requirement: Clearing and send flows SHALL remove only what they should
Vaciar selección SHALL eliminar productos y metadatos; el envío SHALL retirar únicamente las líneas confirmadas.
«Vaciar selección» elimina productos y metadatos (toda la clave). El envío exitoso retira únicamente las líneas
confirmadas; un envío fallido conserva líneas y metadatos. Si no queda ninguna línea, la clave se elimina y vuelve el modo
predeterminado.

#### Scenario: Clear empties products and metadata
- **WHEN** el usuario pulsa Vaciar
- **THEN** desaparecen líneas, fechas y preferencia del almacenamiento

#### Scenario: Successful send removes only sent lines
- **WHEN** un envío se confirma con validez completa
- **THEN** sólo las líneas enviadas se retiran; otras añadidas durante el envío permanecen y sus metadatos no se renuevan
  por la retirada

#### Scenario: Failed send keeps everything
- **WHEN** el envío falla o la confirmación es inválida
- **THEN** las líneas y el vencimiento se conservan intactos

### Requirement: Migration from version 2 SHALL happen once
La migración SHALL ocurrir una única vez, sin reiniciarse en cada visita.
Un registro v2 sin opción explícita migra una sola vez al modo predeterminado con siete días desde la migración; no se
reinicia en cada visita, no se reinterpretan valores truthy como «Recordar» y los registros corruptos ya vencidos no se
resucitan.

#### Scenario: One-time migration sets the window
- **WHEN** se lee un registro v2 válido sin metadatos
- **THEN** se escribe v3 con `remember=false` y 7 días desde la migración, y en visitas posteriores la fecha no cambia

#### Scenario: Corrupt or expired legacy data is not revived
- **WHEN** el registro v2 es corrupto o sus líneas son inválidas
- **THEN** se descarta, la clave se limpia y no se rehidratan datos vencidos

### Requirement: Notes SHALL stay excluded and storage failures SHALL stay contained
Las notas libres SHALL seguir excluidas de la persistencia y los fallos de localStorage SHALL no romper la selección en memoria.
Las notas libres y datos personales siguen excluidos de la persistencia; claves históricas se limpian; fallos de
localStorage no rompen la selección en memoria.

#### Scenario: Notes never persisted
- **WHEN** se persiste cualquier línea con notas
- **THEN** las notas no aparecen en el registro guardado

#### Scenario: Storage unavailable keeps memory
- **WHEN** localStorage lanza al leer o escribir
- **THEN** la selección en memoria sigue operativa y la app no se rompe
