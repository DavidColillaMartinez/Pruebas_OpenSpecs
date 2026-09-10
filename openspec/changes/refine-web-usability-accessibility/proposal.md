## Why

La web debe mantener una experiencia consistente en móvil y PC a lo largo de todos los recorridos, no solo en páginas aisladas. El propietario confirma que le gusta el diseño claro actual y solicita corregir la mezcla de la burbuja del asistente con la fotografía del inicio, conservando el blur en las demás secciones.

## What Changes

- Segunda etapa, después de `audit-harden-repo-seo-security`; consumir su informe y resolver sus bloqueos críticos antes de ejecutar esta etapa.
- Auditar portada desktop/móvil, catálogo, fichas, presupuesto, 404 y asistente: navegación directa/Atrás/Adelante, filtros, selección, borradores, errores y recuperación.
- Corregir únicamente fallos demostrados de accesibilidad, responsive y funcionamiento, conservando navegación lateral, composición y medios.
- Revisar CSS generado y estilos calculados de la burbuja; ajustar solo su presentación sobre el inicio con fotografía, sin retirar globalmente el blur ni alterar el contenedor narrativo.
- Medir carga, respuesta y estabilidad en móvil/PC; optimizar únicamente cuellos de botella demostrados, sin cambiar media del propietario ni contratos para aparentar rapidez.
- Revisar cobertura real de lint/typecheck y patrones internos repetidos; compartir lógica solo si resuelve una inconsistencia comprobada, sin una migración general de JSX a TSX ni refactor obligatorio de overlays.
- Registrar evidencias nuevas por viewport/recorrido, distinguiéndolas de la aprobación visual anterior del propietario.

## Capabilities

### New Capabilities

- `cross-route-usable-experience`: Recorridos, conservación de estado, accesibilidad y recuperación de errores en todas las rutas.
- `contextual-chat-welcome-surface`: Corrección localizada de la burbuja sobre la fotografía del inicio, conservando blur y comportamiento en otros fondos.
- `measured-responsive-quality`: Matriz de dispositivos, rendimiento y prácticas de código sustentadas por evidencia.

### Modified Capabilities

Ninguna al crear la propuesta. `fix-responsive-chat-mobile` y otros cambios pendientes son contexto previo; reconciliar requisitos que se archiven antes de aplicar para no duplicar fuentes de verdad.

## Impact

- Potencialmente `src/App.jsx`, header/drawer, asistente, catálogo, presupuesto, rutas, estilos y tests. Cada lote UI requiere delimitar archivos; si supera cinco, explicar y detenerse antes de editar hasta acordar alcance.
- No rediseñar landing ni navegación. Preservar `CompareSlider`, Vision, imágenes, vídeos, proporciones y assets protegidos; cualquier defecto que requiera una excepción se documenta para aprobación específica.
- No cambiar APIs, proxy o lógica comercial para resolver problemas visuales. Usar respuestas controladas solo en pruebas, sin activar datos ficticios en producción.
- La salida es una base clara estable para `add-manual-light-dark-theme`, con informe, comprobaciones reproducibles y pendientes honestos. Sin commit, push o despliegue automático.
