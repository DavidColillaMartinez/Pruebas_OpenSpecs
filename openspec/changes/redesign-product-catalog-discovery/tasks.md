## 1. Revision, baseline y primer checkpoint

- [x] 1.1 Ejecutar `git status` y registrar como preexistentes `assets/Boceto/Imagen_Original.png`, `public/boceto-final.png`, `assets/Catalogo/**` y el cambio no relacionado en `fix-vercel-catalog-api-routing/tasks.md`; mantenerlos fuera de parches y commits.
- [x] 1.2 Crear `docs/catalog-discovery-review.md` con la lista de documentos/componentes revisados, autoridad de decisiones, sistema visual implementado, contrato actual, campos disponibles y gaps de facets/sort/conteos.
- [x] 1.3 Establecer la referencia de diseno desde el codigo: CSS/tokens implementados, secciones de landing, componentes reales y pautas de los `.md` del proyecto; la comprobacion visual la realiza el propietario, no se requieren capturas manuales para avanzar.
- [x] 1.4 Confirmar que la fase de implementacion propuesta esta dividida en bloques de maximo cinco archivos; detenerse antes de cualquier ampliacion no prevista.
- [x] 1.5 Ejecutar `openspec validate --all`, revisar status/diff/historial, stagear solo este OpenSpec y la revision, y crear el commit local de seguridad de fase 1 sin push.

## 2. Scroll nativo aislado

- [x] 2.1 Hacer que `LandingPage` añada y limpie una clase de body propia durante su ciclo de vida, reutilizando el efecto existente sin cambiar layout ni navegacion.
- [x] 2.2 Limitar la media query `overflow:hidden; height:100svh` a esa clase de landing y conservar defaults nativos para todas las demas rutas y reduced motion.
- [x] 2.3 Añadir pruebas de montaje/cleanup que demuestren bloqueo exclusivo de `/`, scroll disponible tras desmontar y ausencia de listeners narrativos en producto.
- [ ] 2.4 Validar por codigo y pruebas `/`, `/productos` y `/productos/:slug` en desktop grande, 1024x720, tablet y mobile con contenido corto/largo; confirmar que la landing permanece visual y funcionalmente identica (revision visual del propietario).
- [x] 2.5 Ejecutar tests, lint, typecheck y build; revisar status/diff/staged/historial y crear el commit local de seguridad `scroll` sin push.

## 3. Trazabilidad 467/465/439/433/192/190 y gate de contrato

- [x] 3.1 Auditar en solo lectura el paquete protegido: registros, IDs unicos, variantes, imagenes, publication status, categorias, proveedores, duplicados y excluidos, sin modificar `assets/Catalogo/**`.
- [x] 3.2 Capturar por GET el listado publico sin filtros y todas sus paginas: limit solicitado/efectivo, offset, `items.length`, `pagination.total`, IDs/slugs unicos y productos descartados por normalizacion; no ejecutar POST.
- [ ] 3.3 Obtener del propietario o acceso read-only las consultas/import logs que acrediten total importado, unicos, variantes, activos, publicables y rechazos, sin copiar credenciales.
- [ ] 3.4 Obtener la definicion/condiciones de la vista o consulta publica y el workflow GET de productos, identificando filtros por defecto, joins, agrupacion de variantes y limite maximo.
- [ ] 3.5 Construir en `docs/catalog-publication-audit.md` un waterfall mutuamente excluyente con inactivos, no publicables, imagen, datos minimos, reglas proveedor/familia, duplicados, variantes agrupadas y otros motivos reales.
- [ ] 3.6 Demostrar matematicamente la relacion entre importacion, vista publica y `pagination.total`; marcar 465/433/192 como snapshots no confirmados si no puede probarse su fuente/version.
- [x] 3.7 Auditar mediante GET los parametros actuales (`search`, category/supplier IDs, subcategory, collection, product_kind, finish, measure, limit, offset) y registrar case sensitivity, multivalor, AND/OR y maximos.
- [x] 3.8 Auditar campos fiables para relevance, nombre, fecha publica, novedad, ventas y destacado editorial; documentar exactamente tabla/campo/proceso necesario para cada opcion no disponible.
- [ ] 3.9 PENDIENTE DE CONFIRMACION DEL PROPIETARIO: presentar el informe y detener cualquier cambio Neon/n8n/publicacion hasta recibir aprobacion explicita de cifras y contrato.
- [ ] 3.10 Tras aprobacion, ejecutar validaciones, revisar diff/staged/historial y crear el commit local de seguridad `auditoria/contrato` sin push.

## 4. Contrato backend minimo y reversible

