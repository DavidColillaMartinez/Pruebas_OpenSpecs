## Purpose

Garantizar lectura completa y navegación accesible de la landing aprobada al variar anchura, altura y tema, preservando sus medios y experiencia narrativa donde cabe.

## ADDED Requirements

### Requirement: Inicio reserva espacio para identidad y acciones
La landing SHALL presentar logo animado, Tienda, AREA LRMQ, DESIGN S.L. y las tres tarjetas sin solapes no intencionales ni pérdida de contenido, manteniendo animación, entrada de tarjetas y enlace Tienda a `/productos`.

#### Scenario: Composición inicial y final
- **WHEN** se abre Inicio en la matriz local en claro u oscuro y se completa su animación
- **THEN** cada bloque dispone de espacio propio y las acciones son visibles y alcanzables, incluidos los estados iniciales de la secuencia

### Requirement: Continuidad del contenido y del modo narrativo
La landing SHALL permitir leer y alcanzar todo el contenido de sus siete secciones por anchura y altura útiles, mantener narrativa donde cabe y ofrecer scroll accesible donde no cabe, sin ocultar contenido, escalado global ni scroll interceptado. El cambio de modo SHALL conservar la sección actual y evitar pantallas vacías.

#### Scenario: Ventana de poca altura y cambio de umbral
- **WHEN** la ventana cambia entre 1024×719 y 1024×720, o atraviesa cualquier umbral efectivo en ambos sentidos
- **THEN** la sección actual continúa disponible y se alcanzan el último texto, tarjeta y acción, sin interferencia de navegación global sobre scroll necesario

#### Scenario: Interacciones y medios preservados
- **WHEN** se recorren Quiénes somos, Servicios, Reformas, Visión, Opiniones y Contacto antes/después de sus animaciones
- **THEN** sus textos y medios permanecen completos, la comparación y replay de Visión funcionan, el video conserva relación de aspecto y las reseñas largas y controles del carrusel son accesibles

### Requirement: Cabecera y menú conservan todos los accesos
La cabecera SHALL mantener su transición de marca oculta en Inicio y adaptar marca completa, navegación, tema y CTA fuera de Inicio sin cruces o recortes. El menú SHALL ofrecer los siete destinos y los dos CTA con acceso equivalente, scroll propio cuando sea necesario, cierre, Escape, orden de foco y restauración de foco/body scroll.

#### Scenario: Menú en landscape bajo
- **WHEN** se abre el menú en una ventana horizontal de poca altura
- **THEN** todos los destinos y CTA pueden alcanzarse sin interferencia de elementos flotantes, y cerrar restaura foco y scroll

#### Scenario: Cabecera con anchura insuficiente
- **WHEN** marca, navegación y acciones no caben en la distribución amplia
- **THEN** una adaptación o menú equivalente conserva todos los accesos y sus puntos de interacción

### Requirement: Marca de Contacto visible en oscuro
Contacto SHALL mantener visible su marca gráfica en oscuro usando recursos existentes o un soporte apropiado, sin modificar archivos del logo ni cambiar innecesariamente su presentación clara.

#### Scenario: Cambio de tema en Contacto
- **WHEN** se alternan claro y oscuro en Contacto
- **THEN** la marca sigue identificable en ambos fondos y el contenido y formulario permanecen íntegros
