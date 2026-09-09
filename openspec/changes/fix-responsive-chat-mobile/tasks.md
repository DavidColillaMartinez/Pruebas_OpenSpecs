## 1. Baseline e inventario

- [x] 1.1 Confirmar `git status`, rama, backup local y que solo los artefactos de este cambio están pendientes; no modificar cambios ajenos.
- [x] 1.2 Ejecutar `npm test`, lint, typecheck y build, registrando resultados y warnings existentes antes de tocar código.
- [x] 1.3 Inspeccionar los componentes y estilos de chatbot, navegación, landing, catálogo, ficha y presupuesto, y crear una matriz de problemas observados por viewport.
- [x] 1.4 Comprobar el contrato frontend actual (`/api/chat/messages`, parser, store, persistencia y metadata SEO) y marcar cualquier fallo externo sin simularlo.

## 2. Chatbot y compositor

- [x] 2.1 Unificar la ruta viva de renderizado de mensajes, productos y acciones, eliminando únicamente duplicaciones o componentes muertos confirmados por búsqueda global.
- [x] 2.2 Conservar productos y acciones validadas en store y `sessionStorage`, y cubrir nueva conversación, retry, respuestas tardías y bloqueo de envíos duplicados.
- [x] 2.3 Ajustar el shell del panel para 320–480 px, landscape, safe areas, `dvh`/`svh`, header reflow, botones de 44 px y ausencia de overflow horizontal.
- [x] 2.4 Implementar scroll lock reversible del body, focus trap, `aria-modal`, nombre accesible, Escape idempotente, restauración de foco y aislamiento de wheel/touch scroll.
- [x] 2.5 Implementar o corregir el seguimiento inteligente del último mensaje con umbral de proximidad, sentinel final, respuestas largas/productos y respeto de lectura manual.
- [x] 2.6 Ajustar el textarea multilínea y el formulario integrado: auto-height, límite de líneas, scrollbar visual oculta, `Enter`, `Shift+Enter`, teclado virtual y botón accesible.
- [x] 2.7 Añadir pruebas de regresión del chat para scroll, foco, persistencia, acciones, productos, retry, input multilínea, viewport estrecho y conversación de 10–20 turnos.

## 3. Portada y navegación

- [x] 3.1 Corregir header, launcher, `MobileDrawer` y capas fixed/sticky solo donde la auditoría demuestre compresión, solapamiento, overflow o fallo de foco.
- [x] 3.2 Corregir layout, wrapping, proporciones de media, comparador, opiniones, contacto y formulario de portada en móvil, landscape, tablet y ultra-wide sin cambiar narrativa ni media.
- [x] 3.3 Añadir pruebas de navegación móvil, drawer largo, Escape, focus restoration, scroll lock y ausencia de overflow horizontal.

## 4. Catálogo

- [x] 4.1 Corregir masthead, buscador, ordenación, filtros, chips, skeleton, estados vacíos/errores y cargar más con controles táctiles y wrapping correctos.
- [x] 4.2 Coordinar drawer de filtros, barra "Mis selecciones" y launcher del chatbot con scroll interno, safe areas, focus trap y offsets sin solapamientos.
- [x] 4.3 Ajustar tarjetas, imágenes, facts, referencias, acciones y fallbacks para `min-w-0`, ratio estable, textos largos y alturas razonables.
- [x] 4.4 Verificar que consultas, filtros, ordenación, selección, navegación y metadatos SEO no cambian; añadir pruebas responsive de los estados críticos.

## 5. Ficha y presupuesto

- [x] 5.1 Corregir ficha de producto, galería, lightbox, título, metadata, facts, variantes y opciones Duplach para móvil, landscape y tablet, manteniendo interacción y foco.
- [x] 5.2 Corregir `/presupuesto` para selección, cantidades, eliminación, estado vacío, formulario, errores, retry, envío y resumen sticky sin tapar contenido.
- [x] 5.3 Verificar que payloads, validaciones, precios, endpoints y respuestas del flujo de presupuesto permanecen sin cambios; añadir pruebas de regresión.

## 6. Validación y entrega local

- [x] 6.1 Auditar touch targets, foco visible, contraste, nombres accesibles, `aria-modal`, Escape, reduced motion, consola y scrollWidth en toda la superficie.
- [ ] 6.2 Ejecutar la matriz completa de 19 viewports, incluyendo acciones reales del chat, filtros, galería, presupuesto y revisión de imágenes; registrar limitaciones de emulación.
- [ ] 6.3 Comparar visualmente light-mode antes/después en móvil y desktop, verificando que Vision, `CompareSlider`, media protegida y navegación conservan su comportamiento.
- [x] 6.4 Reparar warnings o regresiones introducidos, repetir tests/lint/typecheck/build y ejecutar `openspec validate fix-responsive-chat-mobile`.
- [ ] 6.5 Documentar problemas corregidos, resultados por viewport y problemas externos pendientes sin secretos; dejar los cambios locales sin push, merge ni deploy.

## 7. Ronda de UX del asistente y navegación

- [x] 7.1 Quitar el foco automático del compositor en pantallas táctiles en la apertura del chat y enfocar el contenedor del diálogo, conservando el autoenfoque en escritorio y la sintaxis de trampa de foco, Escape y restauración.
- [x] 7.2 Añadir el refuerzo global `caret-color` para texto no editable con excepción explícita de los campos reales de escritura, sin cambios de layout.
- [x] 7.3 Implementar la burbuja de bienvenida del asistente (una vez por sesión con `sessionStorage`), con variantes PC extendida y móvil comprimida, cierre de 44 px, auto-ocultación pausada en hover/focus y apertura del chat sin teclado en móvil.
- [x] 7.4 Implementar el botón fijo "Volver arriba" abajo-izquierda apilado sobre la barra "Mis selecciones" en catálogo y con salto al capítulo Inicio en la narrativa desktop de la portada.
- [x] 7.5 Añadir pruebas de regresión para el autoenfoque del chat, la burbuja (persistencia por sesión, cierre, apertura) y el botón volver arriba (aparición por umbral y acción), y revalidar tests/lint/typecheck/build y `openspec validate`.
