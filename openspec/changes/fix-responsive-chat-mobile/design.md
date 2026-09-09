## Context

Area LRMQ ya tiene una landing narrativa con variantes desktop/mobile, un header y `MobileDrawer`, un catálogo con filtros y barra de selecciones, fichas de producto, presupuesto y un chatbot compartido. El chat usa un panel fixed, un hilo con scroll propio y un `textarea`; el ajuste reciente de auto-scroll y compositor necesita validación real en pantallas pequeñas y grandes.

La fuente visual es el light-mode actual: `porcelain`, `ink`, `graphite`, `clay`, `mist`, Marcellus y Manrope. El diseño debe conservar esa identidad sobria y táctil, no introducir un layout genérico de dashboard ni reescribir las superficies existentes.

El trabajo empieza con una línea base reproducible: `git status`, rama y backup local, lectura de los componentes indicados, tests/lint/typecheck/build y una sesión visual contra `https://pruebas-open-specs.vercel.app/` o el servidor local equivalente. La matriz incluye móvil portrait, landscape, tablet, desktop y ultra-wide. Si no existe automatización de navegador disponible, se documentará la limitación y se usará emulación de viewport.

Las restricciones son frontend-only: no se modifican n8n, Neon, VPS, Vercel, variables de entorno, secretos, contratos externos, consultas del catálogo ni media protegida. El chatbot debe seguir utilizando `/api/chat/messages` sin cambiar su transporte.

## Goals / Non-Goals

**Goals:**

- Eliminar overflow horizontal accidental y recortes en portada, catálogo, fichas, presupuesto y chatbot.
- Hacer que overlays, drawers, elementos fixed/sticky, safe areas y teclado virtual convivan sin tapar contenido ni controles.
- Conseguir un chat usable a partir de 320 px: header legible, hilo con seguimiento inteligente, tarjetas completas, foco correcto y compositor multilínea tipo mensajería.
- Mantener la lectura manual del historial: el hilo solo sigue el final cuando el usuario está cerca del final o ha enviado un mensaje propio.
- Unificar el renderizado del chatbot en componentes vivos y conservar parser, store, persistencia, acciones y validaciones actuales.
- Corregir controles con `min-w-0`, separación, wrapping, `clamp`, límites de altura y proporciones de imagen donde las pruebas demuestren el problema.
- Validar teclado, foco visible, Escape, `aria-modal`, scroll lock, touch targets de al menos 44 px y ausencia de errores de consola.
- Revisar que title, description, canonical, JSON-LD y robots de portada y catálogo se mantienen sin duplicar contenido del chatbot.
- Entregar matriz de resoluciones, pruebas automatizadas y lista separada de problemas externos que no puedan resolverse en frontend.

**Non-Goals:**

- Cambiar la arquitectura de React, incorporar un framework de estilos nuevo o hacer una refactorización masiva.
- Modificar n8n, Neon, Vercel, `N8N_CHAT_UPSTREAM_URL`, rate limiting, timeouts externos, credenciales, webhooks o contratos API.
- Rediseñar la landing, cambiar copy, precios, media, Vision, `CompareSlider`, consultas de catálogo o lógica de presupuesto.
- Inventar respuestas, fixtures, URLs de imagen o datos de backend para ocultar fallos externos.
- Añadir voz, streaming, login, adjuntos, compra u otras capacidades del asistente.
- Convertir carruseles internos intencionados en elementos de scroll vertical o eliminar una interacción existente para ocultar overflow.

## Decisions

### D1 — Auditoría antes de tocar código

Se ejecutarán las comprobaciones base y se inspeccionarán primero las áreas indicadas. Cada cambio se vinculará a un problema observado, a una regla de accesibilidad o a un test de regresión. El backup `backup/pre-responsive-chat-mobile` se conserva como punto de comparación y rollback local.

Alternativa descartada: aplicar un reset global o cambiar breakpoints a ciegas. Podría corregir un viewport y romper la composición narrativa o los componentes protegidos.

