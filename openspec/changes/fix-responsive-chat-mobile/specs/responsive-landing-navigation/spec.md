## ADDED Requirements

### Requirement: Portada sin overflow accidental
La portada SHALL mantener su composición actual en 320–912 px, landscape, escritorio y ultra-wide sin que `document.documentElement.scrollWidth` supere el viewport, salvo carruseles internos intencionados. El header fijo, logo, enlace Tienda, botones y secciones SHALL conservar separación legible.

#### Scenario: Portada móvil estrecha
- **WHEN** el usuario visita `/` en 320x568, 360x800, 375x812, 390x844, 414x896 o 430x932
- **THEN** los títulos, botones, logo y header no se cortan, no se solapan y no generan overflow horizontal

#### Scenario: Portada landscape
- **WHEN** el usuario visita `/` en 568x320 o 667x375
- **THEN** el contenido visible y los controles principales caben en la altura disponible sin que un elemento fixed tape acciones

### Requirement: Drawer móvil accesible y aislado
El drawer de navegación SHALL bloquear el scroll del fondo, atrapar el foco, enfocar su cierre al abrir, restaurar el foco al launcher al cerrar y cerrar con Escape. Su scroll interno SHALL funcionar en contenido largo sin crear overflow del documento.

#### Scenario: Abrir y cerrar el drawer
- **WHEN** el usuario abre el menú móvil, navega con teclado y pulsa Escape
- **THEN** el foco se mantiene dentro del drawer y vuelve al botón menú tras el cierre

#### Scenario: Drawer largo
- **WHEN** el contenido del drawer supera la altura del viewport
- **THEN** solo se desplaza el drawer, el body permanece bloqueado y el botón de cierre sigue accesible

### Requirement: Media y controles de la portada son utilizables
Vídeos, comparador, opiniones, contacto y formulario SHALL mantener sus proporciones, controles táctiles y separación en móvil. Los carruseles de opiniones pueden desplazarse horizontalmente dentro de su propio contenedor, pero no SHALL ampliar el ancho del documento.

#### Scenario: Carrusel de opiniones
- **WHEN** el usuario llega a opiniones en móvil
- **THEN** el carrusel indica visualmente que se puede deslizar y el gesto no produce scroll horizontal de toda la página

#### Scenario: Comparador y vídeo
- **WHEN** el usuario utiliza el comparador o los controles de vídeo en una pantalla táctil
- **THEN** los controles tienen tamaño táctil adecuado y no quedan ocultos bajo el chatbot, header o safe area

### Requirement: Metadatos de portada no se degradan
La corrección responsive SHALL mantener los metadatos SEO actuales de `/` y SHALL NOT crear contenido duplicado indexable, JSON-LD duplicado o texto del chatbot fuera de su panel interactivo.

#### Scenario: Revisión de portada
- **WHEN** se inspecciona el HTML y los metadatos de `/` antes y después del cambio
- **THEN** se conserva la información SEO existente y el contenido del chat no se añade como bloque indexable duplicado
