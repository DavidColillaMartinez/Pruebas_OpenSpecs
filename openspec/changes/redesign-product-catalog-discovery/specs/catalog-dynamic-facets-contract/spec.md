## ADDED Requirements

### Requirement: Facetas calculadas por el catalogo completo
El endpoint SHALL devolver facetas dinamicas con `value`, `label` y `count` calculadas sobre el universo filtrado, y el navegador MUST NOT derivarlas de una sola pagina ni hardcodearlas. Mientras el endpoint no entregue `facets`, la derivacion transitoria SHALL usar el conjunto completo obtenido paginando el endpoint y MUST documentarse y sustituirse por datos server-side cuando exista contrato.

#### Scenario: Facetas sin filtros
- **WHEN** se solicita la primera pagina con facetas
- **THEN** categorias, proveedores y demas dimensiones soportadas reflejan opciones y cantidades del conjunto publico completo

#### Scenario: Facetas con filtros combinados
- **WHEN** existen search y filtros activos
- **THEN** cada count sigue la semantica disyuntiva/conjuntiva documentada y cuadra con el total que produciria esa opcion

#### Scenario: Opcion activa con cero
- **WHEN** una opcion de URL ya no existe o queda con count cero
- **THEN** permanece explicable/removible sin convertirse en una etiqueta inventada

### Requirement: Dimensiones condicionadas a datos reales
La UI SHALL mostrar solo dimensiones devueltas y consistentes; material, marca, color u otros atributos MUST NOT aparecer por inferencia parcial.

#### Scenario: Faceta ausente
- **WHEN** el contrato no devuelve una dimension o no tiene valores fiables
- **THEN** la seccion de filtro no se renderiza

#### Scenario: Etiqueta de proveedor
- **WHEN** la faceta entrega ID y nombre visible de proveedor
- **THEN** la URL usa el ID estable y la UI muestra el nombre, sin hardcodear ambos

### Requirement: Extension preferente del endpoint de productos
Las facetas y metadatos de sort SHALL integrarse preferentemente en `GET /api/catalog/products`, manteniendo las cuatro rutas y variables server-side actuales.

#### Scenario: Primera request de una query
- **WHEN** se solicita un conjunto nuevo
- **THEN** la request puede incluir `include_facets=1` y recibe items, pagination, facets y sort

#### Scenario: Chunk adicional
- **WHEN** se solicita un offset posterior con los mismos criterios
- **THEN** puede omitirse el recalculo de facetas sin cambiar total ni orden

#### Scenario: Necesidad de quinta ruta
- **WHEN** n8n no puede ampliar el GET existente y requiere `/facets`
- **THEN** este cambio se detiene antes de editar proxy/rutas y se propone un cambio backend separado

### Requirement: Sorting habilitado solo por contrato
El endpoint SHALL declarar los sorts soportados y la UI MUST NOT presentar una opcion habilitada que el servidor ignore. Mientras no exista contrato, el sort transitorio SHALL aplicarse sobre el universo filtrado completo (nunca sobre la pagina visible) y documentarse como sustituible.

#### Scenario: Nombre soportado
- **WHEN** `name_asc` y `name_desc` aparecen en `sort.supported`
- **THEN** la UI los habilita y comprueba que cambian realmente el orden completo

#### Scenario: Recientes, novedades y mas vendidos sin datos
- **WHEN** no existen fecha publica, marca de novedad o agregado de ventas fiables
- **THEN** las opciones aparecen disabled con `Proximamente` y explicacion accesible

#### Scenario: Destacados editorial
- **WHEN** se plantea ordenar editorialmente sin ventas
- **THEN** se documenta un futuro `featured_order` y no se crea migracion dentro de este cambio

### Requirement: Contrato y secretos
La ampliacion SHALL mantener el navegador en `/api/catalog/*`, MUST NOT exponer URL n8n, `/webhook`, `webhookId` ni variables server-side y MUST NOT cambiar quote-requests.

#### Scenario: Bundle de produccion
- **WHEN** se genera el frontend con facetas y sorting
- **THEN** no contiene secretos, hosts upstream ni nombres de variables server-side

#### Scenario: Pruebas de contrato
- **WHEN** se prueban facetas, filtros y sort
- **THEN** se usan GET/mocks y no se ejecuta ningun POST real de presupuesto
