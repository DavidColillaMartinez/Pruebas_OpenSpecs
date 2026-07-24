## Context

La landing clara actual es la referencia visual: Marcellus y Manrope, `ink` sobre superficies `porcelain/stonewash`, acento `clay` escaso, composicion editorial cardless, imagenes protagonistas y movimiento corto con proposito. `DESIGN.md` contiene decisiones historicas parcialmente obsoletas; para este cambio prevalecen `AGENTS.md`, los tokens y componentes implementados, los contratos actuales y despues la documentacion historica. La revision visual la realiza el propietario; la implementacion se guia por codigo, CSS y `.md`.

`/productos` hoy solicita solo `limit=24&offset=0`, ignora `pagination.total`, renderiza cards inline y no tiene busqueda, filtros, sorting, estados vacios ni continuacion. El GET observado acepta `search`, categoria, proveedor, subcategoria, coleccion, tipo de producto, acabado, medida, `limit` y `offset`, pero no existe un contrato publico de facetas ni sorting. El proxy ya reenvia query strings y debe permanecer intacto.

El paquete pre-DB protegido contiene 467 productos unicos y 2.620 variantes; 439 registros tienen `publication_status=publishable` y 28 mamparas no tienen estado. El total publico observado es 190. La diferencia de 277 se localiza por familias (206 accesorios, 28 mamparas, 25 grifos y 18 muebles), pero el repositorio no contiene SQL, vista publica, workflow n8n ni logs de importacion que demuestren los motivos de exclusion. Los valores 465, 433 y 192 pertenecen a fuentes no confirmadas o historicas y deben reconciliarse, no elegirse por conveniencia.

Ademas, `src/styles/index.css` aplica `body { overflow:hidden; height:100svh }` globalmente a partir de 1024x720. La landing lo necesita, pero catalogo y ficha no montan el controlador narrativo y quedan sin scroll. La solucion debe devolver la propiedad del bloqueo a `LandingPage` y mantener nativo el resto de rutas.

## Goals / Non-Goals

**Goals:**

- Convertir `/productos` en un indice de showroom util, claro y coherente con la landing, no en una tienda generica.
- Hacer busqueda, filtros, ordenacion y paginacion server-side sobre el conjunto completo, con estado compartible en URL.
- Usar facetas dinamicas con cantidades verificables y sin taxonomias hardcodeadas.
- Restaurar scroll nativo en catalogo y ficha sin modificar la experiencia narrativa de `/`.
- Entregar una conciliacion numerica exacta antes de cambiar reglas, vistas, workflow o base de datos.
- Mantener accesibilidad, responsive, reduced motion, rendimiento y estabilidad de imagenes.
- Crear un commit local de seguridad por fase y conservar rollback independiente.

**Non-Goals:**

- Rediseñar la landing, su cabecera, sus secciones o su navegacion.
- Rediseñar `/productos/:slug`, galeria, selector de variantes o formulario de presupuesto.
- Crear carrito, checkout, pagos, favoritos, comparador, stock o precios de listado.
- Inventar popularidad, ventas, fechas, novedades, categorias, materiales o facetas.
- Leer Neon desde el navegador, exponer n8n o cambiar las cuatro variables server-side.
- Ejecutar POST reales de presupuesto.
- Corregir los assets protegidos, el README antiguo o las reglas de publicacion sin evidencia y aprobacion.

## Decisions

### 1. Autoridad de referencia y gate previo

Antes de codigo se creara `docs/catalog-discovery-review.md` con los documentos y componentes usados, el contrato observado, capturas baseline y diferencias conocidas. El primer commit local contendra solo OpenSpec y esa revision. Los assets modificados del propietario y el task file preexistente de routing no entraran en ningun commit.

Cada fase tendra maximo cinco archivos. Si una necesidad real supera ese limite o toca landing, detalle, proxy o workflows fuera de lo previsto, se detendra la implementacion para ampliar alcance con autorizacion.

### 2. Direccion visual: indice de showroom, no grid de ecommerce

