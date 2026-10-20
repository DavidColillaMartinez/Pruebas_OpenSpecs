# Herramientas estables y menú oscuro

## Base, alcance y evidencia

Trabajo iniciado el2026-10-12 (hora local+02:00), sobre `main` en `5e2978cf49fede7647b43fac666bd09398e2170a`. No había modificaciones de código previas. Se preservan y excluyen de entrega `.agents/skills/.agents/` y `.agents/skills/skills-lock.json`. Se leyeron AGENTS.md, propuesta/diseño/especificaciones/tareas del cambio `fix-responsive-landing-commercial-ui`, informes owner-responsive de2026-10-10 y verificadores existentes.

La evidencia de2026-10-09/10 es histórica. Las tablas de esta ronda se generan sobre el build final servido localmente con `vite preview` en127.0.0.1:4173. No hay capturas como entrega. Las mediciones e interacciones de navegador local no constituyen aceptación visual del propietario/ChatGPT ni aprobación de publicación comercial.

## Causas y reparaciones

| Causa confirmada | Reparación |
| --- | --- |
| `placeMobileControls()` recorría rangos de texto y controles y escribía coordenadas en scroll/foco/fuentes | Eliminado por completo. CSS define puestos permanentes; el hook solo coordina diálogos/contexto y protección del campo enfocado cuando cambia el alto útil |
| Botones fijos encima del contenido pueden tapar campos intermedios | Franja inferior propia y scrollport real que termina antes de ella, sin reducir ancho ni reservar lateral. Se comprueban límites efectivos, campos centrados/con foco y puntos intermedios |
| Herramientas y overlays necesitaban región/capas independientes del main | Portales para filtros flotantes, cesta, volver arriba y overlays comerciales; main final relativo con alto acotado. Cabecera/skip-link mantienen su orden DOM aprobado y su anclaje al viewport |
| Una regla compartida de opacidad hacía visible volver arriba cuando tenía `opacity-0` | Regla específica para el estado oculto, incluyendo catálogo; no se exime del hit-testing |
| Reserva de cabecera más offsets antiguos acumulaban desplazamiento de secciones en ventanas bajas | Landing móvil reserva76px reales arriba y elimina el doble `scroll-padding`/`scroll-margin` de secciones dentro de ese scrollport. Los offsets desktop y gate narrativo no cambian |
| Protección de foco ejecutada ante cualquier mutación podía devolver scroll al campo anterior al intentar alcanzar Enviar (y≈926 en390×844) | La protección solo actúa al cambiar realmente el main o su altura útil. Scroll ordinario y desplazamiento a otra acción conservan su destino. Contacto320/390 repetido aislado:8PASA |
| En modo nativo ancho (1024/1025×768) el centro de WhatsApp a y≈40 quedaba bajo cabecera durante scroll intermedio | La landing nativa usa también scrollport bajo cabecera a esos anchos, con alto acotado y offset76px. Distribución desktop comercial/narrativa y gate intactos; helper detecta ese scrollport por CSS |
| Primera distribución por porcentajes cruzaba8px la cesta/volver arriba a320px | Gap compartido calculado sobre ancho útil/safe-area y anchos reales. A320px los puestos sonx16,104,200,260, con16px entre herramientas. El verificador incorpora pares herramienta/herramienta, además de contenido y centros |
| Escape externo podía cerrar también el chat oculto | Asistente respeta `blocked` y `defaultPrevented`; el diálogo externo conserva propiedad de Escape |
| La primera iteración de main fijo creaba stacking context: cesta pintaba por encima del filtro aunque el diálogo tuviera z local mayor | Reproducido con hit-testing a390×844 en ambos motores/temas. Main final relativo; portal también para filtros y galería ampliada, con sus niveles existentes. Se verifica que la capa modal posee la región de todas las herramientas |
| Menú dark no seleccionado usaba secundario al45% | Reglas exclusivamente dark de texto primario legible en reposo. Inicio amplio tiene backing oscuro opaco propio; capítulos sin fotografía conservan su pill de superficie. Claro, tipografía, textos e indicador activo conservados |
| Nueva conversación del chat tenía alpha0.7 y contraste3.704:1 ante el backdrop claro máximo de su panel translúcido | Color secundario opaco localizado exclusivamente en panel dark, también para placeholder; prueba compuesta de botones habilitados/compositor frente al peor backdrop, sin cambiar tema claro ni textos |

