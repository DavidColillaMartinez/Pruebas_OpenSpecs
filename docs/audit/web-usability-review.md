# Revisión de usabilidad, accesibilidad y responsive · AREA LRMQ

Cambio: `refine-web-usability-accessibility`. Fecha: 2026-09-10.
Base: commit `86fb055` (etapa 1 cerrada con gate positivo; sin hallazgos CRIT/ALTA abiertos según `docs/audit/repo-seo-security-review.md` §9).
Base de verificación: **Playwright 1.63 + Chromium/Chrome Headless Shell 153.0.8010.12** instalado en esta sesión (npm instaló el paquete con pnpm y descargó el navegador). Herramientas existentes antes de la sesión: ninguna (Playwright no estaba instalado y los binarios en caché no coincidían con versión).

## 0. Gate de entrada (tarea 1.1)
- Informe de etapa 1 leído; sin defectos críticos/altos locales abiertos. Bloqueos externos BLOQ-001/002/004 permanecen y no impiden esta etapa.
- No se archivaron antecedentes: no hay specs principales que conciliar; `fix-responsive-chat-mobile`, `add-assistant-chat-ui`, `implement-product-detail-page` siguen como contexto.

## 1. Baseline (tareas 1.2/1.3)
- Git status inicial limpio; checks baseline en verde: **360 tests passed | 1 skipped (47 archivos)**, lint/typecheck/build OK (regresan tras cada lote; ver §7).
- Herramientas: navegador Chromium headless emulado (no dispositivos reales); **no hay** Safari/iOS ni Android real en esta máquina.
- Capturas claras de referencia tomadas y comparadas: Inicio desktop (Burbuja antes/después), Quiénes somos, catálogo 320, ficha, chat móvil abierto.
- Matriz y hallazgos: ver §3/§4. `docs/audit/web-usability-review.md` (este archivo) representa el entregable de la etapa.

## 2. Burbuja sobre Inicio (capacidad `contextual-chat-welcome-surface`)

### F-WS-001 · ALTA · La burbuja de bienvenida no tenía fondo blanco sobre la fotografía
- **Causa demostrada (tarea 2.1)**: la clase `bg-white/96` no genera CSS (0 coincidencias en `dist/assets/*.css`). Tailwind solo acepta opacidad no estándar con sintaxis de corchetes. Estilos calculados medidos sobre Inicio y Quiénes somos: `background-color: rgba(0,0,0,0)` con `backdrop-filter: blur(8px)`. Es decir: solo blur sobre la foto — texto ilegible, exactamente la mezcla denunciada.
- **Corrección aplicada (tarea 2.2)**: `src/features/assistant/components/ChatWelcomeBubble.tsx` de `bg-white/96` a `bg-white/[0.96]`. Se conserva blur y transparencia (sin fondo sólido global).
- **Verificado (tareas 2.1/2.3)**: estilos calculados tras el cambio: `rgba(255, 255, 255, 0.96)` + `blur(8px)` en Inicio y en Quiénes somos. Captura antes/después de Inicio y comparación en Quiénes somos sin cambios (misma composición). Ni la fotografía, ni el contenedor narrativo `fixed inset-0 hidden overflow-hidden md:block`, ni la navegación lateral (ChapterDots, Header) cambiaron (0 diff).
- Impacto: una clase, un archivo.

### F-WS-002 · MEDIA · El retraso declarado de 1.2 s no era efectivo
- El render se montaba con `visible` solamente; `shown` sólo controlaba el temporizador de auto-ocultación, por lo que la burbuja aparecía de forma inmediata (contrato previo: aparición tras 1.2 s).
- **Corrección**: render gated a `shown` (`if (!visible || !shown || dismissed) return null`). Test actualizado ("appears only after the agreed short delay": ausente hasta 1199 ms, visible desde 1200).

### F-WS-003 · MEDIA · La auto-ocultación no persistía el descarte de la sesión
- Antes: al expirar 8 s la burbuja desaparecía pero un recargado la volvía a mostrar. Comportamiento acordado: la aparición es **por sesión**.
- **Corrección**: `markWelcomeDismissed()` en el temporizador de auto-ocultación (timer principal y `resumeHide`). Verificado en navegador: tras 8 s no reaparece tras recarga (misma sesión).
- Pausa por hover/focus conservada (test y navegador).

### Presentación no altera interacción (escenario del spec)
- Navegador (destkop): abrir desde la burbuja ✔; marcado `lrmq:assistant:welcome:v1=dismissed` ✔.
- Móvil (emulación 360×800 táctil): la burbuja aparece, tap abre el panel, **sin autoenfoque del textarea** (`activeElement` = contenedor `DIV "Asistente de Area LRMQ"` → no teclado automático).
- Reduced motion emulado: la burbuja sigue funcionando.
- El launcher no cierra el aviso al abrir el panel (el aviso se desmonta con `open` y reaparece al cerrar si no expiró): **pendiente de decisión** — no se ha encontrado defecto demostrado frente al escenario escrito (que describe apertura desde el aviso). Registrado, no corregido.

