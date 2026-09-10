## ADDED Requirements

### Requirement: Claro preservado y oscuro por roles
El tema claro SHALL conservar colores efectivos, composición, espacios, fuentes, media e interacciones previos salvo el control nuevo acordado. El oscuro SHALL usar roles semánticos de superficie/texto/borde/estado con soporte de opacidad en Tailwind y contraste WCAG 2.2 AA aplicable. SHALL NOT invertir globalmente fotos o tokens multirrol para aparentar adaptación.

#### Scenario: Regresar al claro
- **WHEN** el usuario alterna claro → oscuro → claro en una ruta
- **THEN** recupera el aspecto claro de referencia sin cambios de geometría, fuentes ni medios

### Requirement: Todas las superficies públicas adaptadas
Portada, catálogo, fichas, presupuesto, 404, chat, bienvenida, drawers y estados de carga/error/vacío SHALL mantener legibilidad y foco en oscuro. Blancos, transparencias y gradientes hardcodeados SHALL revisarse según su función. Vision, CompareSlider y media protegida SHALL permanecer sin modificaciones y conservar sus superficies de marca deliberadas cuando proceda.

#### Scenario: Chat y bienvenida en ambos fondos
- **WHEN** se usa oscuro sobre Inicio y después Quiénes somos
- **THEN** el asistente es legible, mantiene la corrección contextual del aviso y conserva el blur aprobado fuera del inicio sin alterar la fotografía

### Requirement: Cambio de tema no reinicia estado ni red
Cambiar tema SHALL conservar conversación, identificador, petición pendiente, borrador, productos/acciones y posición del lector del chat. SHALL conservar también ruta, foco, scroll, filtros, variantes, cantidades y formularios. SHALL NOT remontar providers, recargar la página o producir llamadas API por el cambio visual.

#### Scenario: Tema durante respuesta pendiente
- **WHEN** el usuario cambia a oscuro mientras espera respuesta del asistente
- **THEN** la misma petición termina una sola vez y el historial y borrador permanecen, sin reinicio o reenvío

#### Scenario: Presupuesto rellenado
- **WHEN** el usuario cambia tema después de elegir variantes y escribir datos del presupuesto
- **THEN** los campos y líneas conservan sus valores y no se crea una solicitud
