# Área LRMQ — cocina GME y correcciones del catálogo

Fecha: 19/10/2026. Repositorio: DavidColillaMartinez/Pruebas_OpenSpecs.
Base revisada: ba5efca65ce9f8d94ff314d88c6d23caec076411.

## Estado de la entrega

Código integrado en el repositorio: cambios sin commit ni push. La base de datos se mantiene; no se implementa la migración a JSON. Los JSON del paquete son datos de importación y pruebas, no una nueva fuente de datos de la web. OpenCode no ha aplicado SQL en producción: `010-corrections.sql`, `020-kitchen-import.sql` y la verificación `030-verify.sql` quedan pendientes para Codex tras releer el estado real.

Evidencias aportadas por el usuario y recogidas de la integración anterior, no repetidas en esta revisión: imágenes subidas al VPS por David y verificadas por HTTP y SHA-256 (47/47, 20/10/2026); revisión en Chromium de escritorio y móvil con API simulada en local. Esta última informa de comprobaciones funcionales correctas y diferencias de píxeles de la landing y del detalle de Alba dentro del ruido de render de la propia base (18/19 comprobaciones estrictas; la igualdad exacta de Alba móvil falla también en base contra base). No constituye validación de endpoints reales. Pendientes: Safari/macOS, entorno real del propietario, Basic de bañera y presupuesto en navegador, revisión de todas las referencias, SQL en producción, despliegue y comprobación de endpoints tras despliegue.

## Integración del 20/10/2026

- Resultados registrados de la integración anterior: typecheck sin errores; lint con 0 errores y 10 avisos existentes; pruebas: 66 archivos, 608 superadas y 1 omitida (606 del paquete más 2 de regresión añadidas en la integración); build correcto, incluido `package:seo`.
- Dos fallos de integración corregidos con prueba de regresión: la faceta `tap_scope` se descartaba en `normalizeFacets`, y el chip de «Filtros activos» no mostraba el ámbito porque `CatalogPage` no pasaba los filtros al calcular las claves visibles.
- Cambio fuera de cocina: en tarjetas de otras familias sin GME IO el subtítulo pasa de la colección a la subcategoría (Espejos Manillons: «Alba» → «Circular», «Basic» → «Canto recto»). Pendiente de confirmación del propietario o de acotarlo a GME IO.

## Revisión focalizada del 20/10/2026 — ejecución actual

- Revisados `AGENTS.md`, estado Git y los artefactos del cambio OpenSpec. La alias `tap_scope: 'tap_scope'` y `getDisplayCatalogFilterKeys(filterProfile, query.filters)` ya estaban aplicados; no se han duplicado. El formato real documentado en `tap-scope-verification.json` usa `tap_scope`, sin necesidad de alias especulativas.
- Prueba de conservación de la faceta trasladada del contrato de cocina a `normalize.test.ts`, conservando valores, etiquetas y recuentos de Baño/Cocina. La prueba existente de `CatalogPage` se refuerza: el chip «Grifería de cocina» desaparece al pulsarlo, se elimina `tap_scope` de la URL y se conservan proveedor, categoría y familia.
- Node 24.22.0. Pruebas afectadas: 5 archivos, 82/82 superadas (`normalize`, contrato cocina, `CatalogPage`, `catalogQuery` y `CatalogFilterPanel`).
- Primera suite completa, ejecutada en paralelo con typecheck/lint/build: 607 superadas, 1 fallida y 1 omitida. Falló el cambio de foto a Negro en `ProductDetailPage.gmeIo.test.tsx`. Ese archivo pasó después aisladamente (3/3); la repetición completa sin build simultáneo pasó: 66 archivos, 608 superadas y 1 omitida (609). No se ha modificado la galería ni esa prueba; el fallo inicial queda registrado, sin atribuirle una causa confirmada. La suite emite avisos de jsdom sobre `HTMLMediaElement.pause()`.
- `pnpm typecheck`: correcto. `pnpm lint`: 0 errores y 10 avisos preexistentes. `pnpm build`: correcto, incluido `package-seo ok: sandbox render ok`; avisos de Vite por tiempo de plugin CSS y deprecación de `inlineDynamicImports`.
- No se ha repetido la revisión de assets ni Chromium; se conservan como evidencias aportadas, sin presentarlas como ejecuciones actuales. No hay validación visual nueva en esta revisión. Las comprobaciones de Safari/macOS, Basic de bañera/presupuesto en navegador, SQL en producción, despliegue y endpoints posteriores permanecen pendientes.

