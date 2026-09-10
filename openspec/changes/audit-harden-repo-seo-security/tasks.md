## 1. Baseline y trazabilidad

- [x] 1.1 Leer AGENTS.md, registrar git status/commit/base y los cambios ajenos; ejecutar `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`, anotando cobertura y fallos previos.
- [x] 1.2 Crear `docs/audit/repo-seo-security-review.md` con inventario de rutas, entrypoints GET/POST, datos, storage, validadores y límites externos; preparar entorno local/test sin efectos reales.
- [x] 1.3 Conciliar tareas de `fix-responsive-chat-mobile`, `add-assistant-chat-ui` e `implement-product-detail-page` contra código/pruebas: registrar la confirmación visual del propietario y listar pendientes técnicos/legales/externos distintos, sin archivo automático.

## 2. SEO y routing

- [x] 2.1 Medir/documentar status, content-type, HTML inicial y DOM/metadatos renderizados de portada, catálogo, ficha válida/inexistente, presupuesto, ruta desconocida, API y asset desconocidos usando el comportamiento configurado en el repo.
- [x] 2.2 Definir la tabla de indexación/canonical/sitemap para filtros, búsqueda, orden y paginación; justificar descubrimiento de fichas sin duplicar páginas ni inventar datos.
- [x] 2.3 Corregir inconsistencias demostradas de title, description, canonical y metadatos sociales por ruta; probar navegación y restauración sin metadatos duplicados o arrastrados.
- [x] 2.4 Resolver el comportamiento 404 de páginas/productos inexistentes conservando errores temporales y rutas API/assets; si requiere cambiar arquitectura o alojamiento externo, detener esa corrección y documentar el bloqueo antes de cualquier catch-all.
- [x] 2.5 Revisar/corregir robots, sitemap y datos estructurados según la política y datos reales; añadir validaciones de URLs publicadas, campos veraces y estrategia de actualización del sitemap.
- [x] 2.6 Añadir pruebas de routing/metadatos/404 con requests directos y navegación cliente; registrar lo que no pueda validarse sin entorno externo o navegador, sin marcarlo completo.

## 3. Peticiones respuestas y datos no confiables

- [x] 3.1 Mapear las validaciones de catálogo y presupuesto en cliente, API y proxy; reproducir en local métodos, content-types, parámetros, campos y tipos inválidos saltando la UI.
- [x] 3.2 Revisar chat en todas sus entradas: longitudes/bytes, profundidad/cardinalidad, requestId/conversationId/context, límites antes de acumulación, timeout y concurrencia; registrar gaps por frontera.
- [x] 3.3 Corregir validación de entrada y límites locales demostrados necesarios, conservando contratos válidos y texto legítimo; probar rechazo sin llamada al upstream.
- [x] 3.4 Revisar/corregir validación y límites de respuesta, content-type y caché de chat/presupuesto frente a catálogo público; probar upstream HTML, JSON inválido, sobredimensionado y error con detalle interno.
- [x] 3.5 Revisar renderizado y URLs desde API/IA/storage; corregir discrepancias de allowlists y rehidratación y probar HTML literal, protocolos inseguros, URLs codificadas y almacenamiento manipulado.
- [x] 3.6 Buscar sinks SQL/comandos/HTML y puentes a herramientas IA en archivos versionados; verificar controles donde existan y documentar explícitamente operaciones externas no verificadas y límites frente a inyección de prompts.

## 4. Abuso privacidad y dependencias

- [x] 4.1 Evaluar rate limiting, reintentos, concurrencia, origen/CSRF según credenciales e aislamiento de sesión en los entrypoints; corregir controles locales faltantes o documentar bloqueo cuando exijan infraestructura externa, sin presentar memoria serverless como protección distribuida.
- [x] 4.2 Revisar bundles, logs, errores y storage para datos personales/secretos; corregir exposiciones locales sin copiar valores sensibles ni modificar credenciales externas.
- [x] 4.3 Auditar dependencias con lockfile y rutas de uso reales; corregir vulnerabilidades aplicables con cambios compatibles verificados, sin actualizaciones mayores automáticas.
- [x] 4.4 Comparar recogida/almacenamiento de formularios con información de privacidad versionada; registrar confirmaciones faltantes sin inventar consentimiento, hosting o URL legal.

## 5. Gate de salida hacia usabilidad

- [x] 5.1 Reproducir cada hallazgo corregido y ejecutar pruebas de regresión, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y `openspec validate audit-harden-repo-seo-security`; comprobar archivos efectivamente cubiertos.
- [x] 5.2 Completar informe con severidad, evidencia, resultados, pendientes y límites externos; mantener abiertas tareas con defectos críticos/altos locales o verificación pendiente y emitir el gate explícito para `refine-web-usability-accessibility`.
