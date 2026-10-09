# Auditoría responsive local — 2026-10-09

Cambio: `fix-responsive-landing-commercial-ui`. Implementación y verificaciones locales terminadas; aceptación visual externa pendiente.

## Base y entorno

- Rama `main`; HEAD inicial `011b0c1cd1909f87921716f1e1500699618d96bf`; remoto `origin`: `https://github.com/DavidColillaMartinez/Pruebas_OpenSpecs.git`, sincronizado al inicio.
- Sin modificaciones previas de código. Entradas ajenas sin seguimiento preservadas/excluidas: `.agents/skills/.agents/`, `.agents/skills/skills-lock.json`. Artefactos OpenSpec propios ya creados en la fase propuesta.
- Node disponible 22.22.2 frente al 24.x requerido; pnpm 10.34.5; Playwright 1.63. Chromium 153.0.8010.12 disponible; Firefox 155.0 instalado por `pnpm exec playwright install firefox` y arranque comprobado.
- Servidor de revisión: Vite local `http://127.0.0.1:4173`. Ningún envío real de presupuesto, chat o WhatsApp autorizado.
- Instrucciones AGENTS.md leídas; no hay AGENTS.md adicionales en `src`. Skills responsive-design (lectura desde instalación anidada), SEO, React best practices y Node.js best practices consultadas.

## Antecedentes y baseline

- Auditorías de septiembre (`web-usability-review`, `dark-theme-contrast-review`, `nav-pill-chat-scroll-fix`) son antecedentes, no validación de esta versión/matriz.
- Fallos y rectángulos facilitados por ChatGPT a1363×936 se trataron inicialmente como evidencia externa; el contraste local está registrado abajo y no se extrapoló a una matriz aprobada.
- El informe parcial de octubre y parche bajo `docs/audit` no existían al inicio. Parche recibido en `/media/test/Program/Downloads/switch/contacto-teclado.patch`; `git apply --check` pasa, aún no aplicado al registrar esta baseline.
- `pnpm test`: 51 archivos pasan y 1 falla; 407 tests pasan, 1 falla, 1 skipped. Fallo previo: `ProductDetailPage.gmeIo.test.tsx`, cambio a Negro conserva foto Cromo. JSDOM avisa de `HTMLMediaElement.pause` no implementado.
- `pnpm typecheck`: PASA. `pnpm lint`: PASA, 0 errores/10 warnings previos (AnimatedLogoMark 5, ScrollTopButton 2, ThemeToggle 1, Vision 1, useThemePreference 1). `pnpm build`: PASA; aviso de engine y timing de plugin CSS.

## Inventario de comprobación

- Landing al inicio: siete capítulos; gate1024×720; cabecera desktop grid de tres columnas, menú móvil con body-lock; logo Inicio absoluto fuera del flujo. Observaciones iniciales de código contrastadas después en navegador.
- Capas iniciales: cabecera/dots/filtros50, launcher/chat70, cesta40/70, galería80; interferencias reproducidas y coordinación verificada abajo.
- Fixtures existentes: Alba (Manillons, JSON), Alfa Compact (Royo no modular, JSON), Logika modular y GME en tests de ficha, IO Rhio/Testio en test de ficha IO, Stone Plus/Stone 3D en fixtures Duplach. Inventario documental incluye Akord y sus opciones; no acredita API en vivo.
- Se probaron rutas de fixtures e inventario exclusivamente como mocks explícitos. No se añadieron datos ficticios ni rutas al runtime.

## Fallos reproducidos y correcciones

