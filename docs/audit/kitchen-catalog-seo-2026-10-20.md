# SEO de grifería de cocina y retirada de maneta Sirio

## Estado y referencia

Base: `c3778dc80931083bf083bcba0164abd462cd7652`, rama main. Estado Git inicial limpio, sin archivos modificados o sin seguimiento. El propietario confirmó que la retirada corresponde a la maneta independiente Sirio de una función y autorizó ejecutar el plan SEO. El alcance superior a cinco archivos se explicó: son 11 archivos entre metadatos, marcado, pruebas, arnés y este informe.

**Candidata local sin commit, push ni despliegue.** Las verificaciones de producción de esta revisión describen la base publicada; las mejoras nuevas solo se han verificado localmente, no en Vercel ni Search Console.

- Candidata completa: `http://127.0.0.1:4202/`.
- Catálogo de cocina: `http://127.0.0.1:4202/productos?category=griferia&supplier=gme&catalog_section=griferia&tap_scope=cocina`.
- Referencia aislada de c3778dc: `http://127.0.0.1:4200/`, copia de dist/api/server/vercel.json/package.json en `/tmp/opencode/kitchen-seo-baseline`.
- Origen local de fallo controlado: `http://127.0.0.1:4203/`, con upstream de lectura deliberadamente inaccesible.

No se modifican BD, n8n, proxy/API de negocio, rutas, selección, presupuesto, medios, dependencias, diseño, temas ni textos técnicos visibles. No se reaplica la importación de cocina ni la retirada de Sirio.

## Comprobación pública previa

Lecturas GET/HEAD reales en `https://arealrmq.es`, 20/10/2026:

- 161 productos públicos y 161 slugs únicos: 151 anteriores − 1 maneta + 11 cocina.
- `/sitemap.xml`: 200, `application/xml; charset=utf-8`, XML parseable, **163 URL únicas** (161 fichas + portada + catálogo). Coincide exactamente con el inventario público; no faltan ni sobran fichas.
- Las once fichas nuevas: 200, HTML inicial con nombre/descripción, un H1, canonical propio, `index, follow`, bootstrap presente y portada accesible por HEAD 200. Sin JSON-LD de producto; meta description igual a la descripción técnica y social image igual al logo general.
- `/productos`: título anterior «Catálogo de baños a medida · AREA LRMQ». La vista filtrada de cocina enlaza las once fichas y mantiene `noindex, follow`.
- Ejemplo de barra final: `/productos/gme-cocina-noah/` devuelve 308 hacia `/productos/gme-cocina-noah`.
- Robots 200 conserva el sitemap y permite documentos y lecturas públicas necesarias; no se ha modificado.

La identidad retirada se localizó en `catalogue-repairs.json` del paquete original: `gme-ducha-empotrable-sirio-1-funcion`. La comprobación real confirma:

| Documento / API | Resultado publicado |
|---|---|
| `/api/catalog/products/gme-ducha-empotrable-sirio-1-funcion` | 404, `PRODUCT_NOT_FOUND` |
| `/productos/gme-ducha-empotrable-sirio-1-funcion` | 404, `noindex, follow`, sin canonical |
| `/productos/gme-ducha-empotrable-sirio` | 200, canonical propio, indexable |

La maneta está ausente del inventario y del sitemap. No se añade una redirección a la ducha completa: no se confunden ambos productos. No se borran registros históricos ni assets.

## Implementación

### Metadatos editoriales de las once fichas

`src/features/catalog/model/kitchenSeo.ts` contiene resúmenes editoriales acotados a estos slugs y a proveedor GME/categoría grifería. No sustituye el inventario dinámico ni importa fixtures en producción. Las demás fichas conservan su regla anterior.

Patrón del título: `Grifo de cocina {modelo} IO by GME · AREA LRMQ`.
Las once descripciones son diferentes y no superan 160 caracteres; esa longitud es una guía editorial, no una garantía del snippet que elegirá Google. Se mantienen completas las descripciones técnicas visibles. Alexia conserva sus datos publicados sin reinterpretar la discrepancia de ángulos del PDF; en ambos modelos Osmosis se conserva explícitamente que no se declara equipo de filtración incluido.

| Slug, bajo `/productos/` | Modelo |
|---|---|
| `gme-cocina-alexia-abatible` | Alexia abatible |
| `gme-cocina-dior` | Dior |
| `gme-cocina-extraible-design` | Extraíble Design |
| `gme-cocina-extraible-round` | Extraíble Round |
| `gme-cocina-extraible-silver` | Extraíble Silver |
| `gme-cocina-noah` | Noah |
| `gme-cocina-osmosis-acero` | Osmosis Acero |
| `gme-cocina-osmosis-extraible` | Osmosis Extraíble |
| `gme-cocina-quadra` | Quadra |
| `gme-cocina-round` | Round |
| `gme-cocina-silver` | Silver |

