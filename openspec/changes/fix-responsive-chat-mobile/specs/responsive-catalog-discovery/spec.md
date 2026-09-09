## ADDED Requirements

### Requirement: Catálogo responsive y sin overflow
`/productos` SHALL adaptar masthead, buscador, ordenación, filtros, chips, skeleton, resultados vacíos, errores, cargar más, barra de selecciones y chatbot entre 320 px y 1024 px, sin overflow horizontal accidental ni texto cortado.

#### Scenario: Catálogo en móvil estrecho
- **WHEN** el usuario consulta el catálogo en 320x568, 360x800, 390x844 o 430x932
- **THEN** buscador, ordenación, filtros, chips y resultados caben dentro del viewport y los controles no se pegan a títulos o imágenes

#### Scenario: Catálogo en tablet
- **WHEN** el usuario consulta el catálogo en 768x1024, 820x1180 o 912x1368
- **THEN** la distribución utiliza el espacio disponible sin presentar una versión móvil rota ni el overflow de la versión desktop

### Requirement: Controles de filtros y selecciones coordinados
Los drawers de filtros y la barra "Mis selecciones" SHALL tener scroll interno, body scroll lock, focus trap, Escape, cierre táctil de al menos 44 px y safe-area inferior. El launcher del chatbot SHALL colocarse sin solapar esos controles.

#### Scenario: Drawer de filtros con contenido largo
- **WHEN** el usuario abre filtros en 320–430 px y el contenido requiere scroll
- **THEN** el drawer se desplaza internamente, mantiene su cierre visible y no mueve el catálogo ni el chatbot del fondo

#### Scenario: Selecciones y chatbot simultáneos
- **WHEN** "Mis selecciones" y el launcher del chatbot son visibles en móvil
- **THEN** ninguno tapa el botón principal, el resumen o los controles del otro

### Requirement: Tarjetas legibles y compactas
Las tarjetas del catálogo SHALL usar `min-w-0`, preservar la proporción de imagen, envolver nombres y facts largos, y separar visualmente metadata, facts, referencias, acciones y botones. Una tarjeta móvil SHALL evitar superar 600 px de altura salvo que el contenido lo exija.

#### Scenario: Nombre y facts largos
- **WHEN** una tarjeta recibe un nombre o facts extensos
- **THEN** el texto se envuelve dentro de la tarjeta y las acciones permanecen accesibles sin solaparse

#### Scenario: Imagen insuficiente o error de carga
- **WHEN** la imagen de una tarjeta es de baja resolución o devuelve 404
- **THEN** se conserva una proporción y altura estable, se muestra un fallback accesible y no se amplía una imagen por encima de su capacidad

### Requirement: Catálogo conserva su comportamiento
La corrección responsive SHALL mantener intactas las consultas, filtros, ordenación, skeleton, retry, cargar más, selección de productos y navegación existentes; no SHALL cambiar la lógica de negocio para resolver un problema de layout.

#### Scenario: Aplicar y quitar filtros
- **WHEN** el usuario aplica, quita o combina filtros desde móvil y desktop
- **THEN** los resultados y las peticiones siguen el mismo comportamiento funcional previo

#### Scenario: Barra de selecciones
- **WHEN** el usuario añade, actualiza o elimina un producto desde una tarjeta móvil
- **THEN** la selección y su navegación al presupuesto siguen funcionando sin cambios de contrato

### Requirement: SEO del catálogo permanece estable
La página de catálogo SHALL conservar title, description, canonical y datos estructurados existentes, sin incorporar el texto o estado del chatbot como contenido SEO duplicado.

#### Scenario: Auditoría de metadatos
- **WHEN** se compara el HTML de `/productos` antes y después de la corrección
- **THEN** no se pierden metadatos SEO ni se añade un segundo bloque indexable del chat

### Requirement: Botón volver arriba en el catálogo
El catálogo SHALL ofrecer un control fijo para volver arriba que aparezca cuando el usuario scrolleé más de un viewport y que, junto a la barra "Mis selecciones" y al launcher del chat, quede apilado sin solapamientos y respetando la safe area. El control SHALL medir al menos 44 px, tener nombre accesible y desplazar la ventana al inicio con `behavior` suave o instantáneo según `prefers-reduced-motion`, sin alterar consultas, filtros ni selección.

#### Scenario: Catálogo con scroll largo
- **WHEN** el usuario scrollea más de un viewport por `/productos`
- **THEN** aparece el botón y al pulsarlo vuelve arriba sin alterar el estado de la consulta

#### Scenario: Convivencia con la barra de selecciones
- **WHEN** "Mis selecciones" y el botón de volver arriba son visibles en móvil
- **THEN** ninguno tapa al otro ni al launcher del chat
