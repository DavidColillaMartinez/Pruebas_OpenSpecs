## Purpose

Integrar el descubrimiento remoto de GME IO 2026 en el catálogo existente, con filtros relevantes, paginación y presentación compatible con los demás proveedores.

## ADDED Requirements

### Requirement: Alcance exclusivo identificado por API
El sistema SHALL aplicar las reglas de producto IO únicamente cuando la API identifique conjuntamente proveedor `gme`, categoría `griferia` y `specs.gme_io_2026=true`. SHALL conservar los tres criterios tras normalización, utilizar datos API en runtime y mantener el comportamiento de productos fuera del alcance.

#### Scenario: Producto IO reconocido
- **WHEN** la API devuelve un producto con los tres criterios
- **THEN** se habilitan las reglas IO sin consultar un catálogo estático paralelo.

#### Scenario: Proveedores y categorías excluidos
- **WHEN** el producto es Mamparas/GME, Royo, Duplach, Espejos, o GME/griferia sin la marca IO verdadera
- **THEN** conserva su comportamiento previo y no recibe las reglas comerciales o de imágenes IO.

### Requirement: Filtros y paginación del servidor
El sistema SHALL enviar al proxy existente `supplier_id`, `category_id`, `catalog_section`, `collection`, `tap_type`, `installation`, `mechanism`, `finish` y `subcategory` cuando estén seleccionados y sean pertinentes. SHALL conservar paginación y reiniciar offset a cero al cambiar filtros. SHALL usar facetas del servidor mediante `include_facets=true` o `1` y reutilizar el descubrimiento existente sin peticiones duplicadas ni descargar todo para filtrar localmente.

#### Scenario: Filtrar ducha termostática empotrable
- **WHEN** se seleccionan GME, griferia, Duchas, empotrable y termostático
- **THEN** el listado envía esos valores al servidor con offset cero y utiliza las facetas de la respuesta.

#### Scenario: Acabado exacto y serie
- **WHEN** se seleccionan Persio, lavabo alto y la faceta `Níquel`
- **THEN** se envía `collection=Persio` (o el alias API `series=Persio`) y `finish=Níquel`, nunca el identificador interno `niquel`.

#### Scenario: Resultados vacíos
- **WHEN** el servidor devuelve cero productos para Sion con `tap_type=lavabo_alto`
- **THEN** se muestra el estado vacío existente sin inventar productos ni sustituir el resultado por datos locales.

### Requirement: Facetas pertinentes y dependientes
El sistema SHALL mostrar Familia desde `facets.catalog_section`, Serie/modelo desde `facets.collection`, y demás opciones exclusivamente desde las facetas API del alcance seleccionado. Duchas SHALL seguir dentro de `category_id=griferia`. SHALL ocultar controles vacíos o irrelevantes, usar mecanismo en Duchas y mantener accesibles lavabo y bidé empotrables. Al cambiar familia o proveedor SHALL eliminar filtros dependientes incompatibles, también si la consulta produce cero productos.

#### Scenario: Cambiar Duchas a Grifería
- **WHEN** se cambia la familia desde Duchas con mecanismo activo a Grifería
- **THEN** se elimina el mecanismo incompatible, se reinicia la paginación y solo aparecen opciones pertinentes devueltas por API.

#### Scenario: Cambiar a Mamparas
- **WHEN** se cambia de GME/griferia a GME/mamparas
- **THEN** desaparecen los filtros exclusivos IO y se conserva el perfil previo de Mamparas.

#### Scenario: Empotrables accesibles
- **WHEN** las facetas ofrecen lavabo o bidé empotrable
- **THEN** pueden encontrarse mediante instalación y, si resulta necesaria, subcategoría, sin crear categorías nuevas.

### Requirement: Tarjeta común y datos públicos
Las tarjetas IO SHALL usar `main_image_url` y `name` de API, conservar el bloque común de imagen y texto y la alineación de títulos y acciones, y encajar el producto completo sin deformación ni recorte. SHALL evitar repetir colección cuando coincida con el nombre; la subcategoría puede distinguir modelos homónimos. SHALL excluir precios, Puntos y precios nulos y no añadir overlays ni portadas reconstruidas.

#### Scenario: Tarjeta Fiore
- **WHEN** nombre y colección son Fiore
- **THEN** aparece el nombre una sola vez, con portada API dentro del marco común y sin campos de precio.

#### Scenario: Productos con nombres compartidos
- **WHEN** modelos de lavabo y ducha comparten nombre
- **THEN** el título sigue siendo el nombre API y la subcategoría puede diferenciarlos fuera del título.