## Composición exacta

- **<1024px:** franja de64CSSpx más safe-area inferior. Botones de44px de alto en y=`alto viewport − safe-area −54`. L/R=`max(16,safe-area lateral)`, U=`ancho−L−R`, F=`clamp(44,U−216,72)`, G=`max(4,(U−F−168)/3)`. Filtros de anchoF en xL; cesta80px en x`L+F+G`; volver arriba44px en x`L+F+80+2G`; launcher44px en x`ancho−R−44`. Ausencia de un botón deja su puesto vacío. Filtros aparecen al quedar su botón original por encima del viewport y desaparecen al regresar.
- Contenido comercial móvil: main relativo de alto acotado desde y0 hasta `alto−64−safe-area`; landing móvil con offset relativo76px desde y76 hasta ese límite, sin margen que colapse y añada scroll al body. Landing nativa≥1024px también reserva cabecera (y76…alto), conservando posiciones desktop de herramientas y sin franja inferior desktop. Ancho/paddings móviles simétricos conservados. Scroll real dentro del main, con listeners capturando sus eventos; helpers compartidos conservan guardar/leer/restaurar offset y volver arriba. Scroll de un diálogo no reemplaza el offset guardado de página. Cabecera/skip-link permanecen antes del contenido en el DOM, sin stacking context extra del main.
- La franja usa `body::after`; `body::before` y su textura clara/oscura original quedan intactos.
- Bienvenida presente con altura≥600px: fila propia180px encima de las herramientas, máximo164px con scroll interior. El main termina antes de esa fila. En alturas<600px su presentación cede temporalmente, conservando launcher. Mostrar/descartar bienvenida no desplaza herramientas. Sus textos originales permanecen; en móvil usa superficie/contraste sólidos, pues ya no flota sobre la foto.
- Chat: borde inferior anclado a la franja de herramientas y altura máxima `100dvh − franja −8 −safe-area superior`. Header/compositor no encogen; conversación tiene scroll. Diálogos externos tienen prioridad e inert/visibility del asistente; body-lock bloquea también main móvil y cleanup restaura scroll/foco.
- **≥1024px:** coordenadas y distribución desktop anteriores. Sin búsqueda de huecos. Bienvenida cede fuera de Inicio fotográfico y cuando comparte la ranura de la última tarjeta de Inicio; se mide solo esa tarjeta controlada y el tamaño CSS del popup, sin recorrer textos ni recolocar herramientas. Se considera el destino final de su transición para evitar cruces durante el fade. El launcher sigue disponible. Resize limpia posibles coordenadas inline legadas y transfiere scroll main/window; no se toca el gate narrativo.

## Verificación reproducible

Los runners usan Chromium y Firefox locales, DPR1 y temas claros/oscuros. El runner geométrico sigue detectando solapes y hit-testing, incorpora filtros como blocker y verifica contención/hit de cada herramienta y límite main/dock. Distingue elementos completamente fuera de un scrollport real de ocultación permanente; el centro de un control parcialmente visible solo se considera accionable cuando está dentro de la región efectiva. No se añaden aprobaciones generales de solapes.

Matriz:44 tamaños originales más820×1180,1180×820,834×1194,1194×834,1024×1366,1366×1024 y390×599/600/601 (frontera nueva de bienvenida).768×1024 y1024×768 ya existían. Total53 tamaños únicos ×2 motores ×2 temas ×16 vistas. Incluye1023/1024/1025, fronteras restantes, ventanas bajas, ultrawide y gates de altura actuales. Las16 vistas son siete capítulos, catálogo, siete fichas representativas y presupuesto.

`responsive-tools.mjs` registra11 puntos descendentes/ascendentes (0,15,30,50,75,100,75,50,30,15,0% del scroll útil), coordenadas viewport y hit-testing por herramienta visible, con tolerancia máxima1CSSpx. Repite cesta vacía/poblada y bienvenida nueva/descartada en catálogo/Akord/landing, y presupuesto poblado. Registra campos con foco y centros dentro del main efectivo. No interpreta aparición/desaparición como desplazamiento. Comprueba retorno real de ficha a catálogo, scroll restaurado y resize1023↔1024↔1025.

