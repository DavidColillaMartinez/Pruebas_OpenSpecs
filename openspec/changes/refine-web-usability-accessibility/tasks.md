## 1. Entrada y baseline claro

- [x] 1.1 Verificar gate e informe de `audit-harden-repo-seo-security`, leer specs actuales y registrar bloqueos; no comenzar implementación si quedan defectos críticos/altos locales pendientes de esa etapa.
- [x] 1.2 Leer AGENTS.md y git status, registrar baseline de checks y capturas claras de portada/inicio/Quiénes somos, catálogo, ficha, presupuesto, 404 y asistente; identificar herramientas de navegador disponibles.
- [x] 1.3 Abrir `docs/audit/web-usability-review.md` con matriz de recorridos/19 viewports, checklist WCAG aplicable y lotes de archivos; explicar y detener cualquier lote UI de más de cinco archivos hasta acordar alcance.

## 2. Burbuja sobre Inicio

- [x] 2.1 Comprobar CSS generado y estilos calculados de la bienvenida (`bg-white/96`, opacidad, blur, capas y contraste) sobre Inicio fotográfico y Quiénes somos; registrar la causa reproducida.
- [x] 2.2 Implementar el ajuste mínimo específico al contexto fotográfico de Inicio conservando blur/apariencia fuera de él; no modificar imagen, contenedor narrativo o navegación lateral.
- [x] 2.3 Verificar la burbuja al cambiar de capítulo/ruta mientras sigue visible, en móvil/PC, con cierre/apertura, foco y reduced motion; comparar antes/después de Inicio y de las zonas que no debían cambiar.

## 3. Recorridos y recuperación

- [x] 3.1 Recorrer catálogo → ficha → resultados mediante enlace y Atrás/Adelante/recarga; corregir pérdidas demostradas de filtros/orden/posición sin alterar contratos.
- [x] 3.2 Recorrer variantes → cantidades → presupuesto y errores/éxito con upstream local controlado; corregir duplicados o pérdida evitable de campos/selecciones conservando payloads y validación comercial.
- [x] 3.3 Probar chat con 10–20 turnos, texto/productos/acciones, scroll manual, nueva conversación con borrador/respuesta pendiente, retry y recarga; corregir fallos de continuidad y verificar apertura móvil sin teclado automático.
- [x] 3.4 Revisar la bienvenida por sesión y su retraso/auto-ocultación/pausa/descarte y el botón volver arriba en portada/catálogo; corregir solo discrepancias demostradas respecto a comportamiento acordado.
- [x] 3.5 Verificar rutas directas/404, imágenes fallidas, storage bloqueado y fallos de carga diferida; corregir pantallas vacías o estados sin recuperación sin introducir demo en producción.

## 4. Accesibilidad y consistencia

- [x] 4.1 Auditar teclado, foco visible/no oculto, encabezados, nombres/roles y lector de pantalla de todas las rutas; corregir defectos con comprobaciones dirigidas.
- [x] 4.2 Auditar y corregir contraste de texto/placeholders/estados, mensajes asociados a inputs, anuncios del chat y targets principales de 44 px; conservar contenido seleccionable y navegación existente.
- [x] 4.3 Reproducir foco/Escape/scroll lock al abrir y cerrar overlays en combinaciones permitidas; corregir inconsistencias y compartir lógica solo si la reproducción justifica el refactor, con pruebas de cierre en ambos órdenes.

## 5. Responsive rendimiento y cobertura

- [x] 5.1 Ejecutar matriz geométrica de los 19 viewports en las rutas/estados afectados; registrar overflow, solapes fixed/sticky, ratios y controles fuera de pantalla y corregirlos por lotes mínimos.
- [x] 5.2 Verificar zoom, ampliación de texto, landscape, teclado virtual y safe areas con navegador/dispositivo disponible; conservar como pendientes los casos que solo se hayan inspeccionado en código.
- [x] 5.3 Medir carga/respuesta/estabilidad con móvil y PC en condiciones repetibles; optimizar únicamente cuellos de botella demostrados conservando media y registrar métricas comparables después.
- [x] 5.4 Revisar scripts/globs reales de lint/typecheck y pruebas para todos los archivos afectados; corregir exclusiones de cobertura de forma acotada sin migración general de JSX/TSX.

## 6. Gate de salida hacia tema

- [x] 6.1 Ejecutar pruebas funcionales apropiadas, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y `openspec validate refine-web-usability-accessibility`; verificar regresiones de routing/contratos de la etapa anterior.
- [x] 6.2 Completar comparaciones claras nuevas por ruta en desktop/móvil, interacciones reales de Vision/comparador sin editarlos y reporte de consola; mantener abiertas las verificaciones sin navegador.
- [x] 6.3 Entregar informe con referencia clara estable para `add-manual-light-dark-theme`, hallazgos por ID, cobertura ejecutada y bloqueos; no marcar corregidas superficies por mera lectura del código.