| ID | Caso local | Medidas / causa | Corrección y regresión |
| --- | --- | --- | --- |
| R-01 | Inicio, 1363×936, ambos temas | Logo (573.5,140.4),216×216; Tienda (630.7,230.4),101.6×32; h1 (129.5,274.4),1104×96. Cruce logo/título 216×82 y logo/Tienda 101.6×32. | Logo reserva espacio en flujo; gaps/tamaño por altura útil. Callback y cascada originales probados en navegador. Foto/centrado/pill inicial conservados. |
| R-02 | Akord con mock de inventario, 1363×936 | Nombre (732.5,838),589×42 contra launcher en extremo derecho; cruce≈34.5×24. Diferencia horizontal≈7.5 frente a evidencia remota atribuible a layout/scrollbar local. | Gutter real de contenido y zona flotante, válido a mitad del scroll, no solo al final. Foco/edición/acciones probados también en fichas de otras familias y presupuesto. |
| R-03 | Capítulos, 1024×720 | Servicios último párrafo y≈668–780 y texto inferior y≈724–780; Quiénes somos hasta y≈740; controles Opiniones y≈680–724. Títulos invadían cabecera. | Gate por capacidad, compartido en hooks y body: compacto ≥940 alto, ancho ≥1280 permite ≥880. Native scroll existente en ventanas bajas; narrativa permanece donde cabe. |
| R-04 | Menú, copia original 011b0c1 a 844×390 | CTA/control final fuera de viewport, sin scroll de panel, body bloqueado. | Alto útil limitado, scroll propio, cierre sticky, Escape/Tab/restauración comprobados. Safe-area CSS; no prueba física Apple. |
| R-05 | Filtros originales a 844×390 | Launcher seguía accesible sobre diálogo (1 launcher visible cuando el diálogo era activo), con z70 frente a z50. | Prioridad de diálogo mediante inert/visibility del asistente; no escalada de z-index. Menú, filtros, cesta y galería ampliada probados poblados. |
| R-06 | Contacto oscuro y gráfica minimal | Marca negra sobre superficie oscura; recursos existentes. En Visión se midió además h2 rgb(21,21,21) sobre body rgb(46,47,50) en la copia original. | Soporte claro de tema para marca sin alterar archivos; mismos recursos en Contacto, cabecera compacta, Inicio móvil y Visión. Textos de Visión y confirmaciones usan roles oscuros legibles, sin cambiar light por un fallo dark. |
| R-07 | Presupuesto, 320×568 | Vaciar/Eliminar y campos hasta x≈330, fuera del viewport de 320. | minmax(0), wrapping de cabeceras/acciones, líneas apiladas en estrecho, título fluido local; contenido completo. |
| R-08 | Masthead, 320×568 | Ancho intrínseco del grid/identidad/presupuesto hacía recortar texto y controles por header redondeado. | Tracks minmax(0), identidad/acciones flex-wrap y contención de etiqueta; no ocultación de acciones. |
| R-09 | Cesta flotante, 430×932 y 1279×768 | Barra fija ancha invadía búsqueda/ordenación; select a x≈944,y≈704 con cruce completo≈239×44. | Cesta compacta con etiqueta completa y contador en zona lateral; volver arriba separado en la misma zona. |
| R-10 | Resize desde Contacto | Se terminaba en Opiniones al reflow nativo antes de volver a narrativa. | Se preserva sección durante resize/orientación y cambios de modo, bloqueando observación transitoria mientras se restaura el scroll. |
| R-11 | Visión, 1024×940 | h2 en (581,288.9),331×180 y párrafo absoluto: cruce≈331×79. | Texto en flujo solo para narrativa compacta; área de comparación mantiene aspecto. Video, arrastre, teclas y replay reales comprobados. |
| R-12 | Duplach, 1363×936 | Roble x≈699.4–787.3; Olivo ampliado x≈784.3–894.2. Cruce≈3 px, al reservar solo 8px de gap. | Tracks acotados/gap/padding de ampliación; scale-125 conservado. Selección y opciones vecinas comprobadas en ambos motores. |
| R-13 | Drawer al pasar 390→1363 de ancho | body.style.overflow='hidden' con 0 diálogos visibles: scroll bloqueado tras desaparecer drawer por CSS. | Cierre al cruzar umbral filtros/cesta, cleanup de overflow y callback estable de cierre. |
| R-14 | Teclas en Contacto/compositor | Listener global tomaba teclas de edición. | Protección del parche incorporada una vez y extendida a regiones con scroll útil. Tests de controles/defaultPrevented y navegador; navegación exterior y carrusel conservados. |

En la copia temporal de 011b0c1 se verificó de nuevo `git apply --check` del parche. La integración actual incluye las mismas protecciones y añade propiedad de scroll; por ello una comprobación inversa literal posterior no aplica al contexto ampliado. No se duplicó ni revirtió el parche.

## Evidencia y reproducción

Scripts versionados: `scripts/responsive-{fixtures,audit,interactions,media,report}.mjs`.

```bash
pnpm dev --host 127.0.0.1 --port 4173
node scripts/responsive-audit.mjs --out=/tmp/opencode/matrix.json
node scripts/responsive-interactions.mjs --out=/tmp/opencode/interactions.json
node scripts/responsive-media.mjs --out=/tmp/opencode/media.json
node scripts/responsive-report.mjs /tmp/opencode/matrix.json
```

Para lotes independientes: `--browser=chromium` o `--browser=firefox`; `--size=1363x936`; `--routes=/#inicio,/productos`; `--resume` reintenta combinaciones incompletas/fallidas. El reporter admite JSON separados por coma y conserva la última evidencia por caso para regresiones de las áreas modificadas. Salidas JSON/logs van a `/tmp/opencode`, no a producción.

