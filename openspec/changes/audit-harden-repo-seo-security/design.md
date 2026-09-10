## Context

La aplicación React/Vite tiene portada narrativa desktop, portada móvil, catálogo, fichas, presupuesto, un fallback 404 y un asistente compartido. El repositorio incluye proxies Node, entradas API, configuración de alojamiento, validadores y pruebas. Esto permite auditar parte de la frontera de confianza, pero no verificar el workflow de IA, permisos de base de datos o controles externos vigentes.

Es la primera etapa de una cadena de tres cambios. Su salida será `docs/audit/repo-seo-security-review.md`, con inventario, política de indexación, hallazgos y pruebas. Las etapas siguientes consumirán ese informe, no asumirán que una tarea marcada implica revisión real.

## Goals / Non-Goals

**Goals:** SEO correcto por ruta, peticiones y respuestas controladas en servidor y cliente, evidencia reproducible, correcciones proporcionadas y contratos válidos preservados.

**Non-Goals:** prometer inmunidad a inyección de prompts, ejecutar ataques contra producción, cambiar servicios externos o hacer un rediseño. No sustituir el backend por mocks ni introducir SSR, autenticación, nuevas dependencias de infraestructura o un sistema de rate limiting distribuido sin analizar el contexto y acordar el diseño correspondiente.

## Decisions

### D1. Auditoría orientada a evidencia y dependencias

Registrar commit base, versiones, comandos y resultados; crear un inventario de `/`, `/productos`, `/productos/:slug`, `/presupuesto`, rutas desconocidas y todas las entradas API encontradas. Cada hallazgo tendrá ID, severidad, fuente/archivo, entrada, resultado esperado/observado, reproducción, solución mínima y prueba posterior. Las hipótesis no se etiquetan como vulnerabilidades confirmadas.

El gate de salida exige resolver hallazgos críticos/altos dentro del repositorio o registrar un bloqueo que impida declarar la etapa completa. Las dependencias de la cadena son gates documentales y de tareas, no una capacidad automática del CLI.

### D2. Cierre de antecedentes sin inventar pruebas

El propietario confirmó en la conversación sus comprobaciones visuales previas de `fix-responsive-chat-mobile` y dijo que las comprobaciones visuales de asistente y ficha también estaban hechas. Registrar esa declaración como evidencia del propietario, sin atribuirle capturas, dispositivos o medidas no entregados.

`implement-product-detail-page` aún enumera privacidad, hosting e integración real en 1.5, 8.10, 10.6, 10.7 y 11.5. `add-assistant-chat-ui` mantiene 36 casillas que incluyen implementación, contratos y pruebas, no solo revisión visual. Conciliar cada una contra el estado real antes de sugerir archivo. No cambiar las casillas ni archivar ahora por una declaración general de aprobación visual.

### D3. SEO mediante política por clase de URL

Comparar navegación cliente con peticiones HTTP directas, HTML sin JS, DOM renderizado y metadatos al navegar. Definir una tabla para portada, catálogo base, filtros/búsqueda/ordenación/paginación, fichas válidas/inexistentes, presupuesto y 404. Incluir status HTTP, canonical, index/noindex, sitemap y metadatos sociales. La política no presupone indexar cada filtro ni canonicalizar toda paginación a la primera página.

No confundir robots.txt con desindexación: una URL bloqueada al rastreo puede impedir leer `noindex`. Sitemap incluirá solo URLs canónicas indexables y verificadas; no inventar productos, precios, stock, ratings ni reseñas en JSON-LD.

### D4. 404 real antes que catch-all

El componente React de página no encontrada no prueba el estado HTTP de la respuesta. Verificar también productos inexistentes y rutas API/assets desconocidas. Preferir la solución mínima compatible con el alojamiento configurado, conservando respuestas API y archivos estáticos. Un rewrite general a HTML con 200 no equivale a un 404 correcto.

Si el estado HTTP requerido no puede resolverse con la arquitectura versionada actual, documentar prueba y decisión pendiente; no debilitar el criterio de aceptación ni implementar una migración de renderizado a ciegas. Las observaciones remotas de solo lectura, si se permiten posteriormente, son complementarias; no son requisito para auditar código local ni autorización para modificar Vercel.

### D5. Fronteras de confianza, no listas de palabras prohibidas

Mapear input → estado/storage → serialización → entrada API → proxy → servicio externo y respuesta → parser → render/enlaces. Revisar todas las validaciones del lado servidor, ya que el navegador se puede omitir. Probar tipos, campos inesperados/faltantes, tamaños en bytes, estructuras anidadas, codificaciones, content-type, métodos y parámetros. No usar la eliminación de `<script>` o palabras SQL como defensa principal.

Para HTML/JS, usar renderizado de texto y validadores de URL coherentes, incluyendo restauración desde storage y respuestas de IA. Para SQL/comandos, buscar sinks versionados y exigir parámetros/operaciones permitidas donde existan. Si el sink está fuera del repo, registrar la frontera sin afirmar que está protegido. Las respuestas del upstream se validan también en el límite servidor cuando sean reenviadas al navegador, con content-type seguro, límites de lectura y caché apropiados.

### D6. Abuso, sesiones y privacidad con limitaciones explícitas

Revisar límites de requests/responses antes de acumular cuerpos, concurrencia, reintentos, timeout, validación de identificadores, ownership si existe y prevención de caché compartida en datos privados. Un ID opaco no demuestra autorización. Una cabecera de autenticación al upstream no autentica al usuario del endpoint público.

Evaluar rate limiting existente en todos los entrypoints; un contador en memoria serverless no es control distribuido. Si la protección exige infraestructura externa no autorizada, documentar el límite y bloquear la afirmación correspondiente. Revisar CSRF/origen según credenciales/efectos reales: CORS no es autenticación ni defensa contra clientes directos.

Auditar dependencias en contexto de uso y compatibilidad, sin `audit fix --force`. Revisar artefactos de build y registros sin copiar secretos a informes. No inventar políticas de retención o URLs legales.

## Risks / Trade-offs

- [Cambios de routing causan soft 404 o rompen API] → Matriz de status/content-type y enlaces directos antes/después; no catch-all especulativo.
- [Validación demasiado restrictiva rechaza mensajes normales] → Casos válidos con acentos, saltos, símbolos y nombres largos junto a pruebas adversarias.
- [Mocks aparentan seguridad del sistema externo] → Marcar origen de evidencia y distinguir contrato local de comportamiento externo no verificado.
- [Auditoría infinita] → Lista finita de rutas/sinks, priorización y resultados por ID; no actualizar dependencias o refactorizar sin necesidad.
- [Pruebas de seguridad generan efectos reales] → Requests controladas en test/local con upstream sustituido y sin escrituras a servicios de terceros.

## Migration Plan

Capturar baseline y scope → inventario SEO/seguridad → corregir por hallazgo con pruebas → gates de salida → informe entregado a la segunda etapa. Toda edición visual sigue el límite de cinco archivos de AGENTS.md. No desplegar ni crear commits automáticamente. Para revertir, identificar un target exacto y usar parches/reverts enfocados con backup, nunca limpieza destructiva.

## Open Questions

- Política de URLs filtradas/paginadas y generación sostenible de sitemap de productos: resolver tras inventariar datos y renderizado disponibles en el repo.
- Estado HTTP de 404/productos retirados en el alojamiento real: no está certificado por la lectura de configuración.
- Controles y permisos vigentes de la IA/BD externos: fuera del alcance actual. Copias versionadas no demuestran lo desplegado.
