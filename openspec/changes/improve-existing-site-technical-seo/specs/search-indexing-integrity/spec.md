## Purpose

Permitir que los buscadores reciban, descubran e interpreten las páginas actuales de AREA LRMQ conservando el contenido, la presentación y las funcionalidades aprobadas, con evidencia antes de integrar la candidata.

## ADDED Requirements

### Requirement: Alcance limitado a la web existente

La solución SHALL conservar las páginas, secciones, textos visibles, navegación, medios y comportamiento aprobados en escritorio y móvil, claro y oscuro. SHALL NOT añadir páginas comerciales, contenido SEO oculto, controles visibles, nuevas animaciones ni cambios de contratos de negocio. Los metadatos SHALL describir únicamente contenido y datos confirmados existentes.

La adaptación móvil aprobada durante implementación SHALL usar la estructura común con PC como referencia. Inicio móvil SHALL adoptar logo, Tienda, nombre, subtítulo y las tres tarjetas del PC, apiladas y legibles, con imagen vertical aprobada y scroll natural; su párrafo/CTA exclusivos podrán sustituirse. Las demás secciones SHALL conservar información móvil útil y funciones dentro de la estructura compartida, incluidas asesoría, profesionales independientes y contratación separada. Estos ajustes responsive expresamente aprobados no constituyen una regresión respecto a la antigua composición móvil; escritorio SHALL mantener su presentación.

#### Scenario: Revisión del alcance entregado
- **WHEN** se compara la candidata con la referencia fijada
- **THEN** las rutas y contenidos comerciales visibles se conservan y el diff no introduce páginas por sección, servicio o municipio ni textos comerciales adicionales

#### Scenario: Comparación de un estado equivalente
- **WHEN** ambas versiones muestran el mismo viewport, tema, datos y punto de interacción o animación
- **THEN** conservan composición, tipografía, espaciado, medios, controles, navegación y comportamiento

### Requirement: Contenido propio en la respuesta inicial

Las rutas existentes SHALL entregar en el HTML inicial su contenido público pertinente y sus metadatos específicos sin requerir interacción ni ejecución de JavaScript para obtener el contenido comercial principal. SHALL exponer el mismo contenido a personas y rastreadores. Catálogo y fichas SHALL usar datos públicos reales del contrato vigente, no fixtures en la entrega destinada a publicación.

#### Scenario: Portada solicitada sin JavaScript
- **WHEN** se solicita directamente `/` sin ejecutar JavaScript
- **THEN** la respuesta contiene los textos y enlaces principales existentes de la portada y sus metadatos, en lugar de un contenedor vacío

#### Scenario: Ficha pública solicitada directamente
- **WHEN** se solicita una ficha válida por su URL actual
- **THEN** el HTML inicial contiene su nombre, contenido público disponible y metadatos propios sin heredar el canonical de Inicio

### Requirement: Activación cliente sin pérdida de estado ni diferencias visibles

La activación de la aplicación SHALL conservar el contenido inicial, la presentación responsive y las interacciones actuales sin duplicaciones, errores de hidratación, flashes de otra composición ni reinicios de estado. El contenido principal SHALL estar presente en el documento sin requerir clics, scroll o finalización de una animación para generarlo; esta disponibilidad SHALL conservar los tiempos de revelado visual aprobados.

#### Scenario: Primera entrada desktop y móvil
- **WHEN** se abre una ruta en cualquiera de los dos modos y se activa JavaScript
- **THEN** la transición conserva su composición y contenido sin mostrar fugazmente la otra versión ni duplicar controles

#### Scenario: Activación con selección local existente
- **WHEN** el visitante entra con una selección válida según el almacenamiento vigente
- **THEN** recupera sus productos y preferencias con la misma semántica de caducidad, sin reiniciarlos o sustituirlos por estado del servidor

### Requirement: Metadatos coherentes por ruta

Cada documento SHALL exponer un único título, descripción, canonical cuando corresponda, directiva robots y conjunto de metadatos sociales coherentes. HTML inicial, cabeceras aplicables y navegación cliente SHALL coincidir en sus instrucciones. El canonical SHALL utilizar el dominio definitivo y no el puerto de revisión ni parámetros de seguimiento.