El runner geométrico termina con error si hay FALLA/NO PROBADO o no hay evidencia. Para reproducir deliberadamente la baseline fallida se admite `--allow-fail`; sus resultados siguen etiquetados FALLA y no se convierten en aprobados.

- Medición: fuentes/animaciones/rectángulos estabilizados, capítulo activo, opacidad/visibility, clipping por ancestro, scrollports, cruces de textos, contención y hit-testing. Inicio mide logo/Tienda/h1 por separado; finales de página también se recorren.
- Excepciones explícitas: padre/hijo, foto clicable con flechas propias (se prueba punto de interacción), overlays de media/handle y figuras de carrusel, tarjetas fuera del scrollport horizontal. No se considera fallo estar abajo de una página con scroll accesible; sí se consideran textos/acciones recortados por cajas no desplazables.
- Matriz principal: 44 tamaños efectivos, incluyendo los 23 de encargo, fronteras 639/640/641,767/768/769,1023/1024/1025,1279/1280/1281,1535/1536/1537 y gates 879/880/881 y939/940/941. Chromium153.0.8010.12 /Firefox155.0; DPR1; ambos temas.
- 16 vistas por combinación: siete secciones, catálogo, presupuesto y siete fichas (Akord, Rhio, Testio, Alfa Compact no modular, Logika modular, Stone3D, Alba). Testio es fixture de pruebas, no afirmación de ruta publicada. Akord usa opciones documentadas con IDs audit-only. Todos los datos comerciales son fixtures/mocks; no verificación de catálogo/API real.
- Geometría final se escanea con reduced motion y tiempos normales se prueban por separado en320×568,844×390,1024×940,1363×936,1440×900. La matriz no acredita por sí sola todas las fases de animación o estados de backend; las tablas de interacción/media registran esa cobertura.
- Estados críticos: menú/filtros con14 opciones, cesta12 líneas, búsqueda/filtros largos, carga controlada, vacío, error/reintento, paginación, galería/cierre/foco, variantes por familia, cantidades/eliminación/persistencia, formularios individuales y conjuntos, validación/enviando/error/confirmación, chat largo/borrador, bienvenida nueva/descartada y resize/orientación. Tamaños320×568,667×375,844×390,1024×720,1280×720,1363×936,1440×900, ambos motores/temas.
- WhatsApp interceptado y destino `wa.me/34692912180`/borrador comprobados; tel y JSON-LD `+34692912180` comprobados. Búsqueda runtime no encuentra contactos antiguos. Correo interno no se publica/enruta desde frontend.
- Videos: originales, loadedmetadata/play/seek y eventos reales de fin, no `ended` sintético. Arrastre y teclado de comparación, replay y progreso de Reformas ejecutados. Assets de prueba solo para URLs `assets.test`/`assets.example` de fixtures; medios originales sin sustituir.

## Archivos y propósito

- Narrativa/distribución: `src/App.jsx`, `src/data/copy.js`, `src/hooks/useMediaGate.js`, `src/hooks/useNarrativeScroll.js`, `src/sections/desktop/Inicio.jsx`.
- Cabecera/menú/fijos: `src/components/Header.jsx`, `MobileDrawer.jsx`, `ScrollTopButton.tsx`; `src/features/assistant/AssistantShell.tsx`, `model/useFloatingSurface.ts`.
- Comercio: `CatalogPage.tsx`, `CatalogMasthead.tsx`, `CatalogFilterPanel.tsx`, `ProductGallery.tsx`, `ProductVariantSelector.tsx`, `DuplachVariantSelector.tsx`, `CatalogSelectionSummary.tsx`, `QuoteSelectionPage.tsx` bajo sus áreas de `src/features`.
- Marca/legibilidad/lectura: `src/sections/desktop/{Contacto,Opiniones,Vision}.jsx`, `src/sections/mobile/{Inicio,Contacto,Opiniones}.jsx`, `src/styles/{index,utilities}.css`.
- Teléfono: `src/data/business.js` (consumidores existentes compartidos).
- Regresión: `src/hooks/useNarrativeScroll.test.js`, `src/LandingPage.test.jsx`, `src/sections/desktop/Inicio.test.jsx` (retirada aserción CSS obsoleta; geometría real en navegador) y `src/features/assistant/model/assistantStore.test.tsx` (espera la persistencia real de acciones antes de afirmar el contrato, no solo el render previo del id).
- Evidencia: scripts, este informe/tablas y artefactos de `openspec/changes/fix-responsive-landing-commercial-ui/`.

## Gates y estado de entrega

### Resultados finales

