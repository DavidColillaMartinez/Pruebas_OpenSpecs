## Purpose

Permitir explorar productos y preparar presupuestos con interfaces completas y adaptativas, conservando la lógica comercial y sus contratos existentes.

## ADDED Requirements

### Requirement: Catálogo adapta controles y resultados al área útil
El catálogo SHALL contener masthead, búsqueda, Limpiar, filtros, ordenación, etiquetas largas, resultados y paginación dentro del espacio útil. La cuadrícula SHALL adaptarse al área real de resultados cuando haya barras laterales, conservando imágenes y textos completos y acceso a quitar filtros.

#### Scenario: Filtros y cesta reducen área de resultados
- **WHEN** hay resultados cargados con filtros activos largos y cesta visible
- **THEN** tarjetas y controles caben sin salir del contenedor ni competir por el mismo espacio, y Cargar más/fin siguen alcanzables

#### Scenario: Estados del catálogo
- **WHEN** el catálogo está cargando, vacío, en error con reintento o paginando
- **THEN** sus mensajes y acciones permanecen legibles y accesibles en ambos temas, sin alterar consultas, facetas ni tamaño de página

### Requirement: Cesta y filtros conservan acceso con listas largas
La cesta y el panel/drawer de filtros SHALL ofrecer scroll accesible y controles de cierre/acción alcanzables en estados vacíos y poblados, incluidos nombres/referencias largos y varias líneas. La UI SHALL conservar cantidades, eliminación, selección y persistencia existentes.

#### Scenario: Drawer poblado en pantalla baja
- **WHEN** se abren filtros o cesta con suficientes elementos para requerir scroll
- **THEN** todas las opciones/líneas, cerrar e Ir a presupuesto son alcanzables, con foco y sin controles externos tapando la interacción

### Requirement: Fichas completas con variantes y galerías adaptadas
Las fichas SHALL presentar galería, miniaturas, flechas, vista ampliada y cierre, textos largos, características, selectores, chips y swatches sin recortes ni invasión de opciones vecinas. Resumen, referencia y acciones de presupuesto SHALL permanecer visibles y utilizables.

#### Scenario: Familias comerciales representativas
- **WHEN** se revisan productos existentes de GME mamparas, IO con swatches, Royo modular/no modular, Duplach compacto y Manillons con medidas/acabados
- **THEN** sus opciones y medios se adaptan al espacio sin modificar variantes, referencias, disponibilidad o selección

#### Scenario: Galería ampliada en móvil horizontal
- **WHEN** se abre y utiliza una imagen ampliada en una ventana baja
- **THEN** imagen, navegación y cierre son alcanzables y conservan su funcionamiento y relación de aspecto

### Requirement: Formularios y presupuesto mantienen contenido y estados
Los formularios individuales y `/presupuesto` SHALL mostrar campos, consentimiento, acciones, validaciones, error, enviando y confirmación completos en ambos temas. Bordes, texto secundario, placeholders, seleccionados y deshabilitados SHALL ser distinguibles; el foco y scroll SHALL permitir editar y alcanzar acciones sin capas externas encima.

#### Scenario: Validación y envío simulado de varias líneas
- **WHEN** se ejercitan validación, enviando, error y confirmación con mocks explícitos en una cesta poblada
- **THEN** mensajes largos entran en el flujo y son legibles, y cantidades, persistencia y payload mantienen el contrato previo

#### Scenario: Presupuesto vacío y formulario individual
- **WHEN** se visita presupuesto vacío o se edita un formulario individual en distintas posiciones de scroll
- **THEN** sus mensajes, campos y acciones quedan accesibles sin ocultar contenido para resolver conflictos de espacio