La escena de uso es una persona comparando piezas y medidas durante una reforma, en una superficie clara de trabajo. La pagina usara `bg-porcelain`, `max-w-7xl`, gutters actuales de 20/32 px y una jerarquia Marcellus/Manrope mas compacta que la landing.

El encabezado tendra retorno claro a AREA LRMQ, `h1`, texto breve y total real. La busqueda sera el control principal. En desktop, una columna lateral contenida alojara filtros y el area derecha contendra sort, activos, resultados y grid. En mobile/tablet, busqueda y sort seguiran visibles y los filtros se abriran en un `dialog`/drawer route-local con foco inicial, Escape, trap o comportamiento modal nativo, retorno de foco y restauracion del overflow previo.

Los productos no seran cajas blancas elevadas repetidas. Cada tile sera un enlace semantico completo con:

- pozo de imagen `stonewash` estable y `object-contain` para no recortar paginas tecnicas o productos;
- nombre en Manrope semibold;
- una linea util de marca/proveedor y categoria/coleccion solo cuando el contrato la entregue;
- sin precio, badges inventados ni CTA duplicado.

No habra sombra pesada en reposo. Hover/focus podran usar borde y elevacion sutil. El acento `clay` se reserva para indicadores, seleccion y foco, nunca para texto esencial pequeno. La ausencia de imagen mantendra la proporcion y mostrara un estado textual discreto.

### 3. Componentizacion route-local

`CatalogPage.tsx` coordinara query, datos y estados. Presentacion nueva vivira bajo `src/features/catalog/components/` y la serializacion bajo `src/features/catalog/model/`; no se generalizaran `Header`, `MobileDrawer` ni componentes de la landing.

La ficha individual no se modificara en las fases visuales. Los tipos/normalizadores compartidos solo cambiaran si el contrato de listado exige campos demostrados, con regresion explicita de los dos slugs validos, galeria, variantes, not-found y quote mockeado.

### 4. La URL es la fuente de verdad del descubrimiento

Parametros publicos previstos:

- `search`
- repetidos `category`, `supplier`, `subcategory`, `collection`, `product_kind`, `finish`, `measure`
- `sort`
- `page`, con base 1

`limit=24` sera una constante de request, no ruido en la URL. Las taxonomias usaran valores/IDs devueltos por facetas, no labels hardcodeadas. Dentro de una dimension, opciones multiples se combinan con OR; entre dimensiones se combinan con AND. Esta semantica debe confirmarse en el contrato n8n antes de habilitar multiseleccion.

El input de busqueda mantendra estado local inmediato y actualizara la URL despues de 300 ms. Cambiar busqueda, filtros o sort reiniciara `page=1`. Cada firma de query tendra un `AbortController`; una respuesta cancelada o antigua no podra reemplazar el estado vigente. Navegacion Back/Forward rehidratara controles y resultados desde la URL.

### 5. `Cargar mas` sobre paginacion offset

Se elige `Cargar mas` porque conserva contexto visual al comparar productos y encaja mejor con el indice editorial que una paginacion numerada. No se usara infinite scroll.

`page=N` significa que se muestran los chunks 0..N-1 de 24 productos. Al cargar mas se solicita solo el siguiente `offset`, se deduplican IDs y se conserva lo ya visible. Al recargar o volver desde ficha con `page>1`, se reconstruyen solo las paginas necesarias hasta N, nunca los 467 productos por defecto. La pagina mostrara `Mostrando X de Y`, progreso de carga y fin de resultados; un error de pagina adicional conservara los productos ya cargados y permitira reintentar.

El retorno desde detalle conservara query, `page` y posicion de scroll mediante historial/session route-local y restaurara la posicion despues de rehidratar los chunks. No se cambiara el routing de la ficha.

### 6. Facetas dinamicas amplian el GET existente

No se añadira una quinta ruta por defecto, porque el cambio de routing vigente protege cuatro entrypoints. La opcion preferida es ampliar `GET /api/catalog/products` en n8n/consulta publica sin tocar el proxy:

