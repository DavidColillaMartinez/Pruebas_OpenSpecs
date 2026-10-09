## Purpose

Coordinar navegación, controles flotantes, diálogos y edición para evitar interferencias, y asegurar que el contacto público usa los datos oficiales autorizados.

## ADDED Requirements

### Requirement: Controles externos no interfieren con diálogos ni formularios
Cabecera, navegación lateral, volver arriba, asistente/bienvenida y cesta móvil SHALL convivir sin tapar campos, etiquetas, acciones o puntos de interacción. Un diálogo activo SHALL tener cierre, opciones y acciones accesibles sin controles flotantes externos que lo obstruyan; el acceso al asistente SHALL conservarse según su funcionamiento aprobado fuera de estados incompatibles.

#### Scenario: Launcher junto al Nombre de Akord
- **WHEN** se desplaza `/productos/gme-mamparas-ducha-akord` a la zona Nombre a 1363×936 y a tamaños críticos con foco en campos
- **THEN** el launcher y la bienvenida no cubren el campo, su etiqueta ni acciones, y el hit-testing permite interacción

#### Scenario: Diálogos y sesiones de bienvenida
- **WHEN** se abren menú, filtros, cesta o galería en una sesión nueva y en otra con bienvenida descartada
- **THEN** sus cierres/opciones/acciones y foco son utilizables sin interferencia externa ni pérdida permanente de acceso al asistente

#### Scenario: Panel de chat abierto
- **WHEN** el panel muestra mensajes largos y se edita su compositor localmente
- **THEN** conversación, compositor y cierre siguen accesibles sin solapes perjudiciales ni envío real

### Requirement: Las teclas de edición pertenecen al control
La navegación narrativa SHALL respetar eventos ya manejados y no apropiarse de ↑, ↓, PageUp o PageDown en inputs, textarea, select, contenido editable, roles editables o diálogos. Fuera de ellos SHALL conservar la navegación narrativa aprobada.

#### Scenario: Contacto y compositor no cambian capítulo
- **WHEN** un control de Contacto, el compositor del asistente o un control en diálogo recibe una de las cuatro teclas
- **THEN** el capítulo no cambia por el listener narrativo y el control mantiene su comportamiento de teclado

#### Scenario: Evento manejado y navegación exterior
- **WHEN** un evento llega ya manejado o una tecla se pulsa fuera de controles tras completar la sección
- **THEN** el evento manejado se respeta y la tecla exterior conserva la navegación correspondiente

### Requirement: Contacto público oficial y presupuesto privado separados
El teléfono público SHALL ser `+34 692 91 21 80`, con valor nacional `692912180`, enlaces tel oficiales y WhatsApp `34692912180` coherentes en todas las referencias de ejecución y datos estructurados aplicables. El frontend SHALL conservar el borrador WhatsApp y envío manual y no publicar ni enrutar por inferencia el destinatario interno `arealrmqtienda@gmail.com`.

#### Scenario: Enlaces y borrador de Contacto
- **WHEN** se inspeccionan canales públicos y se genera un borrador WhatsApp con apertura interceptada
- **THEN** usan el número oficial, conservan el borrador y no realizan envío externo

#### Scenario: Referencias antiguas y correo interno
- **WHEN** se audita el código de ejecución tras actualizar el contacto
- **THEN** no quedan contactos con `629461032` o `34629461032`, y no se alteran referencias de producto o documentación histórica ni se introduce enrutamiento de correo en cliente
