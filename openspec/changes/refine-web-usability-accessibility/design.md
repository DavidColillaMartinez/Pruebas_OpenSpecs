## Context

Esta etapa sucede a `audit-harden-repo-seo-security`. El claro existente, aprobado visualmente por el propietario, es la referencia. La revisión anterior no justifica reescribir navegación o asumir resueltos todos los casos de teclado, errores o responsive. El propietario atribuyó el caret general al modo F7 del navegador; no se tratará ese síntoma como un defecto pendiente de la web.

La queja específica de apariencia es la burbuja del asistente sobre la fotografía de Inicio desktop. En Quiénes somos y otras superficies el propietario quiere conservar el blur. El contenedor narrativo `fixed inset-0 hidden overflow-hidden md:block` no debe rediseñarse para resolverlo.

## Goals / Non-Goals

**Goals:** recorridos sin pérdida de estado, controles accesibles, cero recortes accidentales, recuperación útil y mejoras de rendimiento medibles; corrección contextual de la bienvenida.

**Non-Goals:** rediseño de landing, navegación lateral, comparador o medios; refactor obligatorio de overlays; migración masiva de tipos; cambios de contratos/precios; suprimir selección de texto o caret browsing para ocultar un problema ya identificado como F7.

## Decisions

### D1. Gate de entrada y baseline visual

Consumir el informe de la primera etapa y comprobar que no quedan bloqueos críticos/altos locales. Leer especificaciones actuales si se archivaron antecedentes. Antes de editar, registrar git status, ejecutar checks y capturar claro en escritorio/móvil para cada superficie afectada. Declarar archivos del lote; si supera cinco, explicar alcance y detenerse hasta acordarlo.

### D2. Recorridos antes que páginas aisladas

Inventariar navegación interna/directa/Atrás/Adelante, retorno de catálogo, carga progresiva, variantes, selección, cantidades y presupuesto. El asistente comparte estado entre rutas; verificar apertura/cierre, borrador, productos/acciones, persistencia, nueva conversación, respuestas tardías, retry, 10–20 turnos y no apertura automática del teclado móvil.

Pruebas de envío se ejecutan con upstream controlado en local/test, no generando solicitudes reales. Errores externos no se ocultan con demo. La aceptación visual anterior del propietario no sustituye verificar nuevos cambios.

### D3. Burbuja localizada, sin retirar blur globalmente

Primero inspeccionar la clase `bg-white/96`, CSS compilado y estilo calculado; un token no emitido es una hipótesis que se demuestra, no un diagnóstico automático. Comprobar composición de transparencia, contraste, backdrop-filter y stacking sobre Inicio frente a Quiénes somos.

La corrección debe activarse solo cuando la bienvenida esté sobre la superficie fotográfica de Inicio. Reutilizar el capítulo/ruta activa o una señal visual ya disponible; evitar un segundo sistema de navegación. No convertir todo el widget a blanco opaco ni cambiar el contenedor narrativo. Comparar pixel/estilos de las otras superficies y comprobar transición al navegar/scroll mientras la burbuja sigue visible.

Conservar aparición por sesión, cierre, temporización, apertura y foco salvo bug funcional demostrado. Revisar esos comportamientos frente a los requisitos anteriores: los tests verdes no prueban por sí solos que el retraso inicial o la persistencia tras auto-ocultación sean correctos.

### D4. Accesibilidad funcional

Usar WCAG 2.2 AA como objetivo de evaluación sin afirmar certificación. Comprobar nombres/roles, encabezados por ruta, foco visible y no oculto, orden de tabulación, lector de pantalla, anuncios de cambios, contraste, errores asociados a inputs y controles táctiles principales de 44 px.

Revisar overlays combinados, Escape único, restauración y scroll lock sin desbloquear otro overlay. Compartir lógica únicamente si una reproducción demuestra inconsistencia; comparar comportamiento antes/después, preservando navegación lateral y semántica del menú.

### D5. Matriz responsive, no breakpoints por dispositivo

Matriz heredada: 320x568, 360x800, 375x812, 390x844, 414x896, 430x932, 480x800, 568x320, 667x375, 768x1024, 820x1180, 912x1368, 1024x768, 1280x800, 1440x900, 1920x1080, 2560x1440, 3440x1440 y 3840x2160.

Comprobar geometría en todas; interacciones completas al menos en móvil estrecho, landscape, tablet y desktop. Registrar navegador/emulación y no equiparar emulación con teclado virtual o safe areas reales. Usar `min-w-0`, wrapping y dimensiones fluidas demostradas necesarias; un carrusel interno no autoriza overflow del documento. No ocultar defectos con `overflow-x:hidden` global.

### D6. Rendimiento y mantenimiento medidos

Medir carga/respuesta/estabilidad en condiciones repetibles antes/después; registrar LCP/CLS y evidencia de interacciones, diferenciando medición de laboratorio de INP real. Examinar prioridades/lazy-load, caché pública, recursos y trabajo JS. Mantener media proporcionada, no re-encode ni crop. Revisar scripts para que archivos nuevos estén realmente cubiertos por lint/typecheck; no llamar comprobado lo excluido.

## Risks / Trade-offs

- [El selector de contexto de burbuja altera navegación] → Leer estado existente; pruebas sobre capítulos y rutas, sin modificar cómo se navega.
- [Ajustes globales rompen claro aprobado] → Lotes pequeños y comparación de zonas afectadas y no afectadas antes/después.
- [No hay navegador disponible] → Preparar pruebas reproducibles, registrar bloqueo visual y mantener esas tareas pendientes; jsdom no mide layout.
- [Un defecto requiere tocar Vision/CompareSlider o assets] → Documentar y pedir excepción concreta; no hacerlo como limpieza colateral.
- [Refactor compartido cambia foco o locks] → Solo si resuelve un fallo; pruebas de apertura simultánea y cierre en ambos órdenes.

## Migration Plan

Gate anterior → baseline → informe `docs/audit/web-usability-review.md` → correcciones por hallazgo y lote → pruebas y matriz clara → referencia congelada para tema oscuro. Sin commits/push/deploy implícitos. Reversión selectiva con target y backup acordados si se solicita.

## Open Questions

- Herramientas de navegador y disponibilidad de Safari/iOS/Android real al aplicar: registrar cobertura exacta y carencias.
- Si la opacidad de bienvenida procede de CSS no generado o composición real: resolver con estilo calculado antes de elegir parche.
- Excepciones a zonas protegidas: ninguna concedida para esta etapa; pedir aprobación específica si aparece un bloqueo.
