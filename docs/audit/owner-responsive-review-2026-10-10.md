# Revisión del propietario posterior a 9163d35

Nota posterior: la colocación por huecos descrita aquí es histórica. Su sustitución por puestos estables y la nueva matriz se documentan en [reparación de estabilidad](owner-responsive-stability-review-2026-10-13.md); estos resultados del10deoctubre no validan el runtime posterior.

Base: `main` en9163d35, sincronizada conorigin/main. No había cambios de código previos. Se preservaron las entradas ajenas sin seguimiento `.agents/skills/.agents/` y `.agents/skills/skills-lock.json`.

## Correcciones

1. **Tienda centrada:** logo y enlace compartían formato inline y podían quedar en la misma línea. Un wrapper flex reserva al logo una fila propia; logo/enlace/h1 comparten centro del viewport, sin cruzarse. Animación/callback existentes conservados.
2. **Márgenes móviles:** eliminada la reserva lateral de76px de landing y96px de superficies comerciales <1024px. Landing, catálogo, fichas y presupuesto recuperan anchura natural/márgenes simétricos. Desktop mantiene su distribución existente.
3. **Fondos coherentes:** clase landing-surface independiente del bloqueo narrativo. Fondo calculado blanco rgb(255,255,255) /oscuro rgb(46,47,50) en ambos modos. Cleanup al abandonar la landing; catálogo conserva su superficie desktop rgb(251,250,247) /rgb(28,29,31).
4. **Punto activo único:** desaparece el estado de preview/foco que mantenía relleno el punto clickeado. Relleno/tamaño y etiqueta corresponden solo al capítulo activo; foco de teclado conserva su anillo.
5. **Flotantes suaves:** opacidad0.72 y sombra ligera en reposo, plena al tocar/hover/foco. Asistente móvil44×44px. Colocación por huecos libres en bordes durante scroll/resize/foco/cambio de fuentes; retiene posición segura previa. No reserva una columna ni oculta contenido. Diálogos conservan prioridad.
6. **Filtros al bajar:** acceso móvil adicional cuando el botón original pasa por arriba del viewport, incluido scroll largo/restaurado. Abre el mismo panel, conserva opener para restaurar foco, desaparece al volver al botón original.
7. **Cantidad:** fila con separación16px (wrapping si hace falta) sin modificar valor, min/max, validación ni payload.

## Evidencia local

`scripts/owner-responsive-review.mjs` comprueba estas condiciones con asserts de centros, márgenes, colores calculados, punto activo tras clic/rueda/teclado, opacidad reposo/foco, apertura/cierre/restauración de filtros y separación/edición de cantidad en siete fichas de fixtures existentes. Las solicitudes externas siguen interceptadas.

- Tamaños de revisión:320×568,390×844,667×375,768×1024,1024×719,1363×936,1440×900; Chromium153.0.8010.12 yFirefox155.0; ambos temas, DPR1.
- Revisión visual local de landing móvil claro/oscuro y resultados del catálogo centrados; capturas temporales de trabajo fuera del repositorio. Aceptación externa del propietario pendiente.
- Casos de video/Visión/carrusel con tiempos originales a1363×936, ambos motores/temas:24 PASA. SVG/PNG/video originales no modificados.
- El verificador geométrico existente permanece estricto: no se añadió flag para aceptar solapes de flotantes ni se maquilló un resultado FALLA. Los cruces reaparecidos al quitar el lateral se corrigieron mediante colocación libre y actualización al terminar de cargar fuentes/fade.
- Regresión geométrica de esta ronda: lote corto de5 tamaños (1363×936,320×568,844×390,1024×720,1280×768) ×4 navegador/tema×16 vistas. No equivale a repetir la matriz anterior de44 tamaños completa.

### Resultados definitivos

| Comprobación | Resultado |
| --- | --- |
| Siete revisiones y diagnóstico complementario |196 PASA,0 FALLA,0 NO PROBADO |
| Regresión geométrica (5 tamaños×4 navegador/tema×16 vistas) |320 PASA,0 FALLA,0 NO PROBADO |
| Media/animación normal1363×936 |24 PASA |
| `pnpm test` |52 archivos pasan;413 tests pasan,1 skipped |
| `pnpm typecheck`, `pnpm build` |PASA |
| `pnpm lint` |0 errores;10 warnings previos;0 nuevos |
| `git diff --check` |PASA |

Gates finales: Node24.21.0/pnpm10.34.5; navegadores locales en Vite. La primera ejecución de Vitest bajo navegadores simultáneos agotó el wait de navegación de App.test; el test pasó aislado y la suite final completa pasa, sin modificar lógica de rutas ni ampliar timeouts.

Tablas: [revisiones](owner-responsive-cases-2026-10-10.md), [regresión geométrica](owner-responsive-geometry-2026-10-10.md), [media](owner-responsive-media-2026-10-10.md). La matriz de44 tamaños del lote anterior es histórica: no se presenta como una nueva ejecución sobre esta revisión.

## Archivos y propósito

- `src/App.jsx`: punto activo/etiqueta únicos y clase de superficie de landing.
- `src/sections/desktop/Inicio.jsx`: logo en fila propia centrada.
- `src/styles/index.css`, `src/styles/utilities.css`: fondo compartido, márgenes móviles, flotantes suaves y target44px.
- `src/features/catalog/pages/CatalogPage.tsx`: acceso persistente a filtros y cleanup de listeners.
- `src/features/assistant/model/useFloatingSurface.ts`: coordenadas libres de controles flotantes y estabilidad al cargar fuentes/mostrar controles.
- `src/features/quote/components/QuoteRequestForm.tsx`: gap de Cantidad.
- Script, auditoría y sección11 del cambio OpenSpec: evidencia/seguimiento de la revisión.

Los resultados de APIs comerciales son mocks explícitos; no acreditan entrega n8n/correo. Persisten las tareas externas de aceptación, Apple/Safari físico, JSON y dominio/hosting del encargo original. Esta ronda no modifica endpoints, consultas, contratos, disponibilidad ni archivos de medios.

## Entrega Git

Correcciones y evidencia publicadas en `3183896` sobre `main`, push confirmado a `origin/main` desde9163d35. El seguimiento de la ronda se cierra en un commit documental posterior; las tres tareas externas de la sección10 permanecen pendientes. Servidor local propio detenido y contextos/datos de navegador de pruebas descartados. Entradas ajenas de skills preservadas y excluidas de los commits.
