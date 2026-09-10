## ADDED Requirements

### Requirement: Pill de navegación contextual en la landing
En la sección Inicio la pill de navegación SHALL ser transparente (sin fondo, sin sombra) conservando un borde hairline claro; en las secciones sin fotografía SHALL conservar el fondo aprobado actual en claro y el dark-glass en oscuro.

#### Scenario: Inicio delante de la foto
- **WHEN** el usuario está en Inicio, en claro u oscuro
- **THEN** la pill no muestra fondo ni sombra y solo un borde fino claro

#### Scenario: Sección sin foto
- **WHEN** el usuario navega a otra sección de la landing
- **THEN** la pill conserva el fondo actual (clara en claro, dark-glass en oscuro) sin regresiones