### D2 — Mobile-first, con límites fluidos

Se preferirán reglas mobile-first y utilidades existentes: `min-w-0`, `max-w-full`, `clamp()`, `min()`, `max()`, `dvh`/`svh`, `env(safe-area-inset-bottom)` y contenedores con `overflow-x: clip` solo cuando el overflow sea decorativo o esté probado. Los carruseles conservarán su scroll interno explícito.

Alternativa descartada: añadir un breakpoint por cada resolución. La matriz sirve para descubrir puntos de fallo, no para multiplicar media queries.

### D3 — Seguimiento del chat mediante proximidad al final

El hilo tendrá una referencia de scroll y, preferentemente, un sentinel final. Un ref registrará si la distancia al final está dentro de un umbral pequeño; un mensaje nuevo o el estado de espera hará scroll suave al sentinel solo cuando ese ref indique que el usuario sigue al final. Al abrir, al enviar un mensaje propio y al completar una respuesta se garantizará que la zona relevante quede visible. `prefers-reduced-motion` usará desplazamiento instantáneo.

Si llegan varias tarjetas, el sentinel se coloca después de todo el contenido, no dentro de la primera tarjeta. Las imágenes tendrán dimensiones/ratio estable para evitar saltos de layout.

Alternativa descartada: `scrollIntoView()` incondicional en cada render. Es sencillo pero secuestra la lectura del historial y puede pelear con el teclado virtual.

### D4 — Compositor integrado y autoajustable

El `textarea` se medirá con `scrollHeight` tras cada edición, restaurando temporalmente la altura a `auto` y limitando el resultado a unas 5–6 líneas. Hasta el límite tendrá `overflow-y: hidden`; después podrá desplazarse internamente con scrollbar visual oculta, sin cortar texto. `Enter` envía y `Shift+Enter` conserva una nueva línea.

El formulario será una cápsula única con borde, fondo y padding del sistema actual; el botón circular de envío quedará dentro, con área táctil mínima de 44 px. El textarea conservará nombre accesible, foco visible y funcionamiento con teclado virtual.

Alternativa descartada: altura fija grande o esconder overflow del panel completo. La primera roba espacio al hilo; la segunda oculta mensajes y errores.

### D5 — Overlays y elementos fixed con una sola coordinación

Se documentará una escala de capas y se reutilizarán los z-index existentes. El chatbot, `MobileDrawer`, drawer de filtros, barra de selecciones y lightbox tendrán scroll propio y safe-area. El body scroll lock guardará y restaurará el estado previo, sin borrar `body` styles de otros componentes. Cuando dos controles fixed compitan en móvil, se resolverá con offsets responsivos dentro del mismo sistema, no con z-index arbitrariamente alto.

Alternativa descartada: colocar el chatbot delante de todo con un z-index extremo. Oculta controles del catálogo y no resuelve la colisión de geometrías.

### D6 — Un único pipeline de render del chatbot

Se localizarán referencias a `AssistantMessage`, `AssistantActions` y al render inline actual de `ChatPanel`. El panel delegará cada mensaje, tarjeta y acción en una única ruta viva; se eliminarán solo exports o componentes muertos demostrados por búsqueda y tests. El parser seguirá validando destinos internos, canales oficiales y orígenes de imágenes; el store seguirá conservando productos y acciones en `sessionStorage`.

Alternativa descartada: mantener dos renderers con pequeños cambios de markup. Produce diferencias responsive y estados que solo funcionan en una ruta.

### D7 — Accesibilidad con foco y scroll aislados

El chatbot y drawers usarán `role="dialog"`, `aria-modal="true"` cuando sean modales, `aria-labelledby` estable, focus trap, cierre Escape idempotente, restauración del foco y anuncios del último mensaje. Wheel/touch del hilo no se propagará al fondo. Se comprobarán touch targets, contraste y `prefers-reduced-motion` con la skill de accesibilidad.

