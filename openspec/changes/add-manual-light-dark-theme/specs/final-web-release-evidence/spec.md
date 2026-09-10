## ADDED Requirements

### Requirement: Cadena de entrega verificable
La validación final SHALL consumir los informes de `audit-harden-repo-seo-security` y `refine-web-usability-accessibility`, comprobar sus gates y enlazar resultados por hallazgo. SHALL NOT afirmar seguridad del workflow de IA externo ni cerrar pendientes de privacidad por aprobar visualmente un tema.

#### Scenario: Hallazgo alto abierto en etapa anterior
- **WHEN** el informe anterior conserva un defecto alto de seguridad dentro del repositorio
- **THEN** la entrega final no se declara completa hasta verificar su resolución

### Requirement: Matriz completa en ambos temas
La revisión final SHALL ejecutar claro y oscuro en los 19 viewports definidos en `measured-responsive-quality`, cubriendo todas las rutas públicas y estados relevantes, con interacciones completas en móvil estrecho, landscape, tablet y desktop. SHALL registrar zoom, teclado, reduced motion, foco, contraste, consola y safe areas/teclado virtual según disponibilidad real.

#### Scenario: Oscuro no revisado visualmente
- **WHEN** los checks automáticos pasan pero faltan capturas o revisión de navegador de oscuro
- **THEN** la aceptación de oscuro continúa pendiente aunque el propietario haya aprobado el claro anterior

### Requirement: Regresiones de SEO y seguridad comprobadas
El cambio de tema SHALL conservar metadatos, canonical, status HTTP, JSON-LD y comportamiento GET/POST aceptados en la primera etapa. Las pruebas finales SHALL verificar ausencia de secretos públicos, ejecución de texto de IA y llamadas de red causadas por alternar tema, sin escaneo agresivo de producción.

#### Scenario: Cambio de tema en ficha indexable
- **WHEN** se alterna el tema en una ficha válida
- **THEN** su contenido indexable, canonical, datos estructurados y contrato funcional permanecen equivalentes

### Requirement: Informe final y publicación separada
La entrega SHALL producir `docs/audit/final-web-release-review.md` con base, cambios, resultados, cobertura no ejecutada y limitaciones. Tareas pendientes SHALL permanecer abiertas. Commit, push, despliegue y archivo de cambios SHALL requerir su instrucción correspondiente y no deducirse de la creación de artefactos o de un build exitoso.

#### Scenario: Entrega local validada
- **WHEN** se completan implementación y comprobaciones locales
- **THEN** se informa lo probado y lo pendiente sin afirmar despliegue ni aceptación del propietario no obtenidos
