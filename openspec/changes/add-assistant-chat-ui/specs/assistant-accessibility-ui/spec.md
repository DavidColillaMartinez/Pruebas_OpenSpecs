## ADDED Requirements

### Requirement: Gestión de foco del panel
El panel abierto SHALL ser accesible por teclado: el foco pasa al campo de mensaje al abrir, se recorre entre los controles interactivos, el foco queda contenido dentro del panel mientras está abierto y Escape lo cierra devolviendo el foco al lanzador.

#### Scenario: Escape cierra y devuelve el foco
- **WHEN** el usuario pulsa Escape con el panel abierto
- **THEN** el panel se cierra y el foco queda en el lanzador

#### Scenario: Foco atrapado dentro del panel
- **WHEN** el usuario navega con Tab dentro del panel abierto
- **THEN** el ciclo de foco no sale del panel hasta que se cierra

### Requirement: Anuncio accesible de mensajes
Los mensajes nuevos del asistente SHALL announcearse mediante una región `aria-live` subtree o `polite` sobre el último mensaje (sin releer todo el historial completo en cada llegada).

#### Scenario: Llegada de respuesta
- **WHEN** llega una respuesta del asistente
- **THEN** el lector de pantalla announcea el último mensaje sin re-annunciar el historial previo

### Requirement: Scroll propio del panel
El área de mensajes del panel SHALL tener su propio scroll interno y SHALL NOT activar el scroll narrativo de la portada ni el desplazamiento exterior de la página al hacer roasted sobre él.

#### Scenario: Scroll dentro del panel en la portada
- **WHEN** el usuario hace wheel o gesto de scroll sobre el panel en `/` con el scroll narrativo activo
- **THEN** solo se desplaza el contenido del panel y la portada no cambia de chapter (sin interferencia con `useNarrativeScroll`)

### Requirement: Comportamiento en móvil
En móvil SHALL verse y funcionar correctamente con teclado virtual abierto: el panel ajusta su altura (`dvh`/`visualViewport`-safe), el lanzador no tapa controles importantes y el foco en el campo de texto deja visible la zona de escritura.

#### Scenario: Teclado virtual abierto
- **WHEN** el usuario enfoca el campo de texto en móvil
- **THEN** la vista se reajusta mostrando el campo y el último mensaje visible sin fondaner tapados

### Requirement: Respetar la armonía visual existente
El lanzador y el panel SHALL reutilizar los tokens/estilos del design system vigente de la web (porcelain/ink/clay, tipografías display/body y radii existentes) y SHALL NOT alterar la disposición visual de portada, catálogo o fichas.

#### Scenario: Coherencia visual
- **WHEN** el chat está presente en cualquier ruta
- **THEN** portada, catálogo y fichas mantienen sus estilos vigentes; el chat parece parte del mismo sistema de componentes (Button, Hero, colores de marca) y no un elemento ajeno