#### Scenario: Catálogo a ficha y regreso
- **WHEN** se navega de catálogo a ficha, a Inicio y mediante Atrás/Adelante
- **THEN** cada destino recupera sus metadatos propios sin duplicados, instrucciones contradictorias o datos arrastrados de otra ruta

#### Scenario: Acceso en un puerto local
- **WHEN** se inspeccionan los metadatos de la candidata local
- **THEN** los canonicals apuntan a las URLs correspondientes de `https://arealrmq.es` y no al origen de pruebas

### Requirement: Política de indexación por clase de URL

Inicio, catálogo base y fichas públicas válidas SHALL ser indexables. Presupuesto, legales y variantes de búsqueda/filtros/orden alternativo SHALL emitir `noindex, follow` desde la respuesta inicial y quedar fuera del sitemap. La paginación existente sin esas variantes SHALL conservar canonical propio cuando cambie el conjunto mostrado; la primera página SHALL normalizarse a la base. Las variantes funcionales SHALL seguir funcionando con sus URLs actuales.

#### Scenario: Presupuesto o política de privacidad
- **WHEN** se solicita directamente una de estas páginas
- **THEN** la respuesta contiene su `noindex, follow` antes de ejecutar JavaScript y no aparece en el sitemap

#### Scenario: Consulta filtrada del catálogo
- **WHEN** se abre una URL con búsqueda, filtros u orden alternativo
- **THEN** los controles y resultados conservan su comportamiento y la variante indica `noindex, follow` con canonical normalizado propio

#### Scenario: Página posterior de resultados
- **WHEN** la URL de paginación existente muestra un conjunto diferente y válido sin búsqueda, filtros ni orden alternativo
- **THEN** su canonical identifica esa página y no se sustituye por el de la primera

### Requirement: Normalización de alias sin romper enlaces

Las URLs canónicas existentes SHALL mantenerse. Los alias de barras finales SHALL redirigir permanentemente al destino correspondiente en un máximo de un salto por normalización de ruta, conservando parámetros funcionales y sin bucles. La normalización SHALL NOT interceptar APIs, archivos o enlaces externos.

#### Scenario: Alias del catálogo
- **WHEN** se abre `/productos` con filtros o paginación válidos
- **THEN** la normalización conserva esos parámetros y el destino funciona como la URL equivalente actual

### Requirement: Semántica HTTP de existencia y errores

Una página o ficha confirmada inexistente SHALL responder HTTP 404 en petición directa y ofrecer la recuperación existente con noindex, sin canonical de otra página. Un fallo temporal de datos públicos imprescindibles SHALL responder HTTP 503 y conservar recuperación, sin declarar eliminado el producto ni provocar su baja en el inventario. Las respuestas de APIs y archivos SHALL conservar su status y content-type propios.

#### Scenario: Ficha inexistente
- **WHEN** la fuente de datos confirma que el slug solicitado no existe
- **THEN** el documento responde 404 en lugar de un HTML genérico con 200

#### Scenario: Fallo temporal de catálogo
- **WHEN** la lectura necesaria falla por indisponibilidad temporal
- **THEN** la página responde 503, presenta el estado recuperable vigente y no transforma el fallo en producto retirado

#### Scenario: API o recurso desconocido
- **WHEN** se solicita una ruta API o archivo que no existe
- **THEN** no se devuelve el HTML de la aplicación como sustituto con status 200

### Requirement: Sitemap completo y verificable de contenido indexable

El sitemap SHALL contener únicamente URLs públicas canónicas, indexables y verificadas. SHALL permitir descubrir las fichas publicadas existentes sin depender de pulsar «Cargar más» y sin añadir pantallas o controles. Su actualización SHALL detectar lecturas incompletas y excluir duplicados; SHALL NOT convertir fallos temporales en un inventario vacío ni publicar slugs inventados. Las fechas de modificación SHALL corresponder a evidencia real del contenido.

#### Scenario: Actualización correcta de inventario
- **WHEN** se obtiene un inventario público completo y válido
- **THEN** el sitemap contiene las fichas indexables verificadas y excluye presupuesto, legales, búsquedas y filtros

#### Scenario: Error a mitad de la enumeración
- **WHEN** falla una lectura antes de completar el inventario
- **THEN** no se publica la lista parcial como completa y se conserva el último inventario válido o se informa de fallo si todavía no existe

### Requirement: Rastreo compatible con renderizado y noindex