| Comprobación | Resultado |
| --- | --- |
| Matriz geométrica | **2816 PASA**, 0 FALLA, 0 NO PROBADO (44 tamaños×4 navegador/tema×16 vistas) |
| Interacciones críticas | **336 PASA**, 0 FALLA, 0 NO PROBADO (7 tamaños×4 navegador/tema×12 recorridos) |
| Animación/media normal, inicial/final | **120 PASA**, 0 FALLA, 0 NO PROBADO (5 tamaños×4 navegador/tema×6 recorridos) |
| `pnpm test` | **52 archivos PASA; 413 tests pasan,1 skipped** |
| `pnpm typecheck` | PASA |
| `pnpm lint` | PASA; 0 errores,10 warnings previos,0 nuevos |
| `pnpm build` | PASA |
| `git diff --check` / OpenSpec strict | PASA |

Gates finales en **Node24.21.0/pnpm10.34.5**, runtime temporal de herramientas, sin cambiar package.json/lockfile. Servidor de navegador local en Node22.22.2; frontend revisado corresponde al mismo árbol de código. No se equipara esa diferencia con prueba de despliegue.

La primera ejecución Node24 con navegadores en paralelo tuvo timeout de5000ms en autoplay de13 reseñas. No se cambió autoplay ni su timeout. Otra ejecución detectó una aserción de persistencia demasiado temprana en el test del asistente; ahora espera las acciones efectivamente guardadas, igual que su test vecino. La ejecución final completa pasa. JSDOM sigue avisando que pause de HTMLMediaElement no está implementado (previo); prueba multimedia real se ejecuta en navegador.

Hubo timeouts de herramienta al intentar abarcar lotes grandes en una llamada y algunos puntos medidos antes de estabilizar navegación/scroll. Se repitieron esos casos, esperando navegación/frames reales; ningún resultado pendiente/fallido se convirtió en PASA por lectura CSS. Las tablas finales conservan la última ejecución específica; el reporter deduplica por navegador/tamaño/tema/ruta/estado/motion.

### Tablas completas

- [Matriz final por navegador/viewport/tema/ruta](responsive-matrix-2026-10-09.md).
- [Estados e interacciones críticas](responsive-interactions-2026-10-09.md), incluida continuidad de sección y fronteras nuevas en ambos sentidos.
- [Media original y fases con tiempos normales](responsive-media-2026-10-09.md).
- [Base011b0c1, desktop/móvil, antes de corregir](responsive-baseline-2026-10-09.md):128 casos,74 FALLA/54 PASA, comparados con su estado posterior. Es baseline histórica, no fallos abiertos de la versión entregada.

Los contextos de navegador se cerraron, datos de prueba descartados con ellos y servidores propios4173/4174 detenidos. Worktree temporal de baseline limpio retirado por operación Git dirigida; procesos/trabajo ajenos preservados. JSON/logs temporales no se incluyen en commits.

### Pendientes y entrega

- **Aceptación responsive/visual externa:** propietario y ChatGPT deben revisar el commit publicado; geometría/función locales no sustituyen esa aceptación.
- **Publicación comercial/legal:** URL de privacidad aprobada y entrega real de presupuestos/n8n no acreditadas por esta tarea. No hay bloqueo local de build; tampoco se declara «listo para publicar» por esos gates.
- **Externos/separados:** Safari/macOS/iPhone físico, correo interno/n8n, JSON y dominio/DNS/hosting. No se promueve manualmente despliegue ni se cierra ninguno por inferencia.
- **Opcional posterior:** zoom real125%/200% y revisión de dispositivos físicos aportados por el propietario; aquí NO PROBADO y no sustituido por DPR/viewport reducido. No se atribuyen medidas CSS a equipos por nombre/pulgadas.
- Pendientes previos de GME IO6.3/6.4/8.9 (datos/covers reales) conservados en su propio cambio, sin inventar comprobación de upstream.

Código entregado en **`b1ebdee`**, rama **`main`**, push confirmado a **`origin/main`** desde011b0c1. Un commit posterior de scripts/OpenSpec/evidencia acompaña esta entrega, sin cambios adicionales de runtime. El SHA final se obtiene de `git log -1` y se comunica al propietario tras ese push. La aceptación externa permanece pendiente.

Hallazgo separado preexistente: los consentimientos dicen «política de privacidad» sin enlace a una URL aprobada. No se inventó política ni destinatario/configuración backend.

## Límites externos

Aceptación visual del propietario/ChatGPT pendiente tras push. Safari/macOS/iPhone físicos, safe-area/teclado físico y medidas CSS de equipos del propietario NO PROBADOS. Zoom real 125%/200% aún NO PROBADO; DPR/viewport emulado no lo sustituye. Recepción n8n/correo interno `arealrmqtienda@gmail.com`, JSON y dominio/DNS/hosting son tareas externas/separadas. No se inventarán políticas o configuración para cerrar hallazgos.