Alternativa descartada: usar solo `aria-label` sobre un contenedor no modal y confiar en `overflow: hidden` del body sin restauración.

### D8 — SEO no invasivo

Se inspeccionarán los metadatos actuales de `/` y `/productos` y se conservarán. El chatbot seguirá siendo un widget controlado por estado, sin una segunda copia indexable de su historial, sin JSON-LD nuevo y sin modificar canonical/robots salvo que una prueba demuestre una regresión. Se aplicará una revisión SEO ligera, no una reescritura del contenido.

### D9 — Validación por invariantes y snapshots

Para cada viewport se registrarán ancho de documento, elementos fixed/sticky relevantes, foco y consola. Se harán recorridos de 10–20 turnos del chatbot, productos múltiples, errores, retry, sesión caducada, filtros, selección, ficha y presupuesto. Las capturas desktop y móvil se compararán contra la línea base, manteniendo el light-mode sin cambios fuera de los defectos corregidos.

## Risks / Trade-offs

- **[Riesgo] El scroll lock del body puede interferir con el scroll narrativo de la portada** → Mitigación: guardar/restaurar exactamente overflow y estilos previos, aislar el scroll del overlay y probar la apertura/cierre en desktop y móvil.
- **[Riesgo] El auto-scroll puede mover al usuario que está leyendo** → Mitigación: umbral de proximidad y ref actualizado por `onScroll`; pruebas separadas para lector al final y lector alejado.
- **[Riesgo] El teclado virtual reduce el alto útil del panel** → Mitigación: `100dvh` con límites razonables, safe-area, composer visible y prueba específica en landscape/teclado.
- **[Riesgo] Ocultar la scrollbar del textarea puede ocultar que existe contenido adicional** → Mitigación: mantener navegación por teclado y scroll táctil, limitar a pocas líneas y no aplicar `overflow: hidden` cuando el contenido supere el máximo.
- **[Riesgo] Corregir tarjetas o fixed bars puede cambiar el layout desktop** → Mitigación: cambios acotados a breakpoints/problemas demostrados y comparación antes/después en 1280–3840 px.
- **[Riesgo] Un componente duplicado puede tener consumidores no detectados** → Mitigación: búsqueda global, mantener exports necesarios hasta migrar referencias y ejecutar la suite completa antes de eliminar.
- **[Riesgo] El deployment de referencia puede depender de un backend o asset remoto fallido** → Mitigación: separar en el informe el síntoma frontend reproducible del problema externo, sin simular respuestas ni tocar configuración externa.
- **[Trade-off] La matriz completa exige revisión manual y no todas las comprobaciones son automatizables en jsdom** → Mitigación: automatizar invariantes y usar emulación/screenshot review para la parte visual, documentando cualquier viewport no disponible.

## Migration Plan

1. Ejecutar baseline y conservar el backup local; no se modifican ramas remotas.
2. Implementar por superficie, manteniendo commits locales enfocados si el owner los solicita, sin push.
3. Ejecutar tests, lint, typecheck y build después de cada grupo funcional; reparar regresiones antes de seguir.
4. Realizar la revisión visual de toda la matriz y comparar con la línea base light-mode.
5. Documentar cambios frontend, problemas externos, matriz, consola y riesgos. La reversión será un patch selectivo o el backup local, nunca un reset destructivo.

## Open Questions

- ¿Qué herramienta de navegador/screenshot está disponible en esta sesión para probar los 19 viewports? Si no hay una, se usará emulación manual y se marcará la limitación.
- ¿La barra "Mis selecciones" y el launcher del chatbot deben compartir un offset fijo aprobado por diseño, o basta con que ninguno tape controles en la matriz?
- Si la auditoría demuestra que un defecto depende de CSS/markup de un área protegida, ¿se aprueba tocar únicamente la línea responsable o se documenta como pendiente externo/protegido?
