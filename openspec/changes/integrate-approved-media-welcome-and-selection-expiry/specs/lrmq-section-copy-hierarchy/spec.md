## ADDED Requirements

### Requirement: Services heading replaces redundant label
La tarjeta principal de Servicios SHALL mostrar el título aprobado y SHALL suprimir la etiqueta superior cuando coincida con el título.
La tarjeta principal de Servicios muestra el título aprobado «Reformas integrales» en el dato compartido y, cuando la
etiqueta del bloque coincide con el título, la etiqueta superior se suprime únicamente en ese bloque.

#### Scenario: Featured services card shows the new title once
- **WHEN** se visualiza Servicios en desktop o móvil
- **THEN** el bloque principal muestra «Reformas integrales» como título y la etiqueta «Reformas integrales» no se renderiza
  encima del título

#### Scenario: Other categories remain unchanged
- **WHEN** se visualizan las dos categorías restantes de Servicios
- **THEN** sus textos, etiquetas e imágenes no cambian y no se crean tarjetas nuevas con fotos

### Requirement: Quiénes somos heading hierarchy SHALL match the approved text
El capítulo SHALL mostrar como h2 el texto aprobado y SHALL no duplicarlo como párrafo.
El capítulo Quiénes somos elimina el h2 «Experiencia y oficio en cada reforma.» y convierte en h2 el texto exacto:

«Un equipo de profesionales con más de 20 años de experiencia en el sector de las reformas.»

El texto no debe repetirse como párrafo; los tres bloques mantienen sus textos; los identificadores usados por
`aria-labelledby` se conservan.

#### Scenario: New heading without duplication
- **WHEN** se inspecciona la sección Quiénes somos en desktop y móvil
- **THEN** existe un único h2 con el texto aprobado, no existe «Experiencia y oficio en cada reforma.» y el texto no
  aparece duplicado como párrafo

#### Scenario: Long heading fits on laptops
- **WHEN** se visualiza el capítulo en 1366×768 y en una altura corta
- **THEN** el título completo cabe en la ventana sin que las tres filas de bloques salgan de la pantalla, con ajustes de
  anchura/tamaño/interlineado locales y sin cambiar la escala global
