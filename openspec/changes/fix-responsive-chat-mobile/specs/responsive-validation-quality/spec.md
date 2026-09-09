## ADDED Requirements

### Requirement: Matriz de viewport validada
La validación SHALL cubrir 320x568, 360x800, 375x812, 390x844, 414x896, 430x932, 480x800, 568x320, 667x375, 768x1024, 820x1180, 912x1368, 1024x768, 1280x800, 1440x900, 1920x1080, 2560x1440, 3440x1440 y 3840x2160, usando emulación si el navegador no permite 320 px reales.

#### Scenario: Resoluciones móviles y tablet
- **WHEN** se ejecuta la matriz en móvil portrait, landscape y tablet
- **THEN** cada resolución queda registrada con resultado de overflow, foco, controles fijos y composición

#### Scenario: Resoluciones desktop y ultra-wide
- **WHEN** se ejecuta la matriz de 1024 a 3840 px
- **THEN** se conserva la experiencia desktop, el contenido no queda excesivamente pequeño y no aparecen espacios o escalados defectuosos

### Requirement: Invariantes de viewport y consola
En cada resolución, `document.documentElement.scrollWidth` SHALL igualar `clientWidth`, salvo carruseles internos intencionados; no SHALL existir texto cortado, controles fuera del viewport, fixed/sticky solapando contenido ni errores de consola.

#### Scenario: Auditoría automática de ancho
- **WHEN** se mide el documento en una resolución de la matriz
- **THEN** la comprobación de ancho pasa o identifica exclusivamente un carrusel interno documentado

#### Scenario: Auditoría de consola
- **WHEN** se recorren portada, catálogo, ficha y presupuesto con el chatbot abierto y cerrado
- **THEN** no se registran errores de consola, warnings nuevos ni recursos fallidos atribuibles a la corrección

### Requirement: Accesibilidad transversal
Los controles táctiles principales SHALL medir al menos 44 px, el foco SHALL ser visible, Escape SHALL cerrar drawers, lightbox y chatbot correctamente y las superficies SHALL mantener nombres accesibles, `aria-modal` donde corresponda y scroll independiente.

#### Scenario: Recorrido de teclado
- **WHEN** el usuario recorre header, drawer, chatbot, catálogo, ficha y presupuesto solo con teclado
- **THEN** el foco visible sigue un orden utilizable, no se pierde en overlays y Escape cierra el overlay activo

### Requirement: Validación visual y de regresión
La entrega SHALL comparar el estado light-mode sin cambios con el estado corregido en desktop y móvil, revisar interacciones reales y conservar media, Vision, comparador, catálogo y presupuesto. Las pruebas automatizadas no sustituyen la revisión visual.

#### Scenario: Comparación antes/después
- **WHEN** se revisan capturas o una sesión de navegador de las superficies afectadas
- **THEN** se documentan diferencias intencionadas, ausencia de cambios en áreas protegidas y cualquier limitación de la herramienta visual

### Requirement: Alcance externo protegido
La corrección SHALL limitarse al código versionado y tests frontend. No SHALL modificar n8n, Neon, VPS, Vercel, variables de entorno, secretos, contratos externos, `assets/Catalogo/**`, `assets/Boceto/**` ni media protegida para simular una solución.

#### Scenario: Problema externo
- **WHEN** una prueba detecta latencia, webhook, imagen remota, contrato o configuración externa defectuosa
- **THEN** se documenta archivo, línea y comportamiento observado como pendiente externo, sin esconderlo mediante datos simulados en frontend

### Requirement: Texto no editable sin apariencia de campo de escritura
El texto no editable de la web SHALL dejar de dibujar un caret de inserción que aparente un campo editable al pulsar sobre él, manteniendo el caret visible y utilizable en campos reales (`input`, `textarea`, `contenteditable`) sin cambiar la selección de texto ni el layout. Este refuerzo cubre la percepción de "campo activo" si la causa del síntoma fuera el caret de selección del navegador, y no sustituye desactivar `F7`/caret browsing si así se confirma por el usuario.

#### Scenario: Pulsar sobre texto de portada o catálogo
- **WHEN** el usuario pulsa al final de un `h1` o párrafo no editable en un navegador con caret de selección
- **THEN** no aparece la barra de escritura parpadeante y el layout no cambia

#### Scenario: Campos reales
- **WHEN** el usuario escribe en el chat, formularios de presupuesto o búsqueda
- **THEN** el caret sigue visible y con comportamiento normal dentro de esos campos