```json
{
  "items": [],
  "pagination": { "limit": 24, "offset": 0, "total": 190 },
  "facets": {
    "categories": [{ "value": "espejos", "label": "Espejos", "count": 44 }],
    "suppliers": [{ "value": "royo", "label": "Royo", "count": 84 }],
    "subcategories": [],
    "collections": [],
    "product_kinds": [],
    "finishes": [],
    "measures": []
  },
  "sort": {
    "applied": "name_asc",
    "supported": ["relevance", "name_asc", "name_desc"]
  }
}
```

Cada opcion contiene valor estable, etiqueta y cantidad sobre el universo que cumple busqueda y los filtros de otras dimensiones. La faceta puede excluir su propia seleccion al calcular cantidades, pero esa regla debe ser uniforme y documentada. Opciones con cero pueden ocultarse salvo que esten activas.

La primera request de cada firma enviara `include_facets=1`; los chunks de `Cargar mas` podran usar `include_facets=0`. Si n8n exige `/facets`, se detendra este cambio y se propondra una fase backend separada que modifique conscientemente el contrato de cuatro rutas.

Mientras el endpoint no entregue `facets`, la UI derivara opciones y cantidades del conjunto completo obtenido por paginas del endpoint (nunca de una sola pagina) como mecanismo transitorio documentado, manteniendo la ejecucion de search/filtros en servidor. Cuando el contrato backend entregue facetas, esa derivacion se sustituira por los datos server-side.

Material, marca separada, color u otros atributos solo apareceran si la auditoria demuestra presencia consistente y el endpoint devuelve la faceta. No se construiran counts desde los 24 items cargados.

### 7. Ordenacion honesta y server-side

El selector sera independiente de filtros. Solo se habilitaran valores incluidos en `sort.supported` y se enviaran al endpoint. `name_asc` y `name_desc` requieren orden estable con tie-breaker por slug/ID. `relevance` solo se habilitara con busqueda y soporte real.

Mientras el endpoint no confirme sorting, la UI presentara el selector con `relevance`/`name_asc`/`name_desc` habilitados solo cuando el orden se aplique realmente (cliente completo como transitorio documentado sobre el universo filtrado completo, nunca sobre la pagina visible) y las opciones sin soporte deshabilitadas con `Proximamente`.

Mas recientes, Novedades y Mas vendidos estaran visibles como `Proximamente`, disabled y con explicacion accesible. Para activarlos se necesitara respectivamente:

- fecha publica fiable de alta/publicacion y politica de timezone;
- `is_new` o ventana editorial documentada;
- agregado de ventas confirmado, periodo y politica de privacidad.

`Destacados` no se añadira ahora. Una seleccion editorial futura requeriria `featured_order` nullable y proceso de curacion separado, sin migracion en este cambio.

### 8. Scroll pertenece a la landing, no al body global

Se añadira una clase de ciclo de vida a `LandingPage` y la media query bloqueara solo `body.<clase-landing>`. El body por defecto conservara scroll nativo para catalogo, ficha y not-found. Reduced motion seguira anulando el lock.

Esta solucion se prefiere a añadir excepciones en cada pagina de producto: el propietario del comportamiento especial es la landing. Se comprobaran por codigo y pruebas 1024x720, desktop grande, tablet, mobile, pocos/muchos resultados, drawer y regreso desde ficha. `useNarrativeScroll`, secciones y media de la landing quedan sin cambios.

### 9. Estados, accesibilidad y rendimiento

La pagina definira estados separados: loading inicial, success, error recuperable, catalogo vacio, cero resultados por filtros, carga adicional, error adicional, fin y sin imagen. Los filtros activos seran removibles individualmente y `Limpiar filtros` restablecera URL y foco.

Habra un solo `h1`, landmarks `main/aside`, labels visibles, fieldsets/legends, anuncio `aria-live` de resultados, foco de 3:1, objetivos minimos de 44 px, drawer accesible y controles operables por teclado. Los cambios visuales usaran 150-250 ms de opacity/transform y seran estaticos bajo reduced motion.

Las imagenes tendran aspect ratio estable, dimensiones cuando el API las entregue, lazy loading bajo el primer viewport y `object-contain`. No habra overflow horizontal ni zoom que dificulte leer media tecnica.