## 3. Recorridos y recuperación (capacidad `cross-route-usable-experience`)
Upstream controlado localmente con Playwright mock (`/api/catalog/**`, `/api/chat/messages`) usando fixtures reales del repo (producto `mt-espejos-alba`). Ninguna petición real a producción.

### 3.1 Catálogo ↔ ficha
- PASS búsqueda "Alba" → URL `/productos?search=Alba`; clic a ficha; **Atrás** devuelve la query (`search=Alba`), el input restaurado y la posición de scroll (~350 px, tolerancia).
- Ficha: título y entidades actualizados; canonical `https://arealrmq.es/productos/mt-espejos-alba`.

### 3.2 Selección → presupuesto
- Selección de variante "Añadir al presupuesto" y paso a `/presupuesto`: la línea (Alba) aparece.
- Envío con upstream fallando (502): mensaje rol="alert", nombre/email/mensaje/selección conservados ✅; reintento con upstream OK → "Solicitud enviada correctamente".

### 3.3 Chat
- 18 turnos enviados, mensajes y tarjetas renderizadas; acción `internalPath: javascript:` descartada por el validador (sin enlace interactivo) — verificado con mock adversarial en/unit tests (types.test) y el navegador.
- Borrador "borrador pendiente" sobrevive cierre y re-apertura del panel ✔.
- Retry tras upstream 502: "Reintentar el último mensaje" recupera **sin duplicar** la respuesta ✔.
- Logo manual del hilo no es desplazado mientras se lee (scrollTop estable) ✔.
- Nueva conversación limpia historial y borrador ✔.
- Apertura móvil sin teclado automático ✔ (activeElement no es input).

### 3.4 Bienvenida y scroll-top
- Timeline verificada en navegador móvil: aparece a ~1.2 s, auto-oculta a 8 s, persiste el descarte tras reload (misma sesión); scroll-top móvil visible tras scroll.

### 3.5 Recuperación
- Producto inexistente (directo): pantalla "Producto no encontrado" con recuperación; **detectado: robots permanecía index,follow** → F-UX-001 corregido (noindex en estado not-found; test unit añadido).
- Ruta desconocida por navegación en-app: NotFoundPage con noindex + enlaces útiles ✔. (Mi sonda con `history.pushState` no dispara React Router — prueba inválida, no defecto.)
- URL directa de ruta desconocida: `vite preview` sin fallback devuelve 200 SPA-suite local; en Vercel stage-1 BLOQ-001/002 siguen: no reproducibles aquí. `vite preview` no sustituye la validación de despliegue.
- Imágenes bloqueadas (404 forzado en assets): sin overflow del documento, `alt` conservado ✔.
- sessionStorage bloqueado por init-script: catálogo, portada, chat y capturas renderizan; sin `pageerror` ✔.

## 4. Accesibilidad y consistencia (grupo 4)
- Encabezados por ruta auditados; hallazgo F-UX-002 (BAJA): en ficha, `h2` sr-only "Imágenes del producto" precedía al `h1` → convertida a `<span>` sr-only referenciado por `aria-labelledby` (la región sigue etiquetada; ya no rompe jerarquía). Heading order verificado: H1:Alba → h2 siguientes ✔.
- Foco/Escape: abrir chat y `Escape` cierra el panel y **restaura el foco al launcher** ✔ (escenario del contrato previo); set acumulación panel+filters no choca (el lanzador queda visible sobre la hoja de filtros y el Escape sólo cierra el panel activo). Se reproduce abrir chat solo y con hoja previa sin bloqueo cruzado.
- Contraste: texto de la burbuja ahora sobre blanco 0.96 (antes transparente; F-WS-001). comprobada con captura; no se instaló un motor de auditoría automática (axe) — pendiente si se solicita.
- Targets pequeños detectados: breadcrumbs `<A "Inicio"/"Catálogo">` ~19 px de alto — inline text links exentos de 2.5.8/2.5.8 por la especificación; el resto de primarias cumplieron 44 px. Registrado, sin corrección (exento).
- Anuncios: `aria-live` regionales del catálogo y chat verificados en código y con tests existentes; no se relee todo el historial (contenedor de anuncio por cambio).