`responsive-interactions.mjs` amplía los recorridos existentes:14 escenarios en21 tamaños críticos, incluyendo tablets ambas orientaciones y frontera599/600/601. Filtros flotantes y cesta se abren en30/65% de scroll; Escape/Tab/foco, acciones finales, salida de ruta y breakpoints. Skip-link visible/accionable y menú amplio/compacto. Chat largo mock, scroll de conversación, borrador, prioridad de cesta sobre chat y viewport390×375 con compositor/cierre/envío accesibles. Esto no equivale a teclado físico iPhone.

Medios/animación normal:320×568,390×600,844×390,768×1024,820×1180,1024×768,1024×940,1363×936,1440×900; ambos motores/temas. SVG, fotos, vídeos originales, callback del logo, swipe/teclas/replay de Visión, Reformas y Opiniones. El centro de comparación se desplaza al área efectiva antes de arrastrar y se verifica hit-testing, sin cambiar comparación/replay. Chat también se verifica separadamente con motion normal en móvil/tablet.

Contraste dark: colores RGBA calculados, alpha compuesto sobre cadena de fondos efectivos, opacidad de ancestros y luminancia sRGB WCAG. Normal/activo/hover/foco, menú amplio/compacto, Inicio/Contacto, Tienda/asesoría de cabecera y CTA del drawer. Sobre fotografía, solo dark tiene respaldos opacos localizados que hacen el fondo medible sin depender del píxel de imagen. Referencia: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html. Las reglas claras se contrastan con sus colores/alphas previos; no se redefine la paleta clara. En claro fotográfico sin respaldo opaco no se inventa un ratio de fondo: se registra no medido y se verifica preservación, con aceptación visual externa pendiente.

Zoom real: ventanas propias X11 y aceleradores del navegador mediante xdotool (`Ctrl+0`, `Ctrl+equal`), con viewport inicial/efectivo y ratio comprobado. Sin `deviceScaleFactor`, CSS zoom, pinch ni viewport reducido para simular zoom. Firefox configura únicamente los escalones del zoom de su navegador de prueba para poder seleccionar exactamente125/200%; no cambia aplicación ni configuración del propietario.

### Comandos

```sh
pnpm build
pnpm preview --host 127.0.0.1 --port 4173
node scripts/responsive-audit.mjs --workers=2 --out=/tmp/opencode/stable-production-geometry.json
node scripts/responsive-tools.mjs --workers=2 --out=/tmp/opencode/stable-production-tools.json
node scripts/responsive-interactions.mjs --workers=2 --out=/tmp/opencode/stable-production-interactions.json
node scripts/responsive-media.mjs --workers=2 --out=/tmp/opencode/stable-production-media.json
node scripts/responsive-zoom.mjs --out=/tmp/opencode/stable-production-zoom.json
```

Los nombres `*-final.json` de las tablas siguientes corresponden a la repetición posterior al ajuste de cabecera nativa. `stable-production-geometry.json` y los primeros lotes son diagnóstico; la entrega usa `stable-production-geometry-final.json`, `stable-production-tools-final.json`, `stable-production-interactions-final.json` y `stable-production-media-final.json`.

Resume solo conserva combinaciones realmente medidas y completas en este runtime; repite incompletas o fallidas. No importa resultados históricos ni crea filas PASA por defecto. Se limita concurrencia tras diagnosticar saturación local (carga39, swap llena y navegación agotada), sin aumentar timeouts. Los lotes dev/interrumpidos por el límite del comando son diagnóstico, no validación definitiva. Contacto espera estabilidad tras navegación nativa por teclado y antes de medir foco/scroll, en lugar de asumir que dos frames bastan; no se modifica ningún timeout de test. Se generan tres respuestas largas mock para obligar a scroll de conversación también en tablets altas. El test de GME IO agotó waitFor bajo carga (Negro seleccionado, efecto de foto aún pendiente), pasó aislado en758ms/3tests y exige suite completa final sin navegadores simultáneos. Contacto320×568 y resize390×844 repetidos aislados sobre producción:4PASA cada uno, ambos motores/temas.

## Datos y preservación