- [ ] 4.1 Exportar/versionar como respaldo la definicion actual del workflow GET y la vista/consulta publica antes de editar sistemas externos; registrar referencia de rollback sin secretos.
- [x] 4.2 Definir en `docs/catalog-api-contract.md` request params repetidos, semantica OR/AND, `include_facets`, shape de facets/counts, sorts soportados y tie-breaker estable.
- [x] 4.3 Preferir ampliar `GET /api/catalog/products` con `facets` y `sort`; si se requiere `/facets`, detenerse y proponer un cambio backend separado antes de tocar proxy o la regla de cuatro rutas.
- [ ] 4.4 Implementar en n8n/vista solo el contrato aprobado para counts sobre universo filtrado, `name_asc`, `name_desc` y relevance si existe soporte real; no cambiar reglas de publicacion.
- [x] 4.5 Mantener recientes, novedades y mas vendidos sin implementar si faltan fecha/is_new/ventas, y no crear `featured_order` ni migracion editorial.
- [x] 4.6 Verificar solo mediante GET: facets sin filtros, search, filtros combinados, multivalor, zero results, pages, sort asc/desc, tie-breaker y total; no ejecutar quote POST.
- [x] 4.7 Confirmar que el proxy, las cuatro variables y las cuatro rutas actuales no cambian, y que bundle/respuestas no exponen n8n, webhook, webhookId ni secretos.
- [ ] 4.8 Actualizar evidencia/contrato, ejecutar validaciones y crear el commit local de seguridad `backend-contract` sin push.

## 5. Modelo, cliente y query tipada

- [x] 5.1 Ampliar los tipos de listado con campos publicos demostrados, facets, sort metadata y pagination validada, sin alterar `ProductDetail`, variantes ni quote snapshots.
- [x] 5.2 Normalizar value/label/count, dimensiones opcionales, sorts soportados y errores de contrato; distinguir respuesta vacia valida de payload inutilizable y registrar items descartados sin filtrar secretos.
- [x] 5.3 Ampliar `getProducts` para parametros repetidos y una query tipada, manteniendo exclusivamente `/api/catalog/products` y cancelacion por AbortSignal.
- [x] 5.4 Añadir pruebas de normalizacion, pagination, facets, query arrays, unknown values, invalid contracts, abort externo y ausencia de campos tecnicos en modelos de presentacion.
- [x] 5.5 Ejecutar regresion completa de cliente/detalle/quote mockeado, lint, typecheck y build; revisar diff/staged/historial y crear el commit local `catalog-contract-client` sin push.

## 6. Estado URL, debounce y coordinacion de requests

- [x] 6.1 Crear un modulo `catalogQuery` que parsea/serializa search, facetas repetidas, sort y page con defaults y validacion contra facets/sorts disponibles.
- [x] 6.2 Crear un hook/controlador route-local que aplica debounce de 300 ms, resetea page al cambiar criterios y cancela/ignora batches obsoletos.
- [x] 6.3 Implementar carga de chunks 0..page-1, deduplicacion por ID, total real, error inicial/adicional y reintento sin descargar todo el catalogo por defecto.
- [x] 6.4 Añadir pruebas de URL compartible, recarga, Back/Forward, filtros combinados, debounce, carreras, reset de pagina, chunks y errores parciales.
- [x] 6.5 Ejecutar validaciones, revisar diff/staged/historial y crear el commit local `catalog-query-state` sin push.

## 7. Shell visual y tiles de producto

- [x] 7.1 Rediseñar `CatalogPage` con encabezado, retorno a AREA LRMQ, h1, texto breve, total, landmarks y slots para controles/resultados, sin tocar la ficha.
- [x] 7.2 Extraer una tile route-local cardless: enlace completo, pozo stonewash, `object-contain`, ratio estable, lazy loading, nombre y metadata publica util.
- [x] 7.3 Implementar fallback `Imagen no disponible`, error de imagen y dimensiones cuando existan, sin reemplazar/cropear/re-encodear media.
- [x] 7.4 Implementar estados loading inicial, error/retry sin reload, catalogo vacio, cero resultados, carga adicional, error adicional y fin.
- [x] 7.5 Añadir pruebas de jerarquia, links codificados, alt/fallback, estados y ausencia de precio/badges inventados.
- [ ] 7.6 Revisar por codigo la coherencia desktop/tablet/mobile y contraste frente a tokens y pautas `.md`; ejecutar validaciones, revisar diff/staged/historial y crear el commit local `catalog-shell-cards` sin push (revision visual del propietario).

## 8. Busqueda, filtros, facets y sort accesibles