## Contenido terminado

- 11 productos de cocina, 23 referencias/acabados y 47 WebP extraídos de las imágenes originales del PDF. Son 11 portadas, 23 recortes para selectores y 13 fotos adicionales: 24 fotos grandes en total. Sin imágenes inventadas ni ampliación artificial.
- Una portada explícita por producto en covers.csv y covers.json. La primera foto del primer acabado es la portada; al seleccionar manualmente otro acabado se activa su foto grande. Los selectores usan el recorte del acabado, nunca sustituyen la foto grande.
- Sirio: se retira de la oferta pública el producto independiente de maneta de una función, conservando la ducha completa y todos los registros históricos. No se mezclan referencias de manetas con duchas.
- Basic de bañera: 28 fotografías existentes vinculadas a sus combinaciones exactas, verificadas contra el PDF de mamparas. Se conserva toda la galería. Siete combinaciones válidas carecen de fotografía exacta publicada: se informa al usuario y se mantiene su selección para presupuesto. No se les atribuye una imagen de otro acabado.
- Nueve productos con nombres ambiguos (Basic, Glass, Open, Screen) distinguidos por tipo; IDs, slugs, colecciones y referencias se conservan. No quedan nombres exactos duplicados en la consulta revisada.
- Tarjetas: el subtítulo muestra el tipo de producto (subcategoría) cuando existe. El efecto en otras familias se describe en la sección de integración.
- Añadido el filtro de ámbito «Tipo de grifería» después de elegir la familia «Grifería»: «Grifería de baño» o «Grifería de cocina». Los recuentos en la rama aislada son 24 y 11. El selector permanece con ambas opciones tras elegir una; Duchas no se mezcla. Parametrización `tap_scope=bano|cocina` pasa por la allowlist del proxy al SQL del n8n.
- Según `tap-scope-verification.json` aportado en el paquete, Codex publicó la actualización compatible de consulta/preparador n8n en el workflow `9MSdynqs37UrCIbu`; la ejecución de producción `7702` devolvió Baño=24 con `tap_scope=bano`. OpenCode no ha repetido esa comprobación ni modificado el workflow en esta revisión; la verificación completa tras despliegue sigue pendiente.

## Fidelidad al PDF

Fuente: CATALOGO GRIFERIA IO by GME 2026(1).pdf, SHA256 29016b90540277b52d737d972f659dff375188d3decaac4e6e03dceb4e24cb11.
Las páginas 311–330 son las del visor PDF; pueden diferir del folio impreso. La maneta Sirio está en la página de visor 259.

Silver es el modelo; su acabado real es Cromo, ref. 3145. «Osmosis» se trata como familia: Extraíble (Acero 3230, Acero/Negro 3231) y Acero (3137), sin inventar un tercer producto genérico. Noah tiene cinco acabados; Round y Quadra dos; Extraíble Round seis. Resto y referencias en kitchen-variants.csv.
Alexia: el texto técnico del PDF indica sistema abatible 90º, mientras que el dibujo de detalle rotula 180º y giro 360º. Se conserva el texto y el dibujo originales sin resolver esa discrepancia del fabricante; no prometer un ángulo distinto al publicado en el texto.
Se conserva «Acero cepillado» como etiqueta comercial usada por el catálogo actual; el texto exacto del PDF y el origen de cada imagen se guardan en datos/metadatos. No se añaden precios, Puntos, stock ni componentes no acreditados. Resolución limitada a la imagen nativa del PDF.

## Pruebas realizadas