- APIs de catálogo, presupuesto y chat interceptadas por `responsive-fixtures.mjs`. Confirmación y respuesta mock no acreditan disponibilidad upstream, recepción de correo ni n8n. WhatsApp interceptado; no hay mensajes reales.
- Akord/rutas de inventario y fixtures comerciales existentes; `gme-testio` es fixture IO de pruebas, no producto publicado afirmado. Imágenes de dominios `assets.test`/`assets.example` son dobles SVG identificados; medios de landing/video/comparación originales. Las URLs originales de producción no se reemplazan en runtime.
- Contratos, endpoints, consultas, disponibilidad, selección, quantities/min/max/payload, validaciones, persistencia y navegación conservados. El offset guardado de catálogo mantiene el mismo formato/clave; se obtiene del scrollport correcto. Contactos oficiales `692912180`, `34692912180`, `tel:+34692912180` y destinos WhatsApp conservados.
- Ningún cambio en assets protegidos, CompareSlider, secciones Visión, APIs/proxy/n8n, JSON, dominio/hosting o páginas legales.

## Archivos afectados

- `src/styles/utilities.css`: puestos, scrollports, bienvenida/panel, límites/safe-area y contraste dark localizado.
- `src/features/assistant/model/useFloatingSurface.ts`, `AssistantShell.tsx`: prioridad de diálogos, contexto, protección de foco y propiedad de Escape; eliminación del algoritmo por huecos.
- `src/components/pageScroll.ts`, `ScrollTopButton.tsx`, `src/App.jsx`: scroll compartido, listener/resize y portal, continuidad sin cambiar gate.
- `src/components/Header.jsx`: clases de presentación dark amplia/acciones sobre foto; destinos y orden DOM intactos.
- `src/features/catalog/pages/CatalogPage.tsx`, `components/CatalogProductCard.tsx`: scroll/restauración/listeners y portal del filtro flotante.
- `src/features/catalog/components/CatalogFilterPanel.tsx`, `ProductGallery.tsx`: portal de overlays para escapar del stacking context; medios, opciones, navegación y proporciones intactos.
- `src/features/quote/components/CatalogSelectionSummary.tsx`: portal de control/drawer; selección y lógica intactas.
- Scripts responsive, tablas nuevas y OpenSpec: verificaciones reproducibles y seguimiento.

## Resultados definitivos y entrega

Fin de verificaciones locales:2026-10-13,11:57(+02:00). Build revisado: JS principal `index-BohAwUkd.js`, CSS `index-tFmB2PV4.css`; el build final reproduce esos mismos nombres, sin cambios runtime posteriores. Node24.21.0/pnpm10.34.5 para gates finales; runners Playwright1.63.0 ejecutados con Node22.22.2. Vite8.1.5, Vitest4.1.11, Chromium153.0.8010.12 y Firefox155.0. Los avisos de engine de las primeras comprobaciones bajo Node22 se resuelven usando Node24 en los gates de entrega.

| Comprobación final | PASA | FALLA | NO PROBADO |
| --- | ---: | ---: | ---: |
| Geometría53tamaños×4motor/tema×16vistas |3392|0|0|
| Estabilidad/contraste13tamaños×4×17casos |884|0|0|
| Interacciones21tamaños×4×14escenarios |1176|0|0|
| Medios originales/animación normal9tamaños×4×6casos |216|0|0|
| Chat/prioridad con animación normal390×844/820×1180 |16|0|0|
| Preservación adicional de siete revisiones a320×568 |28|0|0|
| Zoom real Chromium125/200%, ambos temas,16vistas |64|0|0|
| Zoom real Firefox125/200%, ambos temas |0|0|4|

**Coordenadas:**13.992 muestras de herramientas visibles en recorridos descendentes/ascendentes; desplazamiento máximo medido **0CSSpx**, tolerancia1CSSpx.4.608 comprobaciones de campos/acciones con foco y centro dentro del área efectiva. Aparición/desaparición se separa del desplazamiento; CSS no escribe coordenadas por scroll.

**Contraste:** mínimo medido del menú/acciones dark en reposo/hover/foco y superficies revisadas **5.444:1**, superior a4.5:1. Se compone alpha/opacidad. El claro fotográfico conserva sus reglas; no se inventa un ratio de imagen no muestreada. En Inicio claro la clase histórica `text-secondary/88` no emite regla en la escala Tailwind existente: el color efectivo preservado es primario `rgb(21,21,21)`, no un RGBA supuesto por el nombre de clase.

