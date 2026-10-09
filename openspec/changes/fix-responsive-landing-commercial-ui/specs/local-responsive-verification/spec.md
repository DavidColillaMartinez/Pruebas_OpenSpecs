## Purpose

Producir evidencia textual reproducible de geometría e interacción responsive local y una entrega Git verificable, distinguiendo cobertura real y límites externos.

## ADDED Requirements

### Requirement: Cobertura de matriz local explícita
La verificación SHALL ejecutar la matriz completa enumerada en `design.md` en Chromium y Firefox locales, en claro/oscuro, para las siete secciones, catálogo, fichas representativas y presupuesto, incluyendo fronteras de breakpoints, umbral de altura y resize en ambos sentidos. Estados y drawers SHALL cubrir al menos tamaños críticos del layout. Cada caso SHALL registrar viewport efectivo, navegador/versión, DPR, tema, ruta/estado, origen de datos y PASA/FALLA/NO PROBADO.

#### Scenario: Navegador disponible
- **WHEN** se ejecuta una combinación de navegador, viewport, tema y vista
- **THEN** su resultado tiene evidencia específica y no se sustituye por cobertura histórica o lectura CSS

#### Scenario: Herramienta ausente
- **WHEN** un navegador no se puede ejecutar tras intentar instalación estándar
- **THEN** su cobertura se registra NO PROBADO con causa precisa y se continúa con las partes disponibles sin aprobar la matriz completa

### Requirement: Medición detecta solapes y recortes reales
La verificación SHALL esperar estabilidad de fuentes, navegación, animaciones y bloques relevantes, distinguir elementos visibles/recortados de capítulos fuera de pantalla y comprobar rectángulos, contención, cabecera, recortes y puntos de interacción. SHALL documentar excepciones intencionales y fallos con dos elementos, medidas y contexto; el caso fallido y la matriz afectada SHALL repetirse tras corregir.

#### Scenario: Identidad de Inicio y capas fijas
- **WHEN** se mide una vista estabilizada
- **THEN** se comprueban por separado logo, Tienda, títulos y tarjetas y se detectan interferencias flotantes mediante geometría y hit-testing, no solo overflow horizontal

#### Scenario: Texto largo y overlay intencional
- **WHEN** se revisan cajas limitadas, reseñas, tarjetas o comparación
- **THEN** se distingue scroll accesible de contenido oculto y se documentan overlays intencionales sin excluir sus controles de acceso

### Requirement: Pruebas locales no envían solicitudes externas
La verificación SHALL usar rutas/productos existentes o fixtures realistas, mocks identificados para backend ausente y estados de envío, e interceptar WhatsApp, presupuesto y mensajes. SHALL conservar contratos de producción y distinguir resultados reales de mocks sin afirmar recepción n8n/correo.

#### Scenario: Confirmación mock
- **WHEN** una prueba obtiene confirmación de presupuesto o respuesta de chat simulada
- **THEN** el informe la identifica como mock y ninguna solicitud real se envía a sistemas externos

### Requirement: Informe y entrega no confunden aceptación con medición
La entrega SHALL incluir base y SHA enviados, archivos/propósito, causas/correcciones, matriz, origen de datos, checks y avisos previos/nuevos, bloqueos y pendientes. SHALL ejecutar tests/typecheck/lint/build y corregir fallos propios antes de entrega, preservar trabajo ajeno y no hacer push con build roto. La aceptación visual externa SHALL quedar pendiente, así como Apple/Safari físico, n8n/correo, JSON y dominio/hosting.

#### Scenario: Entrega local verificada
- **WHEN** los cambios y checks locales disponibles están resueltos y se realiza commit/push autorizado
- **THEN** se publica SHA para revisión posterior sin promoción manual ni afirmación de aprobación visual definitiva

#### Scenario: Límites de emulación
- **WHEN** se reportan viewport móvil, DPR o pruebas de zoom
- **THEN** no se atribuye validación de iPhone, teclado virtual físico o zoom real a mera emulación, y se registran límites y casos no ejecutados