- Resultados históricos del paquete (no la suite final de esta revisión): 66 archivos, 606 pruebas superadas, una omitida (607). Prueba de contrato regenerada: 13/13.
- TypeScript correcto; lint sin errores (10 avisos existentes); build correcto incluido SEO SSR, según la entrega original.
- Rama aislada br-weathered-moon-ag3rn830: 161 productos públicos = 151 anteriores - 1 maneta Sirio + 11 cocina; 23 variantes nuevas; 28 mapas exactos Basic; 7 sin foto; 0 nombres duplicados; 0 precios nuevos.
- Consulta real del workflow de listado: ámbito Baño devuelve 24, Cocina 11 y sus facetas conservan ambas alternativas; filtro Round+cocina 1, Oro+cocina 2, Cromo+cocina 8. Tipo cocina devuelve 11. Sección Duchas: 17.
- Consulta real de detalle: 11 fichas nuevas y Basic normalizadas contra el frontend; cada acabado seleccionable tiene miniatura y fotografía grande coherentes. Se comprueban también IDs y referencias en la construcción del presupuesto, sin enviar mensajes ni presupuestos reales.
- Integridad: productos y variantes ajenos al alcance, enlaces e imágenes originales mantienen sus hashes. Evidencia en integrity-verification.json.
- Vuelta atrás ejecutada en rama hija br-spring-grass-agftzg2t: recupera 151 productos públicos y contenidos anteriores. updated_at cambia por el trigger de auditoría existente. No se borra ningún registro.

Los resultados de ramas, consultas, integridad y retorno anteriores proceden de las evidencias del paquete; no se han repetido ni se ha conectado a Neon/n8n en esta revisión. Proyecto Neon registrado: polished-moon-35278349. Producción de referencia: br-floral-band-agkr5fnt (solo leída según el paquete). Las ramas de pruebas figuraban disponibles en la entrega; su disponibilidad actual no se ha comprobado.

## Aplicación por OpenCode

Procedimiento de entrega para las operaciones pendientes; no es un registro de ejecución de esta revisión. La integración local ya está aplicada. La publicación n8n comunicada por Codex debe contrastarse con el estado actual antes de cualquier actuación, sin repetir cambios existentes.

1. Leer OPENCODE.md y el nuevo cambio OpenSpec incluido en frontend.patch. Releer AGENTS.md y el estado actual del repositorio. No sobrescribir trabajo posterior al commit base.
2. Revisar/aplicar frontend.patch (incluye tests, fixture, auditoría y OpenSpec). Hacer primero git apply --check; si hay cambios concurrentes, integrar por archivo sin forzar. La fixture no se importa desde código de producción.
3. Revisar review/covers.png, selectors.png y gallery.png. Instalar assets/ en la raíz REAL del catálogo del VPS conservando las rutas. install_assets.py permite simulación y rechaza rutas/conflictos; no inventar un endpoint de subida.
4. Ejecutar python3 tools/verify_assets.py --origin https://assets.colilladavid.es/proyectos/lrmq/catalogo/. Deben pasar los 47 SHA256 por HTTP antes de publicar productos. No basta un HTTP 200: hay que comprobar contenido.
5. Con backend/frontend de prueba conectados a br-weathered-moon-ag3rn830 y los assets disponibles, verificar visualmente listados/fichas/selector/galería/presupuesto en escritorio y móvil. Safari macOS queda como comprobación real necesaria; Chromium no lo sustituye.
6. Para publicar en la BD actual, releer primero los registros afectados. Ejecutar con psql y ON_ERROR_STOP=1 los archivos 010-corrections.sql y 020-kitchen-import.sql, por orden; cada uno contiene BEGIN/COMMIT y guardas. No separar por punto y coma manualmente. Los SQL no son una migración de esquema y no crean tablas. No ejecutarlos automáticamente al arrancar la web. No repetir importación: las guardas detienen duplicados.
7. Releer workflow 9MSdynqs37UrCIbu. Aplicar conjuntamente los cambios protegidos de n8n-list-products-scope-change.json: nodo preparador (código esperado en n8n-list-products.prepare.js; añade tap_scope como parámetro $31) y nodo Consultar productos (faceta y filtro tap_scope, junto al rótulo «Grifería»). Los hashes se refieren a la versión sin modificar; si cambiaron, revisar y fusionar sin reemplazar el workflow entero. No tocar otros nodos, flujos, credenciales u opciones. Mantener ambas opciones de ámbito en la faceta incluso después de seleccionar una.
8. Ejecutar 030-verify.sql y comprobar HTTP real de listado/detalle, filtros y navegación. Con el mismo estado de partida, deben verse 161 públicos y 11 de cocina. Si producción cambió entretanto, recalcular el total esperado y comprobar los IDs concretos.
9. Revisar escritorio/móvil, transición categoría→Familia Grifería→Tipo de grifería (Baño/Cocina), ambas alternancias, filtros de tipo de grifo y Duchas, selección de todas las referencias de cocina y Basic, nombres, portada inicial y presupuesto. No enviar emails/WhatsApp reales sin autorización específica. Solo entonces completar las casillas pendientes de OpenSpec y seguir el flujo de publicación del proyecto. No hacer push sin indicación del usuario.


