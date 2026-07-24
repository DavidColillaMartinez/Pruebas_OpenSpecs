## ADDED Requirements

### Requirement: Catalogo coherente con la identidad implementada
`/productos` SHALL usar las tipografias, tokens, espaciado y lenguaje minimalista de la landing actual, y MUST NOT convertirse en una rejilla generica de ecommerce ni modificar la landing.

#### Scenario: Encabezado del catalogo
- **WHEN** el usuario abre `/productos`
- **THEN** ve retorno claro a AREA LRMQ, un unico `h1`, introduccion breve y total real en una superficie porcelain coherente con la marca

#### Scenario: Identidad preservada
- **WHEN** se compara la landing antes y despues del cambio
- **THEN** su estructura, cabecera, navegacion, tipografias, media, transiciones y composicion permanecen sin cambios

### Requirement: Controles de descubrimiento claros
La pagina SHALL mostrar buscador visible, filtros, categorias dinamicas, ordenacion separada, resumen de filtros activos y accion `Limpiar filtros`.

#### Scenario: Desktop
- **WHEN** el viewport permite una composicion amplia
- **THEN** los filtros se presentan en una columna lateral o composicion equivalente y busqueda/ordenacion/resultados conservan jerarquia clara

#### Scenario: Mobile y tablet
- **WHEN** el viewport no admite filtros laterales persistentes
- **THEN** busqueda y ordenacion permanecen visibles y los filtros se abren en un panel modal accesible

#### Scenario: Filtros activos
- **WHEN** existe busqueda o filtros aplicados
- **THEN** cada criterio aparece con nombre legible, puede retirarse individualmente y existe una accion para limpiar todos

### Requirement: Tiles de producto utiles y no genericos
Cada resultado SHALL ser un enlace semantico completo a `/productos/:slug`, SHALL mostrar solo informacion publica util y SHALL mantener una proporcion de imagen estable.

#### Scenario: Producto con imagen
- **WHEN** un producto incluye media valida
- **THEN** la imagen se muestra completa con `object-contain`, alt significativo, superficie stonewash y carga diferida cuando queda bajo el primer viewport

#### Scenario: Producto sin imagen
- **WHEN** un producto no tiene media publica valida o falla su carga
- **THEN** la tile conserva dimensiones y muestra un estado `Imagen no disponible` sin inventar ni sustituir el asset

#### Scenario: Apertura de ficha
- **WHEN** el usuario activa una tile por puntero o teclado
- **THEN** navega al slug codificado correcto sin cambiar el contrato de la ficha

### Requirement: Estados completos del catalogo
La pagina SHALL diferenciar loading inicial, error recuperable, catalogo vacio, cero resultados por criterios, carga adicional, error adicional y final de resultados.

#### Scenario: Error inicial
- **WHEN** falla la primera consulta
- **THEN** se anuncia el error y se ofrece reintento sin recargar toda la aplicacion

#### Scenario: Cero resultados filtrados
- **WHEN** el endpoint devuelve total cero con criterios activos
- **THEN** se explican los criterios y se ofrece limpiar filtros

#### Scenario: Catalogo vacio
- **WHEN** el endpoint devuelve total cero sin criterios
- **THEN** se muestra un estado distinto que no culpa a los filtros

#### Scenario: Error al cargar mas
- **WHEN** falla un chunk posterior
- **THEN** los productos ya visibles se conservan y el usuario puede reintentar ese chunk

### Requirement: Accesibilidad y movimiento
La experiencia SHALL ser operable por teclado, SHALL tener foco visible, labels asociados, targets minimos de 44 px en tactil, anuncios de resultados y una alternativa reduced-motion.

#### Scenario: Drawer de filtros
- **WHEN** el usuario abre y cierra filtros mobile
- **THEN** el foco entra en el panel, Escape lo cierra, el foco vuelve al activador y el overflow previo se restaura

#### Scenario: Resultados actualizados
- **WHEN** cambia el conjunto de resultados
- **THEN** el total y estado se anuncian sin mover el foco inesperadamente

#### Scenario: Movimiento reducido
- **WHEN** `prefers-reduced-motion: reduce` esta activo
- **THEN** paneles, loading y tiles quedan utilizables sin transiciones prolongadas ni reveals que oculten contenido

### Requirement: Ficha individual estable
El cambio SHALL preservar comportamiento, contenido, galeria, variantes, metadata y presupuesto de `/productos/:slug`, salvo el scroll compartido y una coherencia visual imprescindible aprobada.

#### Scenario: Regresion de detalle
- **WHEN** se abren los dos slugs validos, un slug inexistente y el formulario de presupuesto con fetch mockeado
- **THEN** los estados y selecciones existentes siguen funcionando sin POST real
