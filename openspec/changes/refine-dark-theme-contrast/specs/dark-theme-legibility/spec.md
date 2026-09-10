## ADDED Requirements

### Requirement: Paleta oscura suave y legible
El modo oscuro SHALL usar superficies de fondo y elevación menos negras y textos menos blancos, manteniendo contraste AA (≥4.5:1) en texto principal y jerarquía legible en secundario.

#### Scenario: Texto principal sobre superficie elevada
- **WHEN** se muestra texto significativo en oscuro sobre card o formulario
- **THEN** el contraste calculado no baja de 4.5:1 en el cuerpo y queda jerarquía clara con el secundario

### Requirement: Landing navegable en oscuro
La navegación superior, la navegación lateral y las secciones sin fotografía de la landing SHALL ser legibles en modo oscuro. SHALL NOT invertirse Vision ni CompareSlider.

#### Scenario: Sección Reformas en oscuro
- **WHEN** el tema es oscuro y el usuario navega a Reformas o Contacto en la landing
- **THEN** textos, botones e indicadores contratan adecuadamente con el fondo oscuro

### Requirement: Imágenes suavizadas en oscuro
Las imágenes de catálogo, ficha y masthead SHALL recibir un suavizado (brillo/saturación) aplicado solo en oscuro mediante CSS, sin modificar los archivos de media.

#### Scenario: Foto de producto en oscuro
- **WHEN** el tema es oscuro y se muestra una imagen de producto
- **THEN** su brillo percibido se reduce respecto al claro sin recortar ni recodificar el archivo

### Requirement: Controles y estados legibles en oscuro
Inputs, selects, chips, placeholders y estados de error SHALL usar superficies/bordes suaves en oscuro con contraste suficiente y estados de error dark-aware.

#### Scenario: Select en ficha de producto
- **WHEN** el usuario abre un select de variante en oscuro
- **THEN** el control se distingue del fondo sin parecer un bloque blanco y mantiene foco visible

### Requirement: Toggle de tema pulido y contextual
El control de tema SHALL presentarse como pill accesible (44×44) con iconos SVG, variante contextual (transparente con desenfoque sobre fotografía en Inicio; sólida en el resto) y SHALL compartir fila con el enlace “Volver a AREA LRMQ” en catálogo, mandando la posición el enlace.

#### Scenario: Toggle sobre foto de inicio
- **WHEN** el tema es oscuro o claro y la sección visible es Inicio
- **THEN** el toggle es transparente con blur, sin fondo sólido que rompa la foto, y mantiene contraste de icono

#### Scenario: Toggle en catálogo
- **WHEN** el usuario accede a /productos
- **THEN** el toggle ocupa la misma fila que el enlace de retorno sin desplazar ni desalinear el enlace

### Requirement: Burbuja de bienvenida contextual con disparador auditado
La burbuja de bienvenida SHALL usar el mismo patrón contextual que el toggle y su aparición SHALL estar cubierta por tests que documenten cuándo debe y no debe activarse.

#### Scenario: Burbuja en inicio
- **WHEN** la burbuja se muestra en la sección Inicio
- **THEN** su fondo es transparente con desenfoque; en otras rutas es sólida