## Subir imágenes al VPS

Primero identifica la configuración servida (consulta de solo lectura): `ssh "$VPS" "sudo nginx -T 2>/dev/null | grep -n -A12 -B5 assets.colilladavid.es"`. Busca el `root` o el `alias` de `/proyectos/lrmq/catalogo/`. Si la salida está vacía, revisa el servicio web/contenedor real; no deduzcas la ruta física a partir del dominio.

La ruta pública registrada es `https://assets.colilladavid.es/proyectos/lrmq/catalogo/`; dentro de ella los archivos conservan rutas como `images/gme_griferia/io-2026/...`. El repositorio no registra el alias SSH, el usuario ni la ruta física del servidor. No uses la URL pública como ruta de disco: obtén el alias/usuario SSH y resuelve el destino con la configuración de Nginx/Apache del VPS antes de aplicar.

Ejemplo desde el equipo local (reemplaza `VPS_ALIAS` por tu alias de `~/.ssh/config` o `usuario@host` y `CATALOGUE_ROOT` por el `root`/`alias` real servido en `/proyectos/lrmq/catalogo/`):

```bash
PACKAGE="$HOME/Downloads/AreaLRMQ-griferia-cocina-filtro-bano-20261020.zip"
VPS="VPS_ALIAS"
STAGE="/tmp/lrmq-catalog-assets-20261020"
CATALOGUE_ROOT="/RUTA/REAL/DEL/CATALOGO"
scp "$PACKAGE" "$VPS:$STAGE.zip"
ssh "$VPS" "mkdir -p '$STAGE' && unzip -q '$STAGE.zip' -d '$STAGE'"
ssh "$VPS" "python3 '$STAGE/AreaLRMQ-griferia-cocina/tools/install_assets.py' '$CATALOGUE_ROOT'"
ssh "$VPS" "python3 '$STAGE/AreaLRMQ-griferia-cocina/tools/install_assets.py' '$CATALOGUE_ROOT' --apply"
ssh "$VPS" "python3 '$STAGE/AreaLRMQ-griferia-cocina/tools/verify_assets.py' --origin https://assets.colilladavid.es/proyectos/lrmq/catalogo/"
```

La primera ejecución simula; la segunda instala sin reemplazar archivos de distinto hash. Si el destino necesita privilegios, ejecuta el instalador con `sudo` solo después de confirmar la ruta. No continúes a SQL/activación de productos si falla la última comprobación HTTP/SHA.

## Retorno

090-rollback.sql revierte las correcciones y archiva los productos nuevos, conservando datos para trazabilidad. Comprueba que los registros antiguos afectados no hayan cambiado después del parche. No ejecutar a ciegas si hay ediciones posteriores de los productos nuevos: revisar primero esas filas y la importación. El trigger actual registra la fecha de restauración en updated_at. El retorno no retira archivos estáticos ni revierte código/n8n: para estos usar el diff inverso del cambio y restaurar el SQL y el preparador n8n anteriores con una revisión previa. Las rutas nuevas no sustituyen archivos antiguos.

## Archivos

- frontend.patch: código, pruebas, fixture y documentación para el repositorio.
- assets/: 47 archivos para la raíz del catálogo; image-manifest.json: rutas, dimensiones, huellas y origen PDF.
- covers.csv/json, kitchen-variants.csv, basic-image-map.csv: correspondencias explícitas.
- catalogue-import.json y catalogue-repairs.json: datos auditables; SQL 010/020: aplicación.
- 030-verify.sql / 090-rollback.sql y evidencias JSON: verificación y retorno probado.
- tools/extract_kitchen.py: reproducir extracción con --pdf y --output; requiere PyMuPDF y Pillow. No incluye el PDF original, ya aportado por el usuario.

Quedan fuera: migración JSON, eliminación de BD/flujos, bot, landing, responsive general, dominio y hosting. No se dan por completadas tareas antiguas de otros cambios OpenSpec.
