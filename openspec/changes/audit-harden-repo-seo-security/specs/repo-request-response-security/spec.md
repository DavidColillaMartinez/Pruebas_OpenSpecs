## ADDED Requirements

### Requirement: Validación independiente del navegador
Cada entrada API versionada SHALL validar método, formato, campos obligatorios/permitidos, tipos, estructuras y límites de tamaño antes de reenviar o producir efectos. Los límites de cuerpo SHALL considerar bytes y limitar lectura/acumulación, no solo comprobar longitud tras cargar un cuerpo ilimitado. Mensajes legítimos con acentos, símbolos y saltos SHALL seguir aceptándose dentro del contrato.

#### Scenario: POST directo omitiendo el formulario
- **WHEN** un cliente envía campos inesperados, tipos erróneos o un cuerpo excesivo directamente al endpoint
- **THEN** se rechaza con un error controlado y sin llamar al upstream

#### Scenario: Método o tipo de contenido incorrecto
- **WHEN** una entrada recibe un método o formato que no soporta
- **THEN** responde con status y contrato de error adecuados sin procesarlo como una petición válida

### Requirement: Renderizado y destinos seguros incluso al restaurar estado
Texto de usuarios, catálogo, IA y storage SHALL tratarse como datos no confiables. SHALL mostrarse como texto sin ejecución de HTML/JS; URLs de acciones e imágenes SHALL validarse de forma coherente al recibir, restaurar y usar. Payloads con protocolos peligrosos, rutas protocol-relative, separadores codificados o destinos fuera de política SHALL rechazarse o descartarse sin ejecutar ni navegar externamente.

#### Scenario: Respuesta de IA con HTML y acción maliciosa
- **WHEN** una respuesta incluye texto `<script>` y un destino `javascript:`
- **THEN** el texto no se ejecuta y la acción peligrosa no se vuelve interactiva

#### Scenario: Storage manipulado
- **WHEN** se recarga una pestaña con productos o acciones alterados en almacenamiento
- **THEN** la rehidratación valida los datos y conserva un estado utilizable sin renderizar destinos inseguros ni romper la página

### Requirement: Contratos de respuesta y caché privada
El servidor SHALL limitar y validar respuestas de upstream antes de servirlas como datos públicos del contrato, con content-type seguro y sin filtrar errores internos o secretos. Chat, presupuesto y datos de sesión SHALL NOT almacenarse en caché pública compartida. La caché pública del catálogo SHALL preservar una política explícita independiente.

#### Scenario: Upstream devuelve HTML o cuerpo excesivo
- **WHEN** el servicio externo responde con HTML, JSON fuera de contrato o tamaño no permitido
- **THEN** el endpoint produce un error controlado sin reenviar contenido ejecutable o información interna

### Requirement: Controles de abuso y sesiones evaluados en la frontera correcta
La auditoría SHALL verificar límites de frecuencia/concurrencia, timeouts, reintentos e identificadores en todos los entrypoints públicos; SHALL comprobar aislamiento de conversaciones donde exista código de autorización. SHALL NOT considerar una cabecera privada al upstream, un UUID o un contador de proceso serverless como prueba de autorización de usuario o rate limiting distribuido.

#### Scenario: Peticiones repetidas o ID de otra conversación
- **WHEN** pruebas locales envían peticiones simultáneas o alteran el identificador de conversación
- **THEN** se documenta el control efectivo y su prueba, o la frontera externa no verificada; ningún éxito de UI se presenta como autorización demostrada

### Requirement: Inyección revisada por tipo de sink
La revisión SHALL separar XSS, SQL/comandos e instrucciones a IA. Código versionado que ejecute consultas/comandos SHALL usar parámetros y operaciones autorizadas, nunca concatenación de datos no confiables como código. Prompts y salidas de IA SHALL NOT decidir permisos de aplicación por sí solos. Si esas operaciones están fuera del repo, la limitación SHALL quedar explícita.

#### Scenario: Entrada que pide ignorar instrucciones
- **WHEN** una prueba envía instrucciones adversarias a través del contrato local del chat
- **THEN** el navegador y proxy no ejecutan ni elevan permisos por ese texto y el informe no atribuye inmunidad al workflow externo no probado

### Requirement: Dependencias secretos y registros bajo revisión
La auditoría SHALL revisar dependencias aplicables, bundles públicos, configuraciones y registros para detectar exposición de secretos/datos privados, con reproducción redactada y correcciones mínimas compatibles. SHALL NOT publicar valores sensibles en informes ni aplicar actualizaciones mayores automáticas sin evaluar impacto.

#### Scenario: Hallazgo de dato sensible
- **WHEN** se identifica una credencial o dato personal en un artefacto o registro
- **THEN** se documenta su ubicación y clase sin reproducir el valor y se distingue la corrección local de cualquier rotación externa pendiente
