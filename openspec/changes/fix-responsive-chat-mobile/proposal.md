## Why

La web Area LRMQ funciona en escritorio, pero en móviles estrechos, alturas reducidas y algunas composiciones tablet aparecen problemas de espacio, overflow, foco y controles fijos. El chatbot necesita además seguir las conversaciones largas y ofrecer una entrada de texto cómoda; ahora el hilo puede dejar los últimos mensajes fuera de vista y el textarea muestra una scrollbar interna poco integrada con el diseño.

La corrección debe hacerse sobre el frontend existente, preservando la landing, el catálogo, las fichas, el presupuesto y la integración actual del chat. La revisión se realiza ahora porque el sitio se está probando en el deployment vigente `https://pruebas-open-specs.vercel.app/` y los fallos afectan directamente a la navegación táctil y a la conversión.

## What Changes

- Audita y corrige el responsive de `/` en móvil, tablet, landscape, escritorio y ultra-wide, sin rediseñar la narrativa ni cambiar sus contenidos o media.
- Audita y corrige el lanzador, panel, scroll, foco, teclado virtual, safe areas, acciones, tarjetas y estados del chatbot en todas las resoluciones objetivo.
- Mantiene el auto-seguimiento del último mensaje cuando el usuario está al final y respeta la lectura manual de mensajes antiguos.
- Convierte el compositor del chatbot en una entrada multilínea autoajustable, integrada visualmente con el botón de envío y sin scrollbar visible antiestética.
- Corrige header, drawer, filtros, tarjetas, galerías, variantes, selecciones y formularios solo cuando exista un problema responsive o de accesibilidad demostrado.
- Unifica los componentes y rutas de render del chatbot si existen duplicaciones o componentes muertos que impidan que acciones, productos o estados se comporten igual.
- Añade pruebas de regresión frontend para overflow horizontal, scroll/foco, input multilínea, acciones del chat y superficies críticas.
- Ejecuta validación funcional y visual en la matriz indicada, documentando limitaciones si alguna resolución no puede emularse.
- No cambia workflows n8n, Neon, Vercel, variables de entorno, secretos, contratos externos ni comportamiento de backend; no hace push, merge ni deploy.

## Capabilities

### New Capabilities

- `responsive-chat-experience`: Comportamiento responsive, scroll de conversación, compositor multilínea, tarjetas, estados y acciones del chatbot en móvil y escritorio.
- `responsive-landing-navigation`: Layout responsive de portada, header, menú móvil, drawer, navegación, vídeos, comparador, opiniones, contacto y formulario.
- `responsive-catalog-discovery`: Layout y controles responsive del catálogo, filtros, resultados, tarjetas, selecciones y coordinación con el launcher del chat.
- `responsive-product-quote-flow`: Responsive de fichas de producto, galerías, variantes, opciones Duplach, selección y flujo de presupuesto.
- `responsive-validation-quality`: Invariantes transversales de viewport, overflow, touch targets, foco, consola y matriz de validación visual.

### Modified Capabilities

(ninguna; `openspec/specs/` no contiene capacidades existentes.)

## Impact

- **Frontend potencialmente afectado**: `src/features/assistant/**`, `src/components/Header.jsx`, `src/components/MobileDrawer.jsx`, `src/features/catalog/**`, `src/features/quote/**`, `src/sections/mobile/**`, `src/sections/desktop/**` y `src/styles/**`.
- **Tests**: nuevos o ampliados tests de componentes, interacción, accesibilidad y layout; no se modifican tests para ocultar errores reales.
- **Documentación**: informe de problemas frontend corregidos, matriz de resoluciones y problemas externos pendientes, sin almacenar secretos ni modificar configuraciones externas.
- **Protecciones**: `assets/Catalogo/**`, `assets/Boceto/**`, `public/boceto-final.png`, `CompareSlider`, Vision, consultas/API del catálogo y sistema de presupuestos solo se tocan si una prueba frontend demuestra que el responsive no puede corregirse sin ello; se evita cualquier refactorización masiva.
- **Entrega**: rama local de backup `backup/pre-responsive-chat-mobile`; cambios locales sin push ni deploy hasta revisión manual.
