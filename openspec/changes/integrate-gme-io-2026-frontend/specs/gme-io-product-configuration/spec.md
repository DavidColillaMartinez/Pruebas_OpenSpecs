## Purpose

Permitir configurar variantes comerciales reales de GME IO 2026 y explorar sus fotografías completas sin confundir muestras, acabados ni selección para presupuesto.

## ADDED Requirements

### Requirement: Galería completa independiente de variante
Para productos dentro del alcance IO, el sistema SHALL construir una galería navegable deduplicada por URL con portada primero, después imágenes de producto y después fotos grandes de todas las variantes, conservando el orden API dentro de cada grupo. SHALL excluir imágenes de selector y usar únicamente URLs API; SHALL conservar toda la galería al seleccionar variantes.

#### Scenario: Fiore con imágenes compartidas
- **WHEN** la ficha incluye portada, seis fotos grandes por acabado y dieciocho variantes con fotos repetidas
- **THEN** la galería contiene portada y cada foto grande una sola vez, accesibles mediante flechas y miniaturas.

#### Scenario: Muestras y fotos separadas
- **WHEN** Round/Orion bidé empotrable o Sirio 1 función ofrecen muestras pequeñas y portada de modelo
- **THEN** solo portada y fotos grandes API entran en la galería; ninguna muestra se amplía como fotografía de producto.

### Requirement: Imagen activa y selección comercial separadas
El sistema SHALL abrir la ficha mostrando portada, aunque seleccione inicialmente una variante. Navegar imágenes SHALL conservar variante, tipo, acabado y presupuesto. Un cambio manual de acabado SHALL activar su foto grande si existe, buscando fotos de variante inequívocas o el respaldo `specs.finish_image_urls` por nombre; sin foto SHALL conservar la imagen activa. Cambiar tipo bajo/alto/bidé SHALL conservar la foto. SHALL evitar reinicios de galería por renders ajenos a navegación o cambio explícito de acabado.

#### Scenario: Selección inicial automática
- **WHEN** se abre Fiore y se selecciona automáticamente una variante
- **THEN** la portada sigue activa hasta una navegación manual o cambio manual de acabado con foto.

#### Scenario: Navegar otro acabado sin comprarlo
- **WHEN** el usuario navega hasta la foto de otro acabado
- **THEN** la selección comercial y la variante añadible permanecen intactas.

#### Scenario: Acabado con foto grande
- **WHEN** el usuario cambia manualmente a un acabado con foto grande API
- **THEN** esa foto se activa y todas las demás fotos siguen navegables.

#### Scenario: Acero cepillado sin foto
- **WHEN** el usuario selecciona Acero cepillado en Persio/Miox sin foto grande para ese acabado
- **THEN** permanece la foto activa y el acabado sigue seleccionable, sin usar la muestra ni confundirlo con Níquel.

#### Scenario: Cambio de tipo
- **WHEN** cambia lavabo bajo, lavabo alto o bidé sin cambiar acabado
- **THEN** la imagen activa permanece intacta.

### Requirement: Combinaciones exclusivamente reales
El sistema SHALL construir selecciones exclusivamente con `variants[]`, IDs reales y atributos API, y relacionar `finish_options[].name` con `variant.finish` o `attributes.finish`. SHALL deshabilitar combinaciones inexistentes y bloquear añadir sin variante completa. Los ejes con una opción SHALL mostrarse como información. Instalación y mecanismo SHALL ser informativos salvo alternativas reales dentro de las variantes del mismo producto; SHALL evitar combinaciones entre productos diferentes.

#### Scenario: Tipos restringidos
- **WHEN** se configura Sion o Paladio
- **THEN** Sion no ofrece caño alto y Paladio no ofrece bidé.

#### Scenario: Combinación inexistente
- **WHEN** no existe una variante con el conjunto de atributos solicitado
- **THEN** la combinación no es añadible y su opción incompatible está deshabilitada.

#### Scenario: Variante real sin referencia
- **WHEN** se elige una de las seis variantes Níquel de Persio/Miox con referencia nula e ID real
- **THEN** puede añadirse al presupuesto con ese ID, sin SKU ni referencia inventados.

#### Scenario: Ducha de instalación fija
- **WHEN** todas las variantes de una ducha comparten instalación y mecanismo
- **THEN** ambos se muestran como información y no como selectores que fabriquen otro producto.

### Requirement: Selectores con muestra opcional
El sistema SHALL usar las URLs y metadatos API de `tap_type_options`, `finish_options`, `specs.selector_images` y `variants[].attributes.selector_image_url` únicamente para controles de selección. SHALL mantener nombre accesible y opciones de texto si no existe muestra. Los identificadores internos de muestra SHALL mantenerse separados del nombre comercial y de la referencia.

#### Scenario: Iony sin muestra
- **WHEN** Iony devuelve acabados sin imágenes de selector
- **THEN** los acabados se muestran como opciones de texto seleccionables.

#### Scenario: Muestra interna de Níquel
- **WHEN** una opción tiene `value=niquel`, `name=Níquel` y una miniatura
- **THEN** la variante se relaciona por nombre de acabado, la miniatura queda en el selector y su ID no se usa como referencia comercial.