### 10. Auditoria de publicacion como gate de datos

`docs/catalog-publication-audit.md` registrara fecha, commit/version, consultas y una tabla de waterfall mutuamente excluyente:

1. registros importados;
2. productos unicos;
3. variantes y relacion con productos;
4. activos;
5. publicables;
6. filas de vista/consulta publica;
7. `pagination.total` sin filtros;
8. exclusiones por inactivo, no publicable, imagen, datos minimos, reglas de proveedor/familia, duplicado, variante agrupada y otros motivos reales.

La ecuacion debe cuadrar sin doble conteo. Tambien debe demostrar limites/offsets y filtros por defecto. Se incluiran nombres de vistas/workflows y condiciones, nunca credenciales ni valores secretos.

La evidencia local 467/2.620/439/28 y el total observado 190 son punto de partida, no conclusion. No se modificara Neon, n8n ni publicacion hasta obtener definiciones/read-only outputs, explicar 465/433/192 y recibir aprobacion del propietario.

### 11. Commits de seguridad y entregas

Fases y rollback:

1. revision + OpenSpec + informe preliminar;
2. aislamiento de scroll;
3. contrato/auditoria backend aprobado;
4. cliente/tipos/query;
5. shell visual/cards;
6. filtros/facetas/sort/cargar mas;
7. pruebas, documentacion y evidencia final.

Cada fase termina en commit local tras status, diff, tests y revision por codigo. Ningun commit incluye assets protegidos ni tareas ajenas. No se hace push hasta mostrar resultado e informe y recibir autorizacion expresa.

## Risks / Trade-offs

- [El contrato de facetas/sort no existe] -> transitorio documentado sobre el conjunto completo; nunca sobre una pagina; sustituible por contrato backend.
- [La discrepancia 467/190 es una regla deliberada] -> no reincorporar registros; exigir waterfall y condiciones responsables.
- [Una faceta adicional rompe el contrato de cuatro rutas] -> preferir ampliar products; si no es posible, nuevo cambio backend aprobado.
- [Cargar mas con URL page requiere varias requests al recargar] -> pedir solo chunks hasta la pagina solicitada, cancelar batch obsoleto y no descargar todo por defecto.
- [Tipos compartidos afectan detalle] -> separar modelos de card/faceta y ejecutar regresion completa de ficha/quote.
- [El fix de body cambia la landing] -> clase landing-owned, test de montaje/cleanup y revision por codigo antes/despues.
- [Drawer deja body bloqueado] -> conservar valor previo, cleanup en cierre/unmount y test de foco/overflow.
- [Counts de facetas no coinciden con total] -> contrato de semantica y pruebas con combinaciones antes de UI.
- [El alcance supera cinco archivos] -> fases maximo cinco; detenerse antes de cada ampliacion no prevista.

## Migration Plan

1. Crear revision y baseline de codigo/datos sin editar codigo de produccion.
2. Corregir y validar scroll en commit aislado.
3. Obtener evidencia read-only y aprobar contrato de facets/sort; versionar/exportar workflow antes de cambios externos.
4. Implementar contrato minimo server-side solo si esta aprobado y conservar rollback de vista/workflow.
5. Implementar query/modelo y despues UI en commits separados.
6. Validar local, codigo y deployment GET; no hacer POST real.
7. Mostrar pagina e informe al propietario y pedir autorizacion de push.

Rollback: revertir el commit de la fase afectada; para n8n restaurar version exportada y para vistas usar la definicion anterior. No usar reset, clean ni restauraciones amplias.

## Open Questions

- Cual es la consulta/vista exacta del listado publico y que predicados explican cada exclusion.
- Si las 28 mamparas sin `publication_status` fueron deliberadamente excluidas o quedaron fuera de una transformacion.
- De donde proceden exactamente los snapshots 465 y 192.
- Que enum y tie-breaker acepta n8n para sorting.
- Si las facetas pueden incluirse en `GET /products` con semantica disyuntiva o requieren un cambio backend separado.
- Que campo/tabla alimentaria fecha publica, novedad, ventas o un futuro `featured_order`.
