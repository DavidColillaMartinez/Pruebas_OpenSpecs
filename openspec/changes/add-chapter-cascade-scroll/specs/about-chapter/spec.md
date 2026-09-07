## ADDED Requirements

### Requirement: Capítulo "Quiénes somos" con tres pares texto/imagen
La landing SHALL incluir un capítulo "Quiénes somos" situado inmediatamente antes de "Colección", compuesto por un titular y tres bloques, cada uno con un texto y una imagen, con layout alterno: (1) texto a la izquierda e imagen a la derecha con centrado vertical, (2) texto a la derecha e imagen a la izquierda, (3) texto a la izquierda e imagen a la derecha.

#### Scenario: Estructura del capítulo en escritorio
- **WHEN** el usuario llega al capítulo Quiénes somos
- **THEN** se muestran el titular y tres bloques texto+imagen en el orden de alternancia descrito, reutilizando tipografías y componentes existentes de la landing

#### Scenario: Imágenes proporcionadas por el repo
- **WHEN** se renderizan las imágenes del capítulo
- **THEN** cada imagen proviene de assets ya existentes en el repo o de los que aporte el propietario, sin recortar, re-codificar ni reinterpretar assets de usuario

### Requirement: El capítulo Quiénes somos se revela en cascada
El capítulo SHALL integrarse en la narrativa de capítulos de escritorio (`sectionId: quienes-somos`) y sus tres bloques de contenido SHALL aparecer sucesivamente mediante la cascada automática definida en `landing-scroll-cascade`, sin control por scroll interno.

#### Scenario: Cascada de los tres bloques
- **WHEN** el usuario entra en Quiénes somos
- **THEN** tras la pausa inicial, los tres pares texto/imagen se revelan uno a uno y el capítulo queda navegable al terminar

#### Scenario: Sin scroll interno
- **WHEN** el usuario gira la rueda durante la cascada de Quiénes somos
- **THEN** el capítulo no avanza ni retrocede hasta completar el revelado

### Requirement: Quiénes somos en móvil como sección apilada
En móvil SHALL existir la sección "Quiénes somos" apilada tras Inicio con el mismo contenido y la alternancia adaptada a una columna (texto sobre imagen o según shell móvil existente), sin comportamiento de cascada.

#### Scenario: Flujo móvil
- **WHEN** un usuario móvil baja por la landing
- **THEN** la sección aparece entre Inicio y Colección con su contenido completo visible en scroll natural

### Requirement: Contenido textual aportado por el propietario
Los tres textos del capítulo y sus imágenes provendrán de ficheros de datos (`src/data/aboutContent.js`) con contenido aprobado por el propietario; el sistema NO SHALL inventar afirmaciones sobre la empresa.

#### Scenario: Datos centralizados
- **WHEN** el propietario actualice un texto o imagen del capítulo
- **THEN** el cambio se limita al fichero de datos sin tocar los componentes
