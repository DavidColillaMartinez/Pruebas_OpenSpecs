## ADDED Requirements

### Requirement: Conciliacion numerica exacta
Antes de cambiar reglas o datos, el informe SHALL registrar y reconciliar total importado, productos unicos, variantes, activos, publicables, vista publica, respuesta publica y `pagination.total`.

#### Scenario: Tabla waterfall
- **WHEN** se completa la auditoria read-only
- **THEN** las cifras forman una ecuacion matematica sin doble conteo desde importacion hasta total publico

#### Scenario: Variantes agrupadas
- **WHEN** variantes explican una diferencia aparente de volumen
- **THEN** el informe muestra cuantos productos las contienen y ejemplos de agrupacion sin contar variantes como productos

### Requirement: Exclusiones mutuamente explicadas
Cada producto no publico SHALL asignarse a un motivo principal verificable: inactivo, no publicable, imagen invalida, datos minimos, regla de proveedor/familia, duplicado, variante agrupada u otra condicion real.

#### Scenario: Motivo con condicion
- **WHEN** se informa un grupo excluido
- **THEN** se incluye cantidad, consulta/condicion responsable y ejemplos anonimizados o IDs no secretos

#### Scenario: Condiciones solapadas
- **WHEN** un registro cumple varios motivos
- **THEN** el waterfall define precedencia para contarlo una sola vez y puede listar motivos secundarios aparte

### Requirement: Limit y filtros no falsean el total
La auditoria SHALL separar items devueltos, limit efectivo, offset, total server-side y filtros por defecto.

#### Scenario: Limite de pagina
- **WHEN** el endpoint devuelve menos items que `pagination.total`
- **THEN** el informe no interpreta `items.length` como total importado o publicable

#### Scenario: Recorrido completo
- **WHEN** se contrastan paginas del endpoint
- **THEN** se comprueba continuidad, IDs/slugs unicos y total sin descargar productos en el bundle de frontend

### Requirement: Fuentes y snapshots contradictorios
El informe SHALL identificar fecha, version/commit y fuente de 467, 465, 439, 433, 192 y 190, y MUST NOT elegir una cifra sin evidencia.

#### Scenario: Cifra sin fuente actual
- **WHEN** 465 o 192 no puede vincularse a import/view/workflow/version
- **THEN** queda marcada como snapshot no confirmado y no se usa como criterio de migracion

#### Scenario: Diferencia por familia
- **WHEN** las categorias localizan una resta pero no demuestran su causa
- **THEN** el informe separa localizacion numerica de motivo de exclusion

### Requirement: Gate de cambios de datos
Neon, n8n, vistas y reglas de publicacion MUST NOT cambiar hasta que el informe cuadre, el contrato se documente, exista rollback y el propietario apruebe.

#### Scenario: Evidencia incompleta
- **WHEN** faltan SQL, workflow, logs o reglas responsables
- **THEN** las tareas backend permanecen bloqueadas y la UI no promete facets/totales no demostrados

#### Scenario: Cambio aprobado
- **WHEN** existe evidencia y aprobacion
- **THEN** se versiona workflow/vista, se implementa el minimo cambio y se conserva una restauracion exacta

### Requirement: Informe seguro y reproducible
El informe SHALL incluir consultas, vistas, workflows y condiciones suficientes para repetir la auditoria, y MUST NOT incluir credenciales, PII ni valores de variables server-side.

#### Scenario: Entrega del informe
- **WHEN** se presenta antes del push
- **THEN** el propietario puede verificar las ecuaciones, exclusiones y campos necesarios para facets/sort sin acceder a secretos
