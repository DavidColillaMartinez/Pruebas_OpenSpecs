## Context

Ver `proposal.md` para motivación y alcance. Contexto confirmado por el propietario: se busca captar reformas en toda la Comunidad de Madrid; el catálogo es secundario y no hay venta online. No se autorizan páginas nuevas ni ampliaciones del contenido aprobado. La sugerencia anterior de páginas por servicio quedó descartada; las animaciones móviles se tratarían en otro cambio.

Base observada al planificar: `b7dc514`. La implementación debe volver a fijar el SHA vigente antes de crear la candidata. Trabajo ajeno pendiente que debe conservarse: `docs/audit/owner-responsive-stability-review-2026-10-13.md`, `openspec/changes/fix-responsive-landing-commercial-ui/tasks.md`, `.agents/skills/.agents/` y `.agents/skills/skills-lock.json`.

La app usa Vite y React con `createRoot` en `src/main.jsx`, React Router y rutas lazy. `index.html` tiene metadatos de portada y un root vacío. `routeMeta.ts` modifica metadatos tras montar; las páginas legales añaden metadatos sociales propios. Los rewrites de páginas sirven el mismo HTML. `BusinessJsonLd` se monta desde la portada. `robots.txt` bloquea `/api/` y `/presupuesto/`; el sitemap contiene `/` y `/productos/`.

La exploración de solo lectura encontró el mismo HTML inicial de portada en `/productos` y HTTP 200 para una ficha inventada. Son observaciones puntuales, no una auditoría de indexación de Google. `audit-harden-repo-seo-security` ya documenta estas limitaciones; sus casillas completas no demuestran que estén resueltas.

Antecedentes que deben releerse al implementar: cambios de privacidad, `remove-quote-storage` e `integrate-approved-media-welcome-and-selection-expiry`. El estado más reciente incluye medios aprobados, selección con caducidad/recordatorio y panel de privacidad/preparación de WhatsApp del chat; no usar fixtures antiguos como si fueran su contrato vigente.

El propietario declara que existe Perfil de Empresa y que Search Console espera verificación DNS. Accesos, fecha efectiva de verificación y datos de rendimiento siguen sin acreditar.

