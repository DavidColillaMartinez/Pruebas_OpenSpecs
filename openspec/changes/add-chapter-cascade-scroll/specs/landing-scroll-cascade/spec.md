## ADDED Requirements

### Requirement: El scroll navega exclusivamente entre capítulos
En escritorio, los gestos de rueda y las flechas/teclas de página SHALL cambiar de capítulo cuando el capítulo activo esté completamente revelado, y NO SHALL avanzar pasos internos de contenido mediante scroll en ningún capítulo de tipo `step`.

#### Scenario: Capítulo completo, scroll cambia de capítulo
- **WHEN** el usuario gira la rueda hacia abajo con el capítulo activo totalmente revelado
- **THEN** la landing transiciona al capítulo siguiente sin alterar el contenido ya visible del capítulo actual

#### Scenario: Volver a un capítulo ya revelado
- **WHEN** el usuario regresa a un capítulo que ya completó su cascada en la sesión (salvo las excepciones de revelado repetido definidas para Visión)
- **THEN** el capítulo se muestra en su estado completo, sin re-cascada ni parpadeos, y el scroll puede volver a navegar

### Requirement: El contenido de cada capítulo se revela en cascada automática
Al entrar en un capítulo de tipo `step`, su contenido SHALL revelarse progresivamente por temporización, con el mismo aspecto, animaciones y orden que los estados de `step` actuales, comenzando tras una pausa breve (~1 segundo) tras la transición de entrada.

#### Scenario: Entrada a Colección dispara la cascada
- **WHEN** el usuario entra en el capítulo Colección
- **THEN** tras aproximadamente un segundo de pausa, los bloques de contenido aparecen sucesivamente en cascada sin intervención del usuario, empleando las mismas transiciones CSS preexistentes

#### Scenario: Cada paso respeta el orden actual
- **WHEN** avanza la cascada dentro de un capítulo
- **THEN** los bloques se revelan en el mismo orden de pasos que tenía el capítulo bajo control de scroll anterior

### Requirement: No se puede abandonar un capítulo sin terminar de revelarse
Mientras el capítulo activo `step` no haya completado su cascada (último paso revelado y su transición terminada), los gestos de rueda y las teclas de navegación SHALL ignorarse para el cambio de capítulo, con `preventDefault` aplicado.

#### Scenario: Scroll bloqueado durante la cascada
- **WHEN** el usuario gira la rueda mientras un capítulo está en cascada o en sus pausas
- **THEN** la landing permanece en el capítulo y el contenido continúa revelándose según su temporización

#### Scenario: Escape por navegación programática
- **WHEN** el usuario pulsa un punto lateral o un enlace de la navegación superior durante una cascada
- **THEN** la navegación se ejecuta inmediatamente, cancelando los temporizadores del capítulo origen

### Requirement: Reformas conserva su scroll continuo sin cambios
El capítulo Reformas SHALL mantener exactamente el comportamiento actual: el scroll controla la progresión del vídeo (`continuous`) y su acumulación permite entrar y salir del capítulo; la máquina de cascada no se aplica a él.

#### Scenario: Scrub de vídeo intacto
- **WHEN** el usuario gira la rueda dentro de Reformas
- **THEN** `smoothProgress` sigue acumulándose y el vídeo progresa como hoy, sin bloqueos ni revelado escalonado de contenido

### Requirement: Visión reproduce el boceto antes de su cascada
La primera visita al capítulo Visión SHALL reproducir el vídeo del boceto bloqueando la navegación (comportamiento actual) y, al terminar, encadenar automáticamente el revelado del titular y el texto sin esperar más scroll.

#### Scenario: Primera entrada a Visión
- **WHEN** el usuario entra en Visión por primera vez en la sesión
- **THEN** el vídeo se reproduce completo, la rueda está bloqueada durante la reproducción, y al finalizar comienza la cascada del titular y el párrafo

#### Scenario: Regreso a Visión con boceto ya visto
- **WHEN** el usuario vuelve a Visión después de haber reproducido el boceto
- **THEN** el vídeo NO se repite, el titular queda visible un segundo, y tras ese segundo la cascada del contenido se ejecuta automáticamente

### Requirement: Los pasos de Inicio esperan el fin de la animación del logo
El bloque de tres pasos de Inicio SHALL revelarse solo después de que termine la animación del logo SVG, con retardos escalonados entre pasos algo más rápidos que los actuales, y SHALL desplazarse ligeramente hacia arriba respecto a su posición actual sin cambiar su tipografía ni estilos.

#### Scenario: Texto gated por el logo
- **WHEN** el usuario entra en Inicio y la animación del logo aún no ha terminado
- **THEN** los tres pasos permanecen ocultos, y al completarse la animación aparecen escalonados con retardos reducidos (aproximadamente 0/320/640 ms en lugar de 0/800/1600 ms)

#### Scenario: Posición del bloque de pasos
- **WHEN** los pasos de Inicio se revelan
- **THEN** el bloque queda más cerca del H1 que antes (aproximadamente 48 px más arriba) sin modificar demás elementos del capítulo

### Requirement: Motion reducido y pantallas no desktop
Con `prefers-reduced-motion` activado o en móvil, el sistema SHALL omitir cascadas por temporización y bloqueos: los capítulos aparecen completos al entrar y el scroll móvil mantiene el flujo natural apilado actual.

#### Scenario: Reduced motion
- **WHEN** un usuario con motion reducido navega por capítulos
- **THEN** el contenido aparece completo sin revelado escalonado y ninguna rueda queda bloqueada por cascadas