## 4. Matriz responsive (capacidad `measured-responsive-quality`)
- **76 comprobaciones** (4 rutas principales × 19 viewports acordados) con Chromium emulado, tras F-RW-001: **cero overflow horizontal del documento**.
- Hallazgo corregido **F-RW-001 · MEDIA**: en 320×568 el select "Ordenar por" empujaba 28 px fuera del documento (intrinsic min-width) → `min-w-0 max-w-full` en label/select. Reprobe: limpio en las 19 viewports y 4 rutas.
- Interacciones completas (no sólo geometría) ejecutadas en móvil 360×800 táctil y desktop 1440×900 (ver §3). Landscape 568×320 y 768×1024/912×1368 cubiertos en geometría; **interacción táctil completa en tablet landscape queda pendiente** (sólo hay navegador emulado).
- No validado: teclado virtual físico, safe areas reales (se emulan via `env()`), zoom >200% del navegador, Safari real, iOS/Android reales. Registrados como pendientes, no como corregidos.

## 5. Rendimiento (tarea 5.3)
- Medidas **lab** con Chromium headless en localhost (no INP real, no red real): móvil 360×800.
  - `/` LCP ≈ 1 072 ms · CLS 0 · DCL 941 ms · load 1 169 ms
  - `/productos` LCP ≈ 620 ms · CLS 0 · DCL 132 ms (página esquelética con upstream mock: el upstream real añade TTFB medible en producción, ya observado en etapa 1)
  - `/presupuesto` LCP ≈ 480 ms · CLS 0 · DCL 131 ms
- No se aplicaron optimizaciones nuevas: las optimizaciones ya realizadas en `95d1373`/`921ec96` se mantienen; ninguna otra un cuello de botella demostrado adicional en lab; media intacta. INP real requiere datos RUM reales (pendiente externo).

## 6. Cobertura real de checks (tarea 5.4)
- `npm run lint` ampliado de `src/features src/routes` a **`src api server vite.config.js`** (`eslint.config.js`: globs de globals ampliados a `src/**`).
- 14 errores de imports/vars sin uso corregidos en: `App.test.jsx`, `BusinessJsonLd.jsx` (ADDRESS), `hooks/useNarrativeScroll.js` (VISION_INDEX muerto), `sections/desktop/Reformas.jsx`, `sections/mobile/{Contacto,Reformas,Vision}.jsx`, `App.test.jsx`.
- Nota: `sections/mobile/Vision.jsx` y `desktop/Vision.jsx` se tocaron **sólo para lint** (param `_reducedMotion`, warning de `react-hooks/exhaustive-deps` preexistente sin accionar); no cambian comportamiento visual ni propiedades protegidas. Si el propietario lo requiere, se rehace la exclusión con evidencia.
- Warnings restantes (8): preexistentes de react-refresh y un exhaustive-deps en desktop/Vision.jsx; quedan documentados (0 errores).
- TypeScript: `tsc --noEmit` cubre `src/features` + `src/routes` (unchanged): **src/components y src/sections NO están tipados** — pendiente documentado sin migración masiva JSX→TSX (acordado en diseño D6).

## 7. Gate de salida hacia tema (tareas 6.1–6.3)
- Checks finales: **360 tests | 1 skipped (47 archivos)**, lint 0 errores/8 warnings preexistentes, typecheck OK, build OK, `openspec validate refine-web-usability-accessibility` ✓.
- Regresión de la etapa previa: routing rewrites y contratos de catálogo/chat/presupuesto sin cambios; `routeMeta`/`robots`/`sitemap` de etapa 1 intactos y consumidos por las pruebas nuevas (detail not-found noindex).
- Comparaciones claras nuevas: Inicio con burbuja antes/después (desktop), Quiénes somos, catálogo 320, chat móvil abierto, presupuesto tras éxito.
- **Pendiente visual mantenido (no corregido)**: revisión real en Safari/iOS y Chrome/Android (teclado, safe area, gesto), revisión de INP real, auditoría axe Lighthouse si se solicita, y la presentación del `ChatLauncher` con la burbuja descrita "a la izquierda" en PC (no es requisito escrito; no se movió).
- **Referencia estable para `add-manual-light-dark-theme`**: commit backend actual con los lotes de esta etapa; paleta clara vigente sin diseño nuevo. La etapa 3 debe partir del estado de este informe, no del de la aprobación visual histórica.
- Sin commit, push, archive ni despliegue ejecutados aquí (pendientes al propietario como antes).

## Registro de los tests añadidos/actualizados
- `src/features/assistant/components/ChatWelcomeBubble.test.tsx`: 5 tests (retraso efectivo, auto-hide persistente, pausa, cierre por sesión, apertura).
- `src/features/catalog/pages/ProductDetailPage.test.tsx`: estado not-found con noindex y título verificables.
- Sin cambios de contratos ni de API.