Las reglas de rastreo SHALL permitir obtener los documentos y recursos públicos necesarios para interpretar las páginas indexables y leer las directivas noindex previstas. SHALL NOT tratar robots como control de acceso ni ampliar el rastreo de operaciones de escritura o conversaciones.

#### Scenario: Recursos necesarios para catálogo
- **WHEN** un rastreador renderiza una ruta indexable usando los recursos públicos necesarios
- **THEN** las reglas no bloquean las lecturas imprescindibles, CSS, JavaScript o imágenes de esa representación

#### Scenario: Página excluida mediante noindex
- **WHEN** el rastreador visita presupuesto o una página legal
- **THEN** puede acceder a su documento para leer la directiva y no depende de una regla Disallow para excluirla del índice

### Requirement: Datos estructurados fieles al contenido

Los datos estructurados SHALL describir información existente, visible y confirmada, con identidad empresarial correcta. SHALL NOT inventar ofertas, precios, disponibilidad, reseñas agregadas, horarios u otras propiedades para satisfacer un validador. SHALL estar disponibles en la respuesta inicial de la ruta aplicable y conservar serialización segura.

#### Scenario: Datos opcionales sin evidencia
- **WHEN** no hay evidencia de un rango de precios, horario o valoración agregada
- **THEN** se omite ese dato y no se presenta como confirmado

### Requirement: Separación de datos públicos y personales

El HTML generado, los datos iniciales, sitemap y cachés compartidas SHALL contener únicamente información pública apropiada. El renderizado/build SHALL NOT enviar presupuestos o mensajes, incluir datos de contacto de solicitantes, conversaciones, selección privada o credenciales, ni alterar el almacenamiento de la aplicación. Las solicitudes entre visitantes SHALL estar aisladas.

#### Scenario: Dos visitantes con selecciones distintas
- **WHEN** ambos solicitan la misma ruta pública
- **THEN** el documento compartido no incluye la selección o datos personales del otro y cada navegador conserva únicamente su estado propio

### Requirement: Regresión funcional verificada

La candidata SHALL conservar los contratos y comportamientos de chat, catálogo, fichas, selección, presupuesto, contacto, temas, navegación y medios. La validación SHALL incluir los flujos vigentes de privacidad y preparación de WhatsApp y asegurar que la activación no duplica peticiones o eventos. Las pruebas con sustitutos SHALL identificarse como evidencia local, no como entrega externa real.

#### Scenario: Envío controlado de presupuesto
- **WHEN** se completa un formulario válido y se simula una confirmación o un error mediante transporte controlado
- **THEN** se conserva el payload vigente, ocurre una sola solicitud y borradores/selección siguen la semántica actual de éxito o error

#### Scenario: Conversación y preparación de WhatsApp
- **WHEN** se abre el chat, se recibe una respuesta controlada y se usa la preparación de WhatsApp existente
- **THEN** el panel, contexto, enlaces y cancelación mantienen su comportamiento sin producir envíos externos accidentales

### Requirement: Candidata independiente y revisión del propietario

La implementación SHALL poder compararse con una referencia identificada en una carpeta y puerto distintos, sin alterar archivos o datos ajenos. La entrega SHALL incluir pruebas de petición directa, navegación cliente, capturas/inspección real y resultados funcionales en escritorio/móvil y claro/oscuro. La integración SHALL esperar la aprobación visual expresa del propietario. La finalización técnica SHALL NOT implicar autorización de commit, push o despliegue.

#### Scenario: Entrega local para revisión
- **WHEN** la candidata está técnicamente preparada
- **THEN** se entregan URLs/comandos de comparación, referencia, diff, evidencias y pendientes, manteniendo la aprobación del propietario abierta hasta recibirla

### Requirement: Medición y evidencia publicada diferenciadas

Los resultados SHALL distinguir pruebas locales, datos de campo y evidencia de producción/Search Console. La falta de acceso o verificación SHALL permanecer pendiente sin inventar indexación, rendimiento o aceptación. Los ajustes de rendimiento SHALL conservar la presentación y medios aprobados.

#### Scenario: Search Console pendiente
- **WHEN** todavía no se ha acreditado la verificación o no hay datos de campo suficientes
- **THEN** se entrega la evidencia local disponible y se mantienen pendientes inspección/indexación o métricas reales, sin afirmar que la web ya está indexada o cumple Core Web Vitals de campo
