## ADDED Requirements

### Requirement: Inventario reproducible del repositorio
La auditoría SHALL enumerar rutas de usuario, entradas API, métodos, validadores, almacenamiento, renderizado y dependencias, indicando commit base, entorno y comandos. Cada hallazgo SHALL incluir ID, severidad, evidencia, reproducción y estado de resolución, diferenciando hipótesis de defectos confirmados.

#### Scenario: Hallazgo de validación
- **WHEN** una entrada no válida atraviesa un validador en una prueba local
- **THEN** el informe identifica la entrada, el límite afectado, el comportamiento observado y una prueba de regresión para su corrección

### Requirement: Alcance limitado sin certificación externa
La auditoría SHALL limitar las modificaciones a archivos versionados del proyecto y sus pruebas. SHALL NOT modificar servicios, variables, secretos o workflows externos, ni certificar permisos reales de IA/BD usando una copia local de un workflow. Las pruebas adversarias SHALL usar destinos controlados sin efectos en producción.

#### Scenario: Operación de IA fuera del repositorio
- **WHEN** el proxy reenvía una petición a un servicio cuyo código vigente no está disponible
- **THEN** se documenta esa frontera como no verificada y no se afirma protección integral frente a inyección de prompts o ejecución de herramientas

### Requirement: Conciliación honesta de cambios anteriores
La revisión SHALL registrar como evidencia del propietario su declaración de comprobaciones visuales anteriores, sin inventar matriz, capturas o resultados técnicos. SHALL clasificar por separado tareas de implementación, privacidad, contratos e integración; SHALL NOT marcarlas completas ni archivar un cambio por inferencia visual.

#### Scenario: Pendiente de política de privacidad
- **WHEN** un cambio anterior incluye confirmar una URL legal además de revisar la apariencia
- **THEN** la confirmación visual se registra y la URL legal permanece pendiente hasta obtener evidencia específica

### Requirement: Gate de entrega de auditoría
La etapa SHALL entregar `docs/audit/repo-seo-security-review.md` y pruebas de las correcciones. Hallazgos críticos/altos locales abiertos SHALL impedir declararla completa; bloqueos externos SHALL permanecer explícitos y no convertirse en éxitos. La siguiente etapa SHALL consultar ese gate antes de empezar.

#### Scenario: Corrección no verificada
- **WHEN** se aplica un parche pero su reproducción o prueba posterior no se ha ejecutado
- **THEN** el hallazgo y la tarea continúan pendientes de verificación
