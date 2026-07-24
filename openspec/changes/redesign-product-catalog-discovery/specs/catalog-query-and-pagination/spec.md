## ADDED Requirements

### Requirement: Estado de descubrimiento compartible en URL
Busqueda, filtros, ordenacion y pagina SHALL derivarse de la URL y SHALL restaurarse al recargar o usar Back/Forward.

#### Scenario: URL con criterios
- **WHEN** se abre una URL con search, facetas repetidas, sort y page validos
- **THEN** los controles y requests reflejan esos valores sin una interaccion adicional

#### Scenario: Parametro desconocido o invalido
- **WHEN** la URL contiene una opcion no respaldada por el contrato
- **THEN** se ignora o normaliza de forma explicita y no aparenta aplicar un filtro o sort inexistente

#### Scenario: Cambio de criterio
- **WHEN** cambia busqueda, filtro u ordenacion
- **THEN** la URL se actualiza y `page` vuelve a 1

### Requirement: Busqueda con debounce y control de carreras
La busqueda SHALL esperar aproximadamente 300 ms antes de consultar y cada firma de query SHALL cancelar o ignorar respuestas obsoletas.

#### Scenario: Escritura rapida
- **WHEN** el usuario introduce varios caracteres antes de terminar el debounce
- **THEN** no se lanza una request util por cada pulsacion y solo el valor estable actualiza resultados

#### Scenario: Respuesta antigua tardia
- **WHEN** una request anterior termina despues de una query nueva
- **THEN** su respuesta no reemplaza los resultados ni facetas vigentes

### Requirement: Filtros combinables server-side
El sistema SHALL enviar filtros al endpoint sobre el conjunto completo, SHALL combinar OR dentro de una dimension y AND entre dimensiones segun contrato, y MUST NOT filtrar localmente solo los items cargados.

#### Scenario: Dos categorias y un proveedor
- **WHEN** el usuario activa dos valores de categoria y uno de proveedor
- **THEN** la URL y request conservan valores repetidos y el total procede del servidor

#### Scenario: Limpieza
- **WHEN** el usuario activa `Limpiar filtros`
- **THEN** se eliminan search/facetas, se conserva un sort valido segun decision de producto y la pagina vuelve a 1

### Requirement: Ordenacion sobre el conjunto completo
La ordenacion habilitada SHALL ejecutarse antes de paginar sobre el universo filtrado completo y SHALL usar un tie-breaker estable; MUST NOT ordenarse solo los items visibles en pantalla.

#### Scenario: Nombre A-Z
- **WHEN** se selecciona `name_asc`
- **THEN** todas las paginas respetan nombre ascendente y desempate documentado, no solo los items visibles

#### Scenario: Nombre Z-A
- **WHEN** se selecciona `name_desc`
- **THEN** todas las paginas respetan nombre descendente y el mismo desempate estable

#### Scenario: Relevancia
- **WHEN** existe busqueda y el backend declara `relevance` soportado
- **THEN** la opcion se habilita y el endpoint aplica la relevancia antes de paginar

### Requirement: Carga incremental con total real
La pagina SHALL usar chunks con limit/offset y un control `Cargar mas`, SHALL conservar items previos y SHALL mostrar progreso contra `pagination.total`.

#### Scenario: Primer chunk
- **WHEN** llega la primera respuesta
- **THEN** se muestra `Mostrando X de Y` con total server-side y `Cargar mas` solo si X es menor que Y

#### Scenario: Cargar mas
- **WHEN** el usuario activa el control
- **THEN** se consulta solo el siguiente offset, se anexan items no duplicados y `page` aumenta en URL

#### Scenario: Fin
- **WHEN** la cantidad cargada alcanza el total
- **THEN** el boton desaparece o queda sustituido por un mensaje accesible de final

#### Scenario: Recarga en pagina avanzada
- **WHEN** se abre una URL con `page=N`
- **THEN** se reconstruyen solo los chunks necesarios hasta N sin descargar automaticamente todo el catalogo

### Requirement: Retorno desde ficha
El catalogo SHALL preservar query, cantidad cargada y posicion razonable al volver desde `/productos/:slug`.

#### Scenario: Back desde detalle
- **WHEN** el usuario abre una ficha desde una pagina avanzada y usa Back
- **THEN** vuelve a los mismos criterios, productos cargados y posicion despues de rehidratar el contenido
