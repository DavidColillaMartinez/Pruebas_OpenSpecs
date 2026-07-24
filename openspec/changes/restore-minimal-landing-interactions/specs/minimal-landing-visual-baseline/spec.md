## ADDED Requirements

### Requirement: Landing minimalista con fondo blanco
La aplicacion SHALL mostrar la ruta `/` sobre un fondo blanco continuo mientras la landing este montada y SHALL retirar ese ajuste al abandonar la landing para no reemplazar las superficies propias de otras rutas.

#### Scenario: Fondo de los capitulos minimalistas
- **WHEN** el usuario navega por cualquiera de los cinco capitulos de la landing
- **THEN** las zonas transparentes muestran un fondo blanco sin gradientes, rejillas ni decoracion del modo tarjetas

#### Scenario: Salida hacia productos
- **WHEN** el usuario activa `Tienda` y navega a `/productos`
- **THEN** el ajuste de fondo exclusivo de la landing deja de imponerse y la pagina de catalogo conserva su superficie definida

### Requirement: Coleccion usa la composicion minimalista
Coleccion desktop SHALL usar la estructura, contenido, dimensiones y secuencia de la rama `cardless=true` de referencia, sin contenedores de tarjeta, paneles decorativos, sombras de tarjeta ni superficies translucidas descartadas.

#### Scenario: Coleccion al entrar
- **WHEN** el usuario llega al capitulo Coleccion en desktop
- **THEN** ve el titulo y la composicion minimalista centrada con el contenido todavia sujeto a sus umbrales de revelado

#### Scenario: Coleccion completamente revelada
- **WHEN** Coleccion alcanza su ultimo step
- **THEN** vidrio, textura, griferia, accesorios y el texto de criterio aparecen en la composicion lineal minimalista y no dentro de tarjetas

### Requirement: Paridad del resto de la landing
La recuperacion SHALL conservar la estructura, contenido, media, navegacion e interacciones minimalistas correctas de Inicio, Reformas, Vision y Contacto en desktop y de todas las secciones mobile. Cualquier diferencia adicional respecto a la referencia SHALL ser informada antes de ampliar el conjunto de archivos modificados.

#### Scenario: Auditoria desktop
- **WHEN** se comparan los cinco capitulos desktop con la referencia minimalista
- **THEN** solo Coleccion, el fondo blanco y las diferencias adicionales expresamente aprobadas presentan cambios

#### Scenario: Auditoria mobile
- **WHEN** se revisan todas las secciones mobile en un viewport real
- **THEN** no se introducen tarjetas, fondos decorativos, cambios de contenido ni overflow horizontal

### Requirement: Media protegida
La recuperacion SHALL usar los archivos actuales proporcionados por el propietario sin reemplazarlos, recortarlos, re-encodearlos ni modificar su relacion visual mediante cambios no aprobados en los componentes de media.

#### Scenario: Validacion de Vision con media actual
- **WHEN** se prueba el comparador de Vision despues de recuperar el minimalismo
- **THEN** el video y la imagen final conservan los archivos actuales y se alinean dentro del comparador sin alterar los assets