- [x] 8.1 Crear buscador visible con label, clear y estado local inmediato conectado al debounce/URL.
- [x] 8.2 Crear filtros desktop con fieldsets/legends y opciones dinamicas value/label/count; no renderizar dimensiones ausentes o inconsistentes.
- [x] 8.3 Crear drawer/dialog mobile con target minimo 44 px, foco inicial, Escape, foco de retorno y restauracion exacta del overflow al cerrar/desmontar/navegar.
- [x] 8.4 Crear resumen de filtros activos, retirada individual y `Limpiar filtros`, anunciando resultados sin mover foco inesperadamente.
- [x] 8.5 Crear selector sort separado: relevance condicionado, nombre asc/desc reales y recientes/novedades/mas vendidos disabled con `Proximamente` accesible.
- [x] 8.6 Añadir pruebas de teclado, labels, focus, drawer, active filters, clear, counts, zero-count, multiseleccion y sorts disabled/enabled.
- [ ] 8.7 Revisar por codigo desktop/tablet/mobile/reduced-motion frente a tokens y pautas `.md`; ejecutar validaciones y crear el commit local `catalog-filters-sort` sin push (revision visual del propietario).

## 9. Cargar mas y retorno desde ficha

- [x] 9.1 Crear control `Cargar mas` accesible con loading, aria-controls, progreso `Mostrando X de Y`, retry y final de resultados.
- [x] 9.2 Mantener items previos y actualizar `page` al anexar el siguiente offset sin duplicados ni resort cliente.
- [x] 9.3 Restaurar query, paginas cargadas y scroll al volver desde `/productos/:slug` despues de rehidratar los chunks necesarios.
- [x] 9.4 Añadir pruebas de limites, total, deduplicacion, reload page=N, error adicional, Back desde ficha y fin.
- [ ] 9.5 Revisar por codigo paginas con pocos/muchos resultados y retorno en desktop/mobile; ejecutar validaciones y crear el commit local `catalog-load-more` sin push (revision visual del propietario).

## 10. Regresion, evidencia y entrega controlada

- [x] 10.1 Ejecutar `corepack pnpm install --frozen-lockfile`, tests, lint, typecheck, build, `openspec validate --all` y escaneo del bundle para secretos/upstreams.
- [ ] 10.2 Validar por codigo landing desktop/mobile: layout, header, Tienda, narrativa, Vision swipe/replay, media y reduced motion sin regresiones (revision visual del propietario).
- [ ] 10.3 Validar por codigo `/productos`: search, facets, sort, drawer, URL, cargar mas, estados, teclado, foco, contraste y overflow horizontal (revision visual del propietario).
- [x] 10.4 Validar dos slugs, direct reload, not-found, galeria, variantes, quote mockeado y scroll de ficha sin cambiar su diseño ni enviar POST real.
- [ ] 10.5 Documentar por codigo los cambios aplicados solo en `/productos` y el scroll compartido aprobado; el propietario confirma visualmente.
- [ ] 10.6 Finalizar `docs/catalog-publication-audit.md` con ecuaciones, consultas/vistas/workflow, exclusiones y campos necesarios para futuras opciones.
- [x] 10.7 Confirmar que assets protegidos y tareas pendientes de `implement-product-detail-page`, routing y landing permanecen intactos y fuera de commits.
- [ ] 10.8 Revisar todos los commits de fase y presentar pagina, pruebas, informe 467/465/439/433/192/190 y plan de rollback al propietario.
- [x] 10.9 PENDIENTE DE AUTORIZACION DEL PROPIETARIO: no hacer push hasta recibir aprobacion visual, del informe y de los commits incluidos.
- [ ] 10.10 Tras push autorizado, verificar deployment Ready y GET de config, listado/facets/sorts, dos slugs y 404 inexistente; no ejecutar POST real.

## Seguimiento solicitado por el propietario (fuera del recuento original de 66)

- Filtros iniciales derivados del universo público completo y recalculados por firma de búsqueda/filtros mientras el API no entregue `facets` server-side.
- Taxonomía global de filtros conservada al aplicar una query, con counts activos mezclados sin eliminar grupos no presentes en la respuesta filtrada.
- Categorías de filtros convertidas en acordeones clicables y compartidos entre desktop y drawer mobile para reducir carga visual sin perder accesibilidad.
- Drawer móvil alineado con la superficie blanca de la landing y enlace `Tienda` route-local hacia `/productos`.
- Selector de variantes conectado a imágenes específicas solo cuando el API proporciona el mapping; fallback conservador a imágenes del producto.
- Ofertas comerciales con tipo, referencias, acabados y aviso explícito cuando no existe imagen propia publicada.
- Zoom accesible desde la imagen principal y vuelta a resultados con query/scroll preservados.
- Asset explícito de Vision actualizado en `public/boceto-final.png`.
- Revisión visual desktop/mobile y publicación permanecen pendientes porque el entorno actual no dispone de navegador y el propietario debe validar la apariencia antes del push.
