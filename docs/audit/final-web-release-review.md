# Revisión final de lanzamiento · AREA LRMQ (cadena de tres etapas)

Cambio: `add-manual-light-dark-theme`. Fecha: 2026-09-10.
Cadena verificada: `audit-harden-repo-seo-security` (21/21) → `refine-web-usability-accessibility` (21/21) → `add-manual-light-dark-theme` (17/17).

## 1. Base y condiciones

- Base de trabajo al comenzar la etapa 3: commit `86fb055` + los lotes revisados (sin commit) de la etapa 2 (`Playwright` instalado como devDependency, tokens, correcciones de usabilidad).
- Informes fuente: `docs/audit/repo-seo-security-review.md` (`F-*`/`BLOQ-001..004`) y `docs/audit/web-usability-review.md` (`F-WS-*`, `F-UX-*`, `F-RW-001`, `F-COV-001`).
- Bloqueos externos heredados sin resolver: BLOQ-001 (soft 404 en URL directa de producto inexistente), BLOQ-002 (cuerpo 404 de marca en petición directa), BLOQ-004 (URL de política de privacidad/hosting reales). Pendiente de decisión del propietario; **ninguno fue resuelto por inferencia y ninguno impide el resto**.

## 2. Implementación del tema (Decisiones D1–D5)

- **Preferencia (2.1)**: `src/theme/preference.ts` con `light|dark`, clave `lrmq:theme:v1`, claro por defecto, valores inválidos → claro, storage fallido tolerado (aplicar en memoria igualmente). No se consulta `prefers-color-scheme`. Sincronización opcional entre pestañas sólo con valores válidos. Tests en `src/theme/preference.test.tsx` (8 casos).
- **Aplicación temprana (2.2)**: `public/theme-bootstrap.js` mismo origen, insertado en `<head>` de `index.html` **antes** del render: aplica `data-theme="dark"` solo si el valor almacenado es exactamente `dark`; claro no necesita atributo. Sin `unsafe-inline` nuevo (metadatos CSP intactos). Verificado por carga directa con cabeceras de preview; la CSP desplegada real de producción no es reproducible en `vite preview` (Vercel la emite en el CDN); el script cumple `script-src 'self'` por ser un recurso estático del sitio.
- **Tokens (1.3)**: roles en `tailwind.config.js` con canales RGB compatibles con alpha (`rgb(var(--lrmq-*) / <alpha-value>)`): `surface`, `surface-elevated`, `elevated-hover`, `primary`, `secondary`, `border-hairline`. Valores claros = paleta aprobada (mismos canales que los hex previos); oscuro: superficie `21 21 22`, elevada `34 34 35`, texto claro `242 238 230`, secundario `201 196 187`.
- **Selector (2.3)**: `src/components/ThemeToggle.tsx` — 44×44, nombre accesible + `aria-pressed`, icono decorativo con `sr-only`, foco visible (`focus-visible:ring-2 ring-clay`), Enter/Espacio nativos. Prueba de 320 px: toggle 44×44, `Tienda` intacta al lado (orden DOM `Cambiar a tema → Tienda → Menú`), overflow 0.
  - Portada móvil: inmediatamente **antes de Tienda** (visual y DOM) sobre la cabecera flotante, no en el drawer.
  - Portada PC: junto a Tienda/Pedir asesoría.
- **Portada/catálogo/ficha/presupuesto/404 (2.4)**: el mismo control aparece en la zona superior existente de cada página (migas o fila de cabecera), sin `header` global ni navegación comercial nueva.
- **Superficies (3.1–3.3)**: conversión por lote a roles en portada/base (html/body, `landing-narrative`), catálogo (página, masthead, filtros, tarjetas), ficha (galería/variantes), presupuesto, 404 y superficies de chat (panel, composer, tarjeta de producto, burbuja de bienvenida con alpha .96 y blur conservado). En en tema claro las utilidades resuelven a los mismos canales: comparaciones por pantalla light/dark muestran el claro igual a la referencia salvo el toggle.
- **Islas de marca**: fotografía de portada/Colección, platos y piano del masthead oscuro registrado (preexistente), `CompareSlider` y secciones de Vision equipo protegidos sin tocar en esta etapa; el héroe fotográfico de Inicio conserva sus medios y colores exactamente.

### 3.4 Estado preservado (navegador, mock controlado)
- Toggle con petición en vuelo + draft: borrador intacto, respuesta tardía entra después, panel no se cierra, sin recarga ni llamadas extra. Search/params conservados (Alba), página no remontada, scroll del lector intacto (±40 px), proveedores montados.
- Tests: welcome del chat intacta, página de rutas y not-found noindex intactos (regresión etapa 1 vía suite), CLS 0 en ambos temas.

## 3. Matriz de 19 viewports en claro y oscuro (4.1)
- Tras la conversión completa: **76 checks × 2 temas (152)** en `/`, `/productos?search=Alba`, `/productos/mt-espejos-alba`, `/presupuesto` — sin overflow horizontal del documento ni errores de página. Recorridos completados en móvil 320/360, desktop 1280/1440 (consultas, chat, toggle; ver §2/§3.4).
- Pendientes de dispositivo real: zoom, teclado virtual, safe area física, Safari/iOS y Android (no simulables; los `env(safe-area-*)` de CSS tardan 필요 tampoco no inspección de código aceptada como validación física).

## 4. SEO y seguridad después del tema (4.3)
- Suite completa en verde tras el tema: **368 tests | 1 skipped (49 archivos)**, lint 0 errores/10 warnings preexistentes, typecheck OK, build OK, `openspec validate add-manual-light-dark-theme` ✓.
- Metadatos/canonical/robots/sitemap/JSON-LD sin cambios funcionales; el tema no añade contenido indexable ni modifica contratos (`routeMeta`, `robots.txt`, `sitemap.xml`, validadores de chat/presupuesto se re-ejecutan en la suite).

## 5. Evidencia visual (nueva de esta etapa, ambos temas)
- `evidence-light-portada.png` vs `evidence-dark-portada.png` (identidad del héroe fotográfico, toggle cambia `/moon/sun` en cabecera y móvil).
- `evidence2-*-catalogo/presupuesto` (dark: fondas, inputs, filtros, cesta y chat adaptados; light igual a la referencia).
- `evidence-movil320-header.png`: toggle antes de Tienda a 320 px.
- Captura de consola: sin errores nuevos de consola en las cuatro rutas en ambos temas (pageerror monitor en los scripts de matriz).
- Ojo: la revisión formal de aceptación visual del oscuro todavía corresponde al propietario; estas pantallas son nuestra evidencia de laboratorio, no revisión de dispositivos reales.

## 6. Límites externos (sin promesas)
- Hosting real, URL de privacidad/consentimiento, integridad de los permisos del workflow n8n/Neon y validación de las mismas cabeceras CSP desde un subdominio publicado quedan como antes: **pendientes de confirmación/evidencia específica del propietario**.
- El modo demostración del asistente sigue bloqueado en producción: fue probado solo localmente con upstream controlado; ningún entorno de producción se modificó.
- Sin commit, push, deploy ni archivo automático ejecutados en esta etapa; opciones documentadas a la espera del propietario.