El título general pasa a «Catálogo de baño y grifería de cocina · AREA LRMQ», con una descripción que incluye muebles, mamparas, platos, espejos y grifería de baño/cocina. La paginación sigue indexable; filtros/búsqueda mantienen la política noindex y no entran en el sitemap.

### Imágenes sociales y coherencia servidor/cliente

`getProductMeta` usa el mismo resumen en servidor y navegador. Para estas once fichas se añaden OG/Twitter image y alt con la portada pública del modelo; solo se aceptan URL HTTPS del host y raíz de assets del catálogo. No se utiliza una miniatura ni se cambia la imagen social al seleccionar un acabado.

`server/seo/head.js` aplica las cuatro etiquetas de imagen al HTML inicial, con escape de atributos y control de duplicados. Las etiquetas son opcionales para las plantillas antiguas/de emergencia. `routeMeta.ts` las aplica y restaura en navegación cliente; otras rutas vuelven a la imagen general del negocio, sin arrastrar una portada de cocina al catálogo, presupuesto o error.

### Datos estructurados

`KitchenProductJsonLd.tsx` añade un único script JSON-LD con grafo `Product` + `BreadcrumbList`, tanto en SSR como en cliente:

- Nombre, descripción técnica, marca, categoría e identificador públicos.
- URL canónica y portada real del modelo.
- Migas Inicio → Catálogo → producto, coherentes con navegación y encabezado.
- Sin ofertas, precio, moneda, disponibilidad, reseñas ni valoraciones inventadas. No se atribuye a todo el modelo el SKU de un único acabado.
- Escapado de `<` en el JSON para impedir cierre/inyección de script desde texto del producto.
- Ningún marcado de cocina en 404, 503 ni fichas ajenas al alcance.

Se verifican parseo, campos y correspondencia con datos visibles. **No se afirma elegibilidad para resultados enriquecidos de producto:** faltan datos comerciales que Google puede exigir y no se inventan para superar un validador. La validación externa de Google/Schema.org queda pendiente con la URL publicada de la candidata.

## Sitemap y retirada

La generación dinámica ya incorporaba las altas y la retirada antes de este cambio. Se conserva su URL, implementación, cabeceras y comportamiento ante fallos; no se añade una lista estática, fechas lastmod inventadas ni una ruta especial para cocina.

Se añade regresión de una transición 151 → 161 productos: los once nuevos entran, la maneta archivada queda fuera y el sitemap tiene 163 URL únicas en ese escenario de prueba. El arnés de revisión compara además el sitemap real del adaptador con **todo** el inventario público actual, no solo con ese número. Si el inventario cambia, se compara el conjunto de URL, sin publicar parciales. El fallo real de servicio mantiene 503, no-store y Retry-After 300; no se convierte una indisponibilidad temporal en retirada.

## Verificaciones ejecutadas

Entorno local: Node v22.22.2; proyecto declara 24.x. Dependencias existentes, sin actualizaciones. Chromium/Playwright instalados. Los formularios no se envían: el arnés bloquea cualquier POST y comprueba que no ocurre ninguno.

| Comprobación | Resultado |
|---|---|
| Typecheck | Correcto |
| Lint | 0 errores, 10 avisos preexistentes |
| Pruebas focalizadas SEO | 3 archivos, 35 pruebas pasan |
| Suite completa `npm test -- --maxWorkers=1` | **67 archivos, 625 pasan, 1 omitida preexistente** |
| Build | Correcto, incluido `package:seo` obligatorio |
| Sandbox del renderer sin node_modules | Correcto; no constituye evidencia de Vercel |
| Once documentos | 200, metadatos propios, portada social, un H1 y un grafo JSON-LD |
| Canonical y robots | Correctos; 404 sin canonical/noindex; filtros noindex |
| Maneta retirada / ducha completa | 404 / 200 |
| Fallo controlado de detalle y sitemap | 503, no-store, Retry-After 300, sin Product/canonical ni XML parcial |
| Sitemap y robots | XML válido, 163 URL únicas; conjunto igual al inventario público |
| Portadas de cocina | 11/11 HEAD 200; no se reemplazan imágenes |
| Hidratación directa y recarga | Sin errores y sin GET de detalle duplicado |
| Navegación cliente y vuelta atrás | Un GET normal de detalle, actualización/restauración de metadatos y retirada del JSON-LD al salir |
| Variantes y presupuesto local | 23 IDs y referencias correctos, en móvil y PC, sin envíos |