Usar la skill instalada `seo` durante la implementación, contrastando sus orientaciones con las guías oficiales y la evidencia del sitio, sin tomar porcentajes orientativos como factores de ranking medidos. Referencias de la exploración: [SEO en JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=es), [paginación y carga incremental](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading?hl=es) y [posicionamiento local](https://support.google.com/business/answer/7091?hl=es).

## Addendum 2026-10-17: decisiones del propietario y correcciones

Estas decisiones prevalecen sobre el texto original de este documento cuando haya contradicción.

- **Referencia (D1):** `55062aa`, último commit desplegado en producción (verificado con deployments de GitHub y con los bundles servidos). Sustituye a `b7dc514`.
- **Portada (D2):** un único DOM compartido PC/móvil con CSS responsive, en lugar de los árboles `sections/desktop` y `sections/mobile` montados según `isDesktop`. PC sin cambio visual. Móvil reproduce el diseño de PC adaptado (tamaños, columnas, controles táctiles) y conserva la imagen vertical móvil y los medios existentes. Evitar contenido y encabezados duplicados. HTML inicial con contenido real e hidratación React.
- **Adaptación móvil confirmada:** estructura y contenido compartidos, mismo orden e identidad; adaptación CSS legible y táctil con imagen vertical conservada. Puede usar scroll natural: no es obligatorio reproducir el bloqueo de rueda del PC. El tratamiento de textos quedó aprobado en la decisión siguiente.
- **Aprobación de implementación posterior:** Inicio adopta contenido/orden PC (logo, Tienda, nombre, subtítulo, tarjetas en columna móvil), sustituyendo párrafo y CTA exclusivos; mantener acceso funcional a asesoría. Resto de secciones: estructura común con PC de referencia, conservando información móvil útil y funciones sin duplicar contenido. Reformas conserva su explicación y acceso de asesoría en adaptación; profesionales independientes y contratación separada permanecen. Ajustes responsive ordinarios autorizados. HTML inicial de todas las rutas, presupuesto vacío y recuperación privada exclusivamente en navegador; commit/push/despliegue pendientes.
- **Canonicals (D3/D4):** `/productos` y `/presupuesto`, sin barra final. `/productos/` y `/presupuesto/` responden 404 en producción (H1, H8) y se redirigen con 308 a la versión sin barra. Sustituye la regla de D3 que conservaba `/productos/`.
- **Sitemap (D5):** función `api/sitemap.js` que enumera el listado público con `offset`/`limit` (límite efectivo 60) hasta `has_more=false`, deduplica, excluye lo no publicable y los slugs inválidos, y responde 503 con `Retry-After` ante cualquier inconsistencia. Nunca publica un sitemap vacío o parcial. Incluye `/`, `/productos` y `/productos/<slug>`. Sustituye a `public/sitemap.xml`.
- **Fichas inexistentes y fallos (D4):** 404 de documento sin canonical y con noindex; 503 recuperable sin canonical ni noindex en `/productos/:slug`. Implementado y verificado localmente con el renderer compilado y fixtures; comprobación Vercel pendiente.
- **Corrección de H2:** la paginación funciona. El parámetro es `offset`; el proxy descarta `page`. El hallazgo original se debía a una prueba con `page=2`. Inventario público medido el 2026-10-17: 151 fichas únicas, todas `publishable|approved`, en 3 páginas.
- **Datos estructurados (D6):** se elimina `priceRange`; `name` = marca `AREA LRMQ`; `legalName` = `ÁREA LRMQ DESING S.L` sin normalizar a DESIGN; dirección alineada con el aviso legal; `sameAs` con Instagram y el perfil de Google. Pendiente: la dirección visible (`C. de Aquitania, 69, San Blas-Canillejas`) no coincide con la legal (`C/ Aquitania, 69, local 1`). Además, el JSON-LD se monta en cliente: no aparece en el HTML inicial hasta que exista el renderizado previo.

## Goals / Non-Goals

**Goals:**

- HTML inicial útil y específico de cada ruta, coherente con su DOM tras activar JavaScript.
- Una misma experiencia y contenido para visitantes y rastreadores, con paridad visual y funcional demostrada.
- Política reproducible de status, metadatos, indexación y descubrimiento de las URLs existentes.
- Implementación y comparación en una candidata aislada, con revisión explícita del propietario antes de integrar.

**Non-Goals:**

- Cambiar textos visibles, jerarquía comercial, diseño, navegación, medios o animaciones fuera de la adaptación móvil expresamente aprobada en D2. Tampoco añadir texto oculto para SEO ni páginas de aterrizaje nuevas.
- Cambiar contratos de API, negocio, selección, privacidad o mensajería; introducir ecommerce, campañas, analítica o nuevas garantías legales.
- Cambiar proveedor/framework por defecto, editar servicios externos o dar por autorizados publicación, accesos a cuentas o envíos reales.
- Prometer posiciones, tráfico o indexación por superar pruebas técnicas.

## Decisions

### D1. Candidata aislada y referencia reproducible

Crear durante implementación una rama y worktree independientes desde un SHA registrado. Verificar primero directorios padre, worktrees y puertos disponibles; acordar ubicaciones si quedan fuera de las raíces permitidas. Referencia y candidata tendrán servidores y dependencias propios. Otro puerto con la misma carpeta no ofrece aislamiento de archivos y se descarta.

Verificar que los artefactos vigentes de este cambio estén disponibles en la candidata. Si al crear el worktree siguen sin commit, trasladar explícitamente solo este directorio de planificación y comprobar su contenido; no copiar todo el árbol sucio ni crear un commit implícito para transportarlo.

Registrar puertos, comandos y procesos propios en un informe de revisión de este cambio. No reutilizar ni detener procesos ajenos. Ambos orígenes deben usar fixtures públicos equivalentes y la versión real del esquema de selección. El almacenamiento es distinto por puerto: no interpretar esa diferencia como pérdida de datos ni copiar almacenamiento real de clientes. No compartir `node_modules`, `.env` o datos personales de forma automática.

La referencia conserva los cambios confirmados al fijar el SHA. Los cambios ajenos sin commit se preservan en su carpeta y se identifican; si alguno afecta a la referencia aprobada, coordinarlo antes de elegir la base. Si avanza la base durante la implementación, registrar y volver a verificar los escenarios afectados antes de integrar.

### D2. Renderizado híbrido sobre la aplicación actual

Adoptar HTML previo con React reutilizando vistas y fuentes actuales: generación estática para páginas de contenido estable y renderizado por petición para catálogo/fichas cuyos datos y existencia deben resolverse en ese momento. El presupuesto usa un documento inicial genérico sin selección personal. No se crean rutas comerciales nuevas. Los adaptadores internos de servido/build no son pantallas nuevas ni sustituyen las API existentes.

Comparación de opciones:

| Opción | Decisión |
|---|---|
| Mantener solo metadatos modificados por efectos | Insuficiente: deja el contenido inicial y canonical en conflicto. |
| Capturar un navegador y publicar su DOM | No usar como arquitectura: puede fijar un viewport, estados temporales, bienvenida o selección, y no resuelve bien existencia de fichas y errores temporales. |
| Generar todas las fichas en build | No como única vía: depende de enumeración y actualización completa del inventario y puede confundir bajas con fallos del origen. |
| HTML estático para páginas estables + servidor para datos públicos variables | Elegida: limita trabajo en servidor y permite status y datos actuales por ruta. |
| Migración completa de framework o HTML exclusivo para bots | Descartada para este alcance; no es necesaria para el contrato buscado. |

Separar resolución de ruta/datos/metadatos de la activación cliente. El servidor carga solo información pública mediante el contrato de lectura actual, con origen de confianza fijo, validación, límites y timeout; no construir destinos de fetch a partir de un Host arbitrario ni reenviar cookies/contactos del visitante. Las credenciales existentes permanecen en servidor. No se ejecutan POST de chat/presupuesto durante renderizado o build.

El navegador reutiliza los datos públicos iniciales para evitar una sustitución inmediata o una doble carga que cambie el contenido. La revalidación mantiene los contratos y estados recuperables existentes. Serializar datos con escape seguro, sin secretos, historiales ni datos de formulario. No debilitar CSP mediante `unsafe-inline` para scripts; usar un mecanismo compatible con la política vigente.

Antes de extender la arquitectura, construir un corte vertical de portada y una ficha con fixtures. Verificar montaje único de proveedores, consistencia de hidratación y ambos viewports. El servidor no conoce las dimensiones del navegador: la solución responsive debe mantener un primer estado determinista y el mismo aspecto desde el primer pintado, sin un flash de móvil en desktop, árboles visibles duplicados o reinicio de la navegación. La selección exacta de adaptadores es un detalle interno sujeto a estas pruebas; si el corte no cumple, se bloquea la expansión y se revisa el diseño, no se reduce la exigencia de paridad.

La implementación puede afectar a más de cinco archivos por conectar build, servidor, arranque y metadatos. Antes de extender el corte, presentar el inventario exacto y explicar su necesidad; obtener confirmación de alcance según `AGENTS.md` cuando corresponda. Esta planificación no es autorización para una refactorización general.

### D3. Metadatos con una única definición por ruta

Definir descriptores compartidos de título, descripción, canonical, robots y OG/Twitter que consuman tanto el HTML inicial como la navegación cliente. Retirar únicamente las escrituras duplicadas/sustituidas por esta responsabilidad, conservando limpieza y restauración al navegar.

Los títulos/descripciones pueden resumir el contenido aprobado para buscador/pestaña, sin añadir servicios, localidades específicas, plazos, precios, garantías ni promesas no acreditadas. No cambiar H1/H2 o textos visibles para insertar palabras clave. Ninguna ruta debe comenzar con canonical de portada y corregirlo después a otro destino.

Usar `https://arealrmq.es` como origen canónico, independiente de los puertos locales y de parámetros de seguimiento. Mantener identificadores y rutas de la app. Conservar los canonicals ya publicados: `/`, `/productos/`, `/productos/<slug>` y las rutas de presupuesto/legales sin barra. Resolver sus alias mediante una redirección permanente como máximo, conservando parámetros funcionales, sin bucles ni interceptar archivos/API.

### D4. Política de indexación y respuestas

| Clase | Status esperado | Robots | Canonical | Sitemap |
|---|---|---|---|---|
| Inicio | 200 | index, follow | `/` | Sí |
| Catálogo base | 200 | index, follow | `/productos/` | Sí |
| Paginación existente sin filtros/búsqueda/orden alternativo | 200 si válida | index, follow | Propia, con página normalizada; página 1 equivale a base | No inicialmente |
| Búsqueda, filtros y orden alternativo | 200 si válida | noindex, follow | Propia normalizada, sin seguimiento | No |
| Ficha pública válida | 200 | index, follow | Propia con slug vigente | Sí, tras verificación |
| Presupuesto | 200 | noindex, follow | Propia | No |
| Legales | 200 | noindex, follow | Propia | No |
| Ficha confirmada inexistente o página desconocida | 404 | noindex | Omitida | No |
| Fallo temporal al obtener contenido público imprescindible | 503 | No imponer retirada permanente del índice | No apuntar a otra página | No alterar inventario por el fallo |

Los fallos definitivos de parámetros/páginas fuera de rango deben identificarse según el contrato real, sin inventar semántica ni confundirlos con catálogos vacíos válidos. La paginación actual puede acumular resultados: conservarla y probar su contenido real; no canonicalizar automáticamente a la primera página cuando cambie el conjunto mostrado. No añadir controles o navegación paginada visibles.

Un 404 de la API no sustituye al 404 del documento HTML. Para errores de página reutilizar la recuperación existente; un fallo temporal mantiene el estado recuperable y botón actual. El servido local de prueba debe ejercitar el artefacto de producción y sus status, no tomar el fallback permisivo de Vite dev como evidencia del alojamiento.

### D5. Descubrimiento sin ampliar la interfaz

Mantener enlaces actuales y botón de carga tal como están. Resolver el descubrimiento completo de fichas mediante un sitemap generado desde un inventario público verificado; no requiere crear páginas nuevas. Preferir lectura controlada de todas las páginas del catálogo publicado, con orden estable y deduplicación; si hay un listado público ya disponible, reutilizarlo sin alterar su contrato.

La generación debe detectar paginación incompleta, duplicados de cursor, inventario cambiante y fallos. Un fallo no publica un sitemap vacío ni elimina fichas del índice: conservar el último inventario válido con su fecha, o fallar de forma explícita si todavía no existe. El primer sitemap completo no se acepta con slugs de fixture o un listado manual presentado como exhaustivo. Usar `lastmod` solo si existe una fecha real del contenido; el sitemap ayuda a descubrir, no garantiza indexación.

Revisar robots con la matriz de rutas: presupuesto y legales deben poder ser rastreados para leer su `noindex`. Auditar qué lecturas públicas bajo `/api/` necesita el renderizador del buscador; ajustar solo lo necesario si sigue habiendo dependencias cliente. Esto no autoriza rastrear endpoints de escritura/chat ni convierte robots en un control de acceso. Recursos CSS/JS/imágenes necesarios deben seguir accesibles.

### D6. Datos estructurados y rendimiento veraces

Revisar el JSON-LD actual del negocio y emitirlo en el HTML de la ruta correspondiente. Usar identidad/contacto/actividad confirmados y coherentes con el contenido visible y legal. No convertir la razón social DESING en DESIGN por normalización. Omitir datos no acreditados como un rango de precios supuesto; no inventar horarios, coordenadas, valoraciones agregadas, stock u ofertas para validar un esquema. Datos de producto o migas solo cuando existan en la página y resulten aplicables; no prometer resultados enriquecidos de ecommerce.

Medir LCP, CLS e INP donde haya datos de campo; si no, registrar ausencia de muestra y usar mediciones de laboratorio de carga, estabilidad e interacciones sin llamarlas INP real. Investigar cambios regresivos de la candidata. Objetivos de referencia de campo: LCP ≤2,5 s, CLS ≤0,1 e INP ≤200 ms en percentil 75. Estos valores no se declaran alcanzados por compilar ni por una sola ejecución.

No sustituir/re-encodear/cropear medios del cliente ni introducir cambios visuales para subir una puntuación. Las optimizaciones compatibles con el contrato se limitan a entrega, prioridades, carga y eliminación de trabajo duplicado comprobado.

### D7. Matriz funcional y visual como gate de integración

Capturar referencia y candidata con datos, tema, viewport, reloj y estados equivalentes. Comparar primer pintado, hidratación asentada y estados tras interacción. En animaciones usar puntos equivalentes; no exigir igualdad entre fotogramas de tiempos distintos ni ocultar una regresión estabilizando toda la prueba con reduced motion.

Matriz mínima: 390×844, 1366×768, 1440×900 y una comprobación a ambos lados de los umbrales ancho/alto vigentes. Claro/oscuro; movimiento normal y reducido en escenarios relevantes. Revisar Inicio y todos los capítulos, Contacto, catálogo, familias de fichas con selectores distintos, presupuesto vacío/con selección y legales. Confirmar ratios de imágenes, logo/fondo aprobado, tipografía, espaciado, scroll, foco, overlays y ausencia de contenido duplicado/flashes.

Pruebas funcionales mínimas:

- Chat: bienvenida, apertura/cierre, panel de privacidad, reinicio, conversación con respuesta controlada, contexto, recomendaciones/enlaces y preparación/cancelación de WhatsApp. Sin duplicar listeners o envíos tras hidratación.
- Catálogo: búsqueda, filtros, orden, cargar más, enlaces, ficha, selectores/galería y regreso con estado conservado.
- Presupuesto: añadir/modificar/eliminar, cantidades, recordatorio/caducidad vigentes, recarga y sincronización de pestañas; sin montar el servidor con selección ajena.
- Formularios: borradores, lectura de privacidad, validación, errores y confirmación controlada; un intento de envío equivale a una única solicitud con el mismo contrato.
- Contacto: texto y destino de WhatsApp, teléfono, mapa, redes y enlaces legales. Interceptar apertura/envío para evitar efectos externos.
- Landing: navegación, Atrás/Adelante, hashes, resize, tema, vídeos, swipe/teclado de Visión y medios.

Los mocks prueban contrato local y regresión; no acreditan entrega de correo, funcionamiento del proveedor IA ni recepción de WhatsApp real. Si se requiere una comprobación real se acuerda por separado. El propietario debe revisar las URLs locales y aprobar expresamente la candidata; tests y capturas no inventan esa aprobación.

## Risks / Trade-offs

- [Hidratación dependiente del viewport rompe el primer pintado o estado] → Corte vertical obligatorio, prueba sin interacción y con movimiento normal; bloquear expansión si falla.
- [Renderizado por petición añade latencia y dependencia de lecturas públicas] → Límite/timeout, reutilización de datos iniciales y caché solo pública con política documentada; nunca cachear selección, formulario o conversación.
- [Sitemap incompleto por fallo o cambio del catálogo] → Comprobación de completitud y conservación del último inventario válido; no convertir un error en bajas.
- [Canonical/robots iniciales contradicen navegación o bloquean el renderizador] → Una definición por ruta, matriz de HTML/DOM/cabeceras y comprobación posterior de Search Console.
- [Prueba local no reproduce rewrites/status de producción] → Servir el build con adaptador equivalente y registrar lo pendiente de validar tras publicación autorizada.
- [La candidata y referencia divergen por trabajo concurrente] → SHA fijado y coordinación antes de actualizar base; conservar cambios ajenos.
- [Optimización cambia diseño o añade contenido] → Inventario de contenido/medios y revisión visual; detener el cambio incompatible y pedir decisión, sin ampliar el alcance automáticamente.

## Migration Plan

1. Releer instrucciones/antecedentes, fijar referencia, registrar cambios ajenos y preparar worktree/puertos.
2. Capturar baseline visual/funcional y pruebas HTTP; realizar el corte de renderizado y documentar lista exacta de archivos/dependencias antes de expandir.
3. Aplicar renderizado a las rutas existentes, política SEO, sitemap y datos estructurados; validar artefacto servido y comportamiento cliente.
4. Entregar informe, diff, comandos y URLs de comparación. Mantener pendientes las comprobaciones del propietario y de servicios externos hasta evidencia.
5. Integrar únicamente tras aprobación expresa. Commit/push/publicación requieren instrucción propia; la orden histórica de push del cambio legal no se reutiliza como autorización de este cambio.
6. Tras publicación autorizada, comprobar rutas/status/metadatos/robots/sitemap reales y, con Search Console verificada, inspeccionar URLs, enviar sitemap y revisar canonical/renderizado/indexación. La verificación DNS, el envío del sitemap y la indexación son hitos distintos. El Perfil de Empresa se contrasta mediante datos facilitados o acceso autorizado; no se edita automáticamente.

Para descartar la candidata basta con seguir usando la referencia; no ejecutar limpieza destructiva. Si se pide revertir una integración, confirmar commit objetivo, crear backup y preparar revert/parches focalizados. No borrar documentos técnicos, SQL, backups o historial ni archivar cambios anteriores como efecto de esta implementación.

## Open Questions

- Qué puertos y carpeta permitida están disponibles al iniciar: se resuelve durante preparación sin cambiar el aislamiento previsto.
- Cuándo queda verificada Search Console y quién facilita evidencia/acceso de inspección: permanece como seguimiento externo, no bloquea la candidata local.
- Qué campos opcionales del Perfil de Empresa tienen evidencia vigente: se incluyen solo los confirmados; su ausencia no autoriza inventarlos ni cambiar textos visibles.
