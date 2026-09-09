## ADDED Requirements

### Requirement: Ficha de producto responsive
Las fichas `/productos/:slug` SHALL mantener galería, lightbox, título, metadata, facts, variantes, opciones Duplach y acciones utilizables entre 320 px y 1024 px, landscape y desktop, sin que títulos, opciones o botones salgan horizontalmente.

#### Scenario: Ficha móvil con título largo
- **WHEN** el usuario abre una ficha con título largo en 320–390 px
- **THEN** el título se envuelve, no invade la galería y los botones conservan separación y tamaño táctil

#### Scenario: Selector de opciones
- **WHEN** el usuario abre variantes u opciones Duplach en móvil
- **THEN** las opciones se envuelven o desplazan dentro de su propio contenedor y ninguna queda fuera del viewport

### Requirement: Galería y lightbox preservan interacción
La galería, flechas, lightbox e imágenes de producto SHALL conservar sus proporciones, alt, foco visible, cierre por Escape y controles táctiles; ningún overlay fixed SHALL ocultar el contenido principal o el botón de acción.

#### Scenario: Galería móvil
- **WHEN** el usuario cambia de imagen y abre el lightbox desde un móvil
- **THEN** la imagen mantiene su proporción, las flechas son utilizables y el cierre devuelve el foco al control que abrió el lightbox

### Requirement: Presupuesto responsive
`/presupuesto` SHALL mantener selección, cantidades, eliminación, estados vacíos, formulario, errores, retry y envío de presupuesto en móvil, tablet y desktop, sin que un resumen sticky tape el botón principal.

#### Scenario: Presupuesto sin selecciones
- **WHEN** el usuario abre `/presupuesto` sin productos seleccionados en 320–430 px
- **THEN** el estado vacío y su navegación se leen completos y no hay controles fuera del viewport

#### Scenario: Presupuesto con varias líneas
- **WHEN** el usuario gestiona varias líneas, cantidades y notas en móvil
- **THEN** cada control tiene separación y foco visible, el resumen no cubre el formulario y el envío conserva su comportamiento actual

### Requirement: Flujo de presupuesto no cambia de contrato
Los ajustes responsive SHALL NOT modificar payloads, validaciones, precios, proveedores, endpoints ni comportamiento de envío del sistema de presupuestos.

#### Scenario: Envío de presupuesto
- **WHEN** el usuario completa y envía un presupuesto de prueba
- **THEN** se utiliza el mismo cliente, validación y respuesta que antes de la corrección responsive
