## ADDED Requirements

### Requirement: Contexto de navegación mínimo
Cada mensaje SHALL incluyendo solo: ruta actual, slug del producto abierto si existe, filtros relevantes del catálogo si se pueden leer sin modificar su lógica, e idioma de interfaz (`locale: "es"`). El cliente SHALL NOT enviar el DOM completo, textos de página, precios, datos de formularios ni historial de navegación.

#### Scenario: Mensaje desde la portada
- **WHEN** el usuario envía un mensaje desde `/`
- **THEN** el contexto lleva `pagePath: "/"`, `productSlug: null`, `filters: {}` y `locale: "es"`

#### Scenario: Mensaje desde una ficha de producto
- **WHEN** el usuario envía un mensaje abierta la ficha `/productos/mampara-gme-90`
- **THEN** el contexto lleva `pagePath: "/productos/mampara-gme-90"` y `productSlug: "mampara-gme-90"`, sin contenido del fichero, ni precios en el payload

#### Scenario: Mensaje desde el catálogo con filtros
- **WHEN** el usuario envía un mensaje desde `/productos` con filtros activos ya existentes
- **THEN** el contexto lleva únicamente las claves de filtro ya permitidas por el catálogo le.boost desde el estado vigente, sin ajustar lógica de filtros ni consultas del catálogo

### Requirement: Rutas internas validadas
El render de productos y acciones SHALL validar que `target`/`internalPath` es una ruta interna permitida (mismo origen, prefijo `/productos/...` o de navegación de la web) antes de crear el enlace; rutas externas o arbitrarias SHALL discardarse.

#### Scenario: Destino interno válido
- **WHEN** una acción `navigate_internal` con `target: "/productos/gme-mampara-90"` llega
- **THEN** se renderiza un enlace interno usando el router de la aplicación

#### Scenario: Destino no permitido
- **WHEN** llega un `internalPath` hacia un origen distinto o un `target` externo en `navigate_internal`
- **THEN** la tarjeta o acción no renderiza enlace y la interfaz muestra el resto del mensaje con seguridad

### Requirement: Destinos de contacto restringidos
Para acciones `contact_official` el sistema SHALL aceptar exclusivamente los destinos oficiales ya publicados por la propia web (los mismos canales de contacto de la sección Contacto), y SHALL NOT renderizar nunca enlaces de contacto arbitrarios o desconocidos.

#### Scenario: Canal oficial permitido
- **WHEN** llega `contact_official` con un destino incluido en la configuración de canales oficiales existente (p. ej. teléfono o email ya publicados)
- **THEN** la interfaz muestra ese canal con su acción nativa (tel:, mailto:) tal como ya están en la web

#### Scenario: Canal desconocido
- **WHEN** llega `contact_official` con un destino que no está en la configuración de canales oficiales
- **THEN** no se muestra ese enlace de contacto y la acción ese descartada

### Requirement: Orígenes de imagen restringidos
Las imágenes de las tarjetas de producto SHALL usar únicamente origen(es) aprobados por el catálogo (el `asset_base_url` ya configurado y los orígenes que las fichas ya usan); URLs de imagen de otros orígenes SHALL descartarse y la tarjeta se renderiza sin imagen.

#### Scenario: Origen válido
- **WHEN** la respuesta incluye `imageUrl` del origen aprobado del catálogo
- **THEN** la tarjeta muestra la imagen con `loading="lazy"` y `alt` descriptivo

#### Scenario: Origen no aprobado
- **WHEN** la respuesta incluye una `imageUrl` de un origen no aprobado
- **THEN** la tarjeta se renderiza sin imagen y no se emite petición alguna a ese origen

### Requirement: Render seguro de texto
El texto mostrado del asistente y demás payloads SHALL renderizarse como texto plano seguro; el sistema SHALL NOT insertar HTML arbitrario del modelo ni ejecutar enlaces no validados por las reglas de rutas y contactos anteriores.

#### Scenario: Texto con etiquetas
- **WHEN** la respuesta del asistente contiene texto con `<script>` o marcas HTML
- **THEN** el texto se renderiza literal, sin ejecutar ni introducir en el DOM contenido ejecutable
