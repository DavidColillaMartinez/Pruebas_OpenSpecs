## ADDED Requirements

### Requirement: Política de indexación por clase de URL
El proyecto SHALL documentar y aplicar una política de status HTTP, indexación, canonical y sitemap para portada, catálogo base, filtros/búsqueda/orden/paginación, fichas, presupuesto y rutas inexistentes. SHALL evitar canonicals que oculten contenido indexable distinto y combinaciones duplicadas indexables sin intención explícita.

#### Scenario: URL con filtros y paginación
- **WHEN** se inspecciona una URL de catálogo con parámetros
- **THEN** robots, canonical y enlaces de descubrimiento siguen la política documentada sin perder acceso a las fichas válidas

### Requirement: Metadatos y contenido rastreable coherentes
Cada ruta SHALL exponer título, descripción y metadatos aplicables a su contenido, restaurándolos al navegar. La auditoría SHALL comparar HTML inicial, DOM renderizado y respuesta directa, incluyendo metadatos sociales y limitaciones para rastreadores sin JS. Cambiar solo `document.title` SHALL NOT considerarse prueba suficiente de SEO completo.

#### Scenario: Ficha a portada
- **WHEN** el usuario navega de una ficha válida a la portada y después usa Atrás
- **THEN** cada ruta recupera metadatos propios, sin duplicados ni datos arrastrados de otra página

### Requirement: Páginas inexistentes con semántica HTTP correcta
Una ruta de página inexistente o producto confirmado inexistente SHALL mostrar recuperación con marca y enlaces útiles y responder HTTP 404 en petición directa. Una indisponibilidad temporal SHALL NOT clasificarse como producto inexistente. Si la arquitectura actual impide este comportamiento, el hallazgo SHALL permanecer bloqueado hasta resolver el diseño, sin aceptarlo como soft 404.

#### Scenario: Ruta desconocida pegada en el navegador
- **WHEN** se solicita directamente una ruta que no corresponde a una página
- **THEN** se obtiene 404 con recuperación útil y política de no indexación coherente, no un HTML genérico con 200

#### Scenario: Upstream no disponible
- **WHEN** la carga de una ficha falla temporalmente sin confirmar ausencia del producto
- **THEN** se muestra un estado recuperable y no se declara que el producto fue retirado

### Requirement: Routing no intercepta APIs ni recursos
Una corrección de routing SHALL conservar métodos, status y content-type de APIs, assets y páginas válidas. SHALL NOT devolver el index HTML de la SPA para una API o archivo inexistente como sustituto de su error correcto.

#### Scenario: API o asset desconocido
- **WHEN** se pide una ruta API inválida o un archivo estático inexistente
- **THEN** la respuesta conserva semántica de error adecuada y no se transforma en una página SPA con status 200

### Requirement: Descubrimiento y datos estructurados verificables
Sitemap, robots y datos estructurados SHALL ser coherentes con URLs canónicas y contenido real. SHALL NOT inventar precios, disponibilidad, ratings, reseñas o productos. El sitemap SHALL incluir solo páginas indexables verificadas y documentar cómo se actualizan las URLs de productos; robots SHALL NOT impedir leer `noindex` de páginas cuyo retiro del índice dependa de esa directiva.

#### Scenario: Producto sin precio público
- **WHEN** se generan metadatos o datos estructurados de una ficha sin precio confirmado
- **THEN** no se publica una oferta o precio ficticio para completar el esquema