Incidencias de la suite registradas: dos ejecuciones completas con el paralelismo por defecto fallaron respectivamente en la espera de navegación de `App.test.jsx` y en el cambio de galería Negro de `ProductDetailPage.gmeIo.test.tsx`; ambos archivos pasaron aislados sin cambios. Una ejecución con maxWorkers=2 encontró una aserción inmediata de robots en `ProductDetailPage.test.tsx`. La ejecución completa serial pasó. No se atribuye una causa confirmada, no se ampliaron timeouts ni se relajaron o modificaron esas pruebas. El aviso de galería también consta en el informe previo de integración. JSDOM sigue avisando de pause() no implementado. Queda registrada la variabilidad paralela, no se presenta el comando por defecto como aprobado.

Build cliente: JS principal 358,27 → 361,84 kB (gzip 111,87 → 112,82 kB), detalle 46,19 → 46,43 kB. Incremento por metadatos y grafo compartidos; se conserva la división cliente. Renderer servidor autocontenido 2.068,61 kB (gzip 434,43 kB), comprobado por package:seo. CSS sin cambios. Se mantiene el aviso de Vite sobre inlineDynamicImports; no se modifica tooling para esta tarea.

### Revisión visual e interacciones

Referencia aislada c3778dc y candidata sobre los mismos datos públicos, 390×844 y 1440×900, claro/oscuro. Noah y Osmosis Extraíble: posiciones y tamaños de encabezados/imágenes sin diferencias mayores de 1 px; capturas y montajes revisados. Se conserva portada inicial, galería, controles, formularios y temas. En las pasadas funcionales claras se recorren las once fichas y se seleccionan las 23 variantes reales en cada viewport, verificando ID/referencia en la selección privada. La imagen social permanece en la portada aunque cambie el acabado. No se envían presupuestos ni mensajes.

Evidencias locales:

- Informe reproducible `/tmp/opencode/kitchen-seo-review.json`.
- Capturas `kitchen-{reference,candidate}-{390,1440}-{light,dark}-gme-cocina-{noah,osmosis-extraible}.png`.
- Montajes `/tmp/opencode/kitchen-montage-{390,1440}-{light,dark}.png`.
- Pruebas persistidas: `server/seo/productRender.test.js`, `server/seo/sitemap.test.js`, `src/routes/routeMeta.test.ts`.

Reproducir después de build, con previews de referencia/candidata separados:

```sh
npm run lint
npm run typecheck
npm test -- --maxWorkers=1
npm run build
SEO_REFERENCE_ORIGIN=http://127.0.0.1:4200 \
SEO_CANDIDATE_ORIGIN=http://127.0.0.1:4202 \
SEO_FAILURE_ORIGIN=http://127.0.0.1:4203 \
node server/seo/kitchenReview.js
```

## Archivos de la candidata

1. `src/features/catalog/model/kitchenSeo.ts`: resúmenes y grafo acotados a cocina.
2. `src/features/catalog/components/KitchenProductJsonLd.tsx`: script compartido SSR/cliente.
3. `src/features/catalog/pages/ProductDetailPage.tsx`: montaje del marcado en éxito.
4. `src/routes/pageMeta.ts`: metadatos de cocina y actualización del catálogo general.
5. `src/routes/routeMeta.ts`: imagen social y restauración en navegación.
6. `server/seo/head.js`: imagen social inicial.
7. `server/seo/productRender.test.js`: documentos, seguridad y regresión fuera del alcance.
8. `server/seo/sitemap.test.js`: altas y retirada.
9. `src/routes/routeMeta.test.ts`: metadatos únicos, navegación y errores.
10. `server/seo/kitchenReview.js`: revisión GET/HEAD, navegador y comparación.
11. Este informe.

## Pendientes

- Revisión/aceptación del propietario y autorización separada para commit, push y despliegue.
- Después de publicar: verificar Vercel/dominio, HTML inicial, imágenes sociales, JSON-LD, 404 retirada, 503 y sitemap. Los resultados nuevos locales no se marcan como verificados allí.
- Search Console con acceso autorizado: confirmar lectura del sitemap existente y obtener el detalle del error anterior si persiste; inspeccionar nuevas URL y la retirada, renderizado y canonical elegido por Google. La URL del sitemap no cambia y no se afirma haberlo enviado desde este entorno.
- Rich Results Test/Schema.org sobre las URL nuevas publicadas; no inventar ofertas para obtener elegibilidad ni equiparar parseo local con aprobación externa.
- Safari/iPhone físico para confirmar galería y selección. La revisión actual es Chromium local.
