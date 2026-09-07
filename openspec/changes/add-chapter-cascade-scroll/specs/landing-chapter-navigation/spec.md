## ADDED Requirements

### Requirement: Siete capítulos con orden canónico
La landing SHALL declarar en `src/data/copy.js` los 7 capítulos en el orden: Inicio, Quiénes somos, Colección, Reformas, Visión, Opiniones, Contacto, con sus `sectionIds`, `chapterLabels`, `chapterSteps` y `chapterType` consistentes por índice.

#### Scenario: Orden en todas las superficies
- **WHEN** se inspecciona cualquier superficie de la landing (stack escritorio, puntos laterales, navegación superior, drawer móvil y secciones móviles)
- **THEN** los 7 capítulos aparecen en el mismo orden canónico con `sectionId` único por capítulo

### Requirement: Navegación superior con dos nuevas entradas
`navItems` SHALL incluir "Quiénes somos" antes de "Colección" y "Opiniones" antes de "Contacto", conservando estilos, `Tienda -> /productos` y comportamiento de anclas existentes; en escritorio cada enlace SHALL navegar programáticamente al índice correspondiente (no solo hash).

#### Scenario: Clic en Quiénes somos
- **WHEN** el usuario pulsa "Quiénes somos" en el header escritorio
- **THEN** la landing navega a ese capítulo independientemente del estado de cascada del capítulo actual

### Requirement: Puntos laterales reflejan los 7 capítulos
`ChapterDots` SHALL renderizar un punto por `sectionId`, con etiqueta preview en hover/focus, `aria-label` "Ir a <capítulo>" y `aria-current="step"` en el activo, manteniendo su diseño actual.

#### Scenario: Navegación durante cascada
- **WHEN** el usuario pulsa un punto mientras el capítulo actual está en cascada
- **THEN** la navegación se ejecuta al instante y el temporizador del capítulo origen se cancela

### Requirement: Drawer móvil con entradas completas
El `MobileDrawer` SHALL listar los 7 capítulos con su sección asociada; cerrar el drawer tras seleccionar; y el resaltado de sección activa SHALL seguir funcionando mediante `sectionIds` en el observer existente.

#### Scenario: Selección desde drawer
- **WHEN** el usuario abre el drawer móvil y elige "Opiniones"
- **THEN** el viewport navega a esa sección, el drawer se cierra y el punto/enlace correspondiente queda marcado como activo

### Requirement: No regresión de navegación previa
La navegación a `/productos` (Tienda), los anclas internas existentes para usuarios antiguos (`#coleccion`, `#vision`, etc.) y los enlaces del header SHALL seguir funcionando tras reordenar los capítulos.

#### Scenario: Ancla profunda
- **WHEN** un visitante llega con `/#contacto`
- **THEN** la landing resuelve el capítulo Contacto correctamente con el nuevo orden de 7 capítulos
