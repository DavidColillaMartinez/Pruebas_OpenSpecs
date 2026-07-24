## Why

`/productos` sigue siendo una lista minima de 24 elementos: no usa el total real, no permite buscar, filtrar, ordenar ni continuar la exploracion, y el bloqueo global de scroll de la landing impide recorrer catalogo y ficha en escritorio. Antes de ampliar la experiencia tambien debe reconciliarse con evidencia la diferencia entre los 467 registros del paquete, los 465 mencionados, el README de 433 y los aproximadamente 190/192 productos observados publicamente.

## What Changes

- Realizar una revision documentada del sistema visual, contratos, responsive, animaciones y arquitectura desde el codigo y los `.md` del proyecto, usando la landing clara actual como referencia y no como objetivo de rediseño. La validacion visual la realiza el propietario.
- Corregir el scroll nativo de `/productos` y `/productos/:slug` mediante aislamiento del bloqueo narrativo exclusivo de `/`, sin cambiar el comportamiento de la landing.
- Rediseñar solo `/productos` como experiencia de descubrimiento profesional: encabezado, total, buscador, filtros, categorias dinamicas, ordenacion independiente, filtros activos, limpieza, grid responsive, cargar mas y estados de carga/error/vacio/sin imagen.
- Mantener las fichas enlazadas por slug y preservar `/productos/:slug`, galeria, variantes y presupuesto salvo una dependencia visual compartida imprescindible y aprobada.
- Sincronizar busqueda, filtros, ordenacion y progreso de paginacion con la URL; aplicar debounce, cancelar resultados obsoletos y consultar el conjunto completo mediante el endpoint en vez de filtrar los productos cargados en navegador.
- Definir primero un contrato server-side verificable para facetas dinamicas con valor, etiqueta y cantidad. No hardcodear taxonomias ni derivar facetas de una sola pagina.
- Implementar solo ordenaciones respaldadas por datos reales, empezando por nombre A-Z/Z-A cuando el endpoint confirme su contrato. Mantener recientes, novedades y mas vendidos deshabilitados y marcados como `Proximamente` hasta disponer de campos fiables; no inventar ventas, fechas ni popularidad.
- Auditar numericamante importacion, productos unicos, variantes, activos, publicables, vista publica, `pagination.total` y exclusiones por motivo. No cambiar Neon, n8n ni reglas de publicacion hasta que las cifras cuadren y el propietario apruebe el contrato.
- Mantener el proxy server-side, las cuatro variables actuales y el cliente relativo `/api/catalog/*`; cualquier ampliacion de facetas/ordenacion se documentara y se separara de UI antes de implementarse.
- Añadir cobertura de URL, combinacion de filtros, sorting real, limpieza, cargar mas, facetas, estados, scroll y regresion de landing/ficha, con revision por codigo y pruebas; el propietario revisa visualmente.
- Crear commits locales de seguridad por fase (auditoria, scroll, contrato, UI/filtros y pruebas/documentacion) para permitir rollback independiente. No hacer push hasta mostrar la pagina y el informe de conteos y recibir autorizacion expresa.

## Capabilities

### New Capabilities
- `catalog-discovery-experience`: composicion visual, productos, controles y estados accesibles de `/productos` en desktop, tablet y mobile.
- `catalog-query-and-pagination`: estado compartible en URL, debounce, cancelacion, combinacion de filtros, ordenacion server-side y carga incremental sobre el total real.
- `catalog-dynamic-facets-contract`: facetas calculadas sobre el universo filtrado, taxonomias no hardcodeadas y opciones de ordenacion habilitadas solo con datos fiables.
- `product-route-scroll-isolation`: scroll nativo de catalogo y ficha sin alterar el bloqueo narrativo correcto de la landing.
- `catalog-publication-traceability`: conciliacion matematica y evidencia de importacion, variantes, publicacion, vista publica, API y exclusiones.

### Modified Capabilities
- (ninguna; no existen specs raiz en `openspec/specs/`).

## Impact

- UI principal: `src/features/catalog/pages/CatalogPage.tsx`, tests y nuevos componentes/modelos locales de catalogo.
- Contrato compartido: cliente, tipos y normalizacion solo si la auditoria demuestra campos/facetas/ordenaciones reales; detalle y quote permanecen protegidos por regresion.
- Scroll: regla global de `src/styles/index.css` y ciclo de vida route-local para catalogo/ficha, sin modificar `useNarrativeScroll` ni secciones de la landing.
- Backend condicional: el GET de productos/n8n o un endpoint explicito de facetas solo despues de aprobar contrato; proxy y cuatro variables actuales permanecen intactos por defecto.
- Evidencia: nuevo informe de publicacion sin secretos, con consultas/vistas/workflows responsables y cifras reconciliadas.
- Entrega: el alcance total excede cinco archivos, por lo que se divide en fases de maximo cinco archivos y commits locales independientes; assets y media del propietario quedan fuera.