**Firefox/zoom NO PROBADO:** el primer intento automático abrió un viewport inicial500×35; sus32fallos son diagnóstico de una ventana de prueba inválida, no evidencia final. Se corrigió el tamaño de la ventana OS a1440×1000 y se identificó por título único, sin emular viewport/DPR. Aceleradores `Ctrl+equal` y `Ctrl+plus` no modificaron el viewport1388×863 (ratio1 en claro). En oscuro, xdotool no obtuvo ventana visible para el contexto. Se mantienen4casos NO PROBADO con estas causas. Chromium sí efectuó zoom real:1396×869→1117×695 (125%) y698×434 (200%), ambos temas. Safari/iPhone físico siguen externos.

**Gates finales (sin navegadores simultáneos):**52archivos pasan;413tests pasan,1omitido. Typecheck, build, `git diff --check` y OpenSpec estricto PASA. Lint0errores,10avisos previos,0nuevos. JSDOM vuelve a emitir su aviso existente de `HTMLMediaElement.pause` no implementado; no acredita reproducción real, cubierta por el runner de medios. Tras el fallo de espera de GME IO bajo carga y su diagnóstico aislado, la suite completa final pasa sin aumentar timeouts.

El verificador encontró cuatro rechazos en Firefox390×600/601 al exigir contención completa de un botón-imagen430px de alto dentro de un scrollport356px, con redondeo y≈−0.5. Es superficie de media desplazable aprobada: ahora exige que su **centro real esté dentro del scrollport y reciba hit-testing**; flechas, miniaturas, cierre y restantes campos/acciones siguen comprobados individualmente. Se repitieron las combinaciones afectadas:1176PASA finales. No se acepta un campo cubierto ni se eximen herramientas del detector de solapes.

### Tablas y reproducción

- [Geometría completa](owner-responsive-stability-geometry-2026-10-13.md).
- [Casos de estabilidad](owner-responsive-stability-tools-2026-10-13.md), [coordenadas min/max](owner-responsive-stability-tools-2026-10-13-coordinates.md), [contraste compuesto](owner-responsive-stability-tools-2026-10-13-contrast.md).
- [Interacciones](owner-responsive-stability-interactions-2026-10-13.md).
- [Medios y chat con motion normal](owner-responsive-stability-media-2026-10-13.md).
- [Preservación](owner-responsive-stability-preservation-2026-10-13.md).
- [Zoom real y límites Firefox](owner-responsive-stability-zoom-2026-10-13.md).

Las tablas se generan mediante `node scripts/responsive-report.mjs <JSON[,JSON]> <ruta.md> 2026-10-13`. Las medidas completas por muestra/medio/estado están en los JSON reproducibles de los runners. Deduplicación incluye motor, tamaño, tema, ruta, estado, motion y zoom; ningún caso se crea PASA por defecto. La revisión local consistió en interacción y medidas en navegador, incluida ventana real de zoom; **no se realizó aceptación visual manual ni se generaron capturas**, conforme al encargo. La aceptación queda reservada para el propietario/ChatGPT sobre el SHA publicado.

Servidor `vite preview` propio detenido tras las comprobaciones. Todos los contextos y ventanas de prueba fueron cerrados; no se conservan sesiones comerciales activas ni solicitudes externas. Se preservan las entradas ajenas de skills.

**Entrega Git:** reparación runtime y evidencia publicadas en `206a172` sobre `5e2978c`, con push confirmado a `origin/main`. El seguimiento de entrega se cierra en un commit documental posterior, sin cambios runtime. No se realizó promoción manual ni cambio de Vercel/hosting. Todas las tareas externas continúan abiertas; el SHA final del seguimiento se entrega en la respuesta de cierre para revisión posterior.

## Pendientes externos

Aceptación visual del propietario/ChatGPT sobre SHA publicado; Safari/macOS/iPhone físico, safe-area/teclado físico; recepción/configuración n8n/correo; dominio/DNS/hosting y páginas legales con datos/URLs aprobados. Migración JSON sigue separada. No se inventan NIF, políticas, URLs de privacidad ni consentimiento. Las tareas externas de OpenSpec permanecen abiertas.
