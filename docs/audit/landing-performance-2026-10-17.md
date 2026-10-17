# Candidata de rendimiento AREA LRMQ — 2026-10-17

## Estado y referencia

Referencia: `4188abddf3d85af3fb2e4959a3bf1085d4e17864`, main y origin/main al comenzar. La comprobación externa aportada por el propietario confirma 200 en catálogo/ficha válida, 404 en inexistente, 308 y sitemap con 153 URL. Esta candidata **no está commiteada, subida ni desplegada**. Todas sus comprobaciones son locales; no son verificaciones de Vercel.

Se preservan los dos archivos ajenos modificados (`owner-responsive-stability-review-2026-10-13.md` y tareas de `fix-responsive-landing-commercial-ui`) y los dos artefactos sin seguimiento `.agents/skills/.agents/` y `.agents/skills/skills-lock.json`.

Referencias locales para revisión:

- `http://127.0.0.1:4192/`: copia del build de `4188abd` en `/tmp/opencode/perf-baseline-dist`, con las URL remotas y medios **actuales**. Sirve para comparar portada; su fallback Vite no demuestra estados HTTP de rutas.
- **`http://127.0.0.1:4194/`: candidata completa**, adaptador `preview:seo`; GET públicos, sin entregas de formularios reales. `4193` sirve el mismo build mediante Vite preview exclusivamente para las mediciones de portada.
- `4195`: adaptador de fallo controlado, con upstream de catálogo deliberadamente inaccesible.

La ampliación de más de cinco archivos se explicó y autorizó. El inventario final es de 15 archivos: runtime de portada, hook y pruebas, configuración `sizes`, propiedad de preload en CompareSlider, flujo de build/empaquetado, dos arneses y dos documentos; no hay binarios, actualizaciones de dependencias ni cambios de API/BD.

## Medios publicados: inventario comprobado

Base conservada: `https://assets.colilladavid.es/proyectos/lrmq/site/media-20261015/`.

HEAD reales y ffprobe remoto; no se guardaron binarios en el repositorio. Los seis recursos siguientes comparten Last-Modified `Sat, 17 Oct 2026 19:55:08 GMT`, responden 200, con ETag y sin Cache-Control:

| Archivo | Bytes actuales | Dimensiones / formato |
|---|---:|---|
| `reforma-proceso.mp4` | 621.403 | 768×432, H.264, 24 fps, 13,666667 s, AAC presente |
| `vision-boceto.mp4` | 247.420 | 768×432, H.264, 24 fps, 4 s, AAC presente |
| `vision-boceto-poster.webp` | 254.924 | WebP; bytes verificados por HEAD |
| `fotos/quienes-experiencia-movil-960.webp` | 91.130 | 960×1268 |
| `fotos/quienes-equipo-960.webp` | 37.382 | 960×720 |
| `fotos/quienes-compromiso-movil-941.webp` | 41.066 | 941×1671 |

Audio y conservación respecto de originales: informados por el propietario; aquí se confirmó la presencia de AAC y las duraciones actuales, no una comparación binaria con versiones anteriores. Inventario HEAD ampliado de variantes: `/tmp/opencode/perf-inventory.json`. Ninguna URL se sustituyó por recursos locales.

## Método de medición

Arnés persistido: `server/seo/performanceReview.js`. Chromium **153.0.8010.12**, Playwright instalado, Node local **22.22.2** (el proyecto declara Node 24.x). No se instaló Lighthouse ni se actualizaron dependencias.

- Tres contextos nuevos por viewport: HTTP cache fría; después, navegación al mismo origen en el mismo contexto: cache caliente. DNS/TLS del proceso no se vacían entre contextos.
- Móvil: **390×844, DPR 1**, latencia CDP 150 ms, descarga 200.000 B/s (1,6 Mbps), subida 93.750 B/s, CPU ×4.
- Escritorio: **1440×900, DPR 1**, latencia 40 ms, descarga 1.250.000 B/s (10 Mbps), subida 625.000 B/s, CPU ×1.
- Claro, movimiento normal, bienvenida de chat descartada por fixture de sesión; sin interacción durante 12 s después de DOMContentLoaded. Origen HTML/JS local, medios y fuentes remotos reales. Estas condiciones **no reproducen las capturas Lighthouse antiguas** (77 / FCP 2,6 s / LCP 4,6 s / TBT 0 / CLS 0): no se presenta una diferencia de puntuación ni una comparación directa con ellas.
- En la primera pasada fría se recorren después los siete capítulos, esperando 2,5 s por capítulo. Solo esa pasada incluye el recorrido; su recarga caliente también tiene cache de ese recorrido, detalle reflejado en los JSON. Las dos recargas restantes tienen cache de Inicio.
- FCP/LCP observados mediante PerformanceObserver; CLS por ventana de sesión. El contador de long tasks es bloqueo observado en la ventana, **no TBT de Lighthouse**.
- Bytes de la tabla de tráfico: cuerpos HTTP observados en la pasada fría, sin cabeceras/TLS. NetLog completa CDP con las lecturas HTTP/2, incluidas descargas de vídeo que Chromium cancela al completar metadata/búfer. CDP informa `ERR_ABORTED` sin bytes en esos casos: no se interpreta como vídeo fallido ni como 0 B. No se suma el Content-Length teórico. En caliente NetLog también puede contener lecturas de cache; no se presentan esos totales como bytes de red.
- Fuentes de evidencia: `/tmp/opencode/perf-{baseline,candidate}.json` y `perf-{baseline,candidate}-netlog.json`. Las medidas temporales no se ejecutaron simultáneamente con suites o builds. Las medidas accesorias de los arneses visuales no se usan en la comparación de rendimiento.

### Series y medianas (ms)

| Estado | FCP antes (3) | FCP candidata (3) | Medianas | LCP antes (3) | LCP candidata (3) | Medianas |
|---|---|---|---|---|---|---|
| Móvil fría | 980 / 988 / 972 | 960 / 888 / 960 | 980 → 960 | 996 / 1008 / 988 | 976 / 912 / 968 | 996 → 968 |
| Móvil caliente | 512 / 480 / 436 | 472 / 428 / 428 | 480 → 428 | 512 / 480 / 436 | 472 / 428 / 428 | 480 → 428 |
| PC fría | 308 / 296 / 296 | 304 / 288 / 284 | 296 → 288 | 308 / 296 / 296 | 304 / 288 / 284 | 296 → 288 |
| PC caliente | 200 / 188 / 200 | 196 / 200 / 176 | 200 → 196 | 200 / 188 / 200 | 196 / 200 / 176 | 200 → 196 |

El resultado robusto es el ahorro de solicitudes/bytes iniciales. Las diferencias temporales son pequeñas frente a la dispersión: **no se demuestra una mejora importante de LCP**, ni se promete una puntuación fija.

CLS frío móvil: 0,000349 antes y después. Mediana PC: 0,001075 antes y después, con una pasada candidata de 0,001199 (series accesorias reproducen ambos valores también en la referencia). Caliente: **0** en todas las pasadas. No se afirma CLS estrictamente 0 en frío. Una sonda con fuentes de layout-shift identifica cambios pequeños de anchura del header/nav/dots durante la llegada de la fuente en ambas versiones, no un salto del vídeo. El objetivo sigue siendo 0; no se modifican métricas de fuentes ni diseño para ocultar este residuo.

Bloqueo observado frío: móvil 325 / 314 / 334 → 346 / 297 / 331 ms; PC 26 / 9 / 16 → 22 / 14 / 7 ms. Caliente 0. No hay evidencia de mejora sustancial de CPU móvil.

### LCP real y desglose

- Móvil: imagen `inicio-cocina-movil-480.webp`, `picture`, eager/high conservados. Medianas: inicio de recurso 203,5 → 206,3 ms; intervalo hasta responseEnd **571,4 → 505,5 ms**; responseEnd hasta LCP **219,8 → 257,2 ms** (incluye entrega al renderer/decodificación/pintado). LCP **996 → 968 ms**. Resource Timing cross-origin no permite desglosar todos los tiempos internos sin Timing-Allow-Origin; los intervalos no se presentan como tiempo puro de servidor. La imagen no espera una animación de aparición. Son medianas de intervalos independientes, por lo que su suma no equivale necesariamente a la mediana total.
- PC: elemento observado **H1 “AREA LRMQ”**, no la foto ni los vídeos. LCP 296 → 288 ms. No corresponde atribuir un supuesto ahorro de descarga del vídeo a la aparición de ese texto. Las animaciones aprobadas del logo y tarjetas siguen funcionando y no fueron eliminadas.

## Tráfico inicial y al recorrer secciones

| Pasada fría | Antes: cuerpo HTTP / solicitudes | Candidata: cuerpo HTTP / solicitudes |
|---|---:|---:|
| Inicio móvil, sin interactuar | 1.424.534 B / 22 | **301.377 B / 19** |
| Inicio PC, sin interactuar | 1.525.056 B / 23 | **333.933 B / 20** |
| Recorrido móvil, total desde Inicio | 1.471.400 B / 25 | 1.471.990 B / 27 |
| Recorrido PC, total desde Inicio | 2.341.975 B / 40 | 1.608.782 B / 37 |

Los tres fríos dan los mismos bytes de cuerpo iniciales dentro de cada versión/viewport. Se retiran de Inicio **1.123.747 B de medios** (621.403 + 247.420 + 254.924), compensados mínimamente por el código de preparación. La reducción global inicial es aproximadamente **79 % móvil / 78 % PC**. Las diferencias del recorrido son de una pasada exploratoria: el número y tamaño de los rangos de vídeo dependen de los seek/replays y no se prometen como ahorro constante.

En móvil el recorrido acaba consumiendo prácticamente el mismo cuerpo: se **pospone**, no se elimina, la descarga de medios necesarios. Las dos solicitudes extra del recorrido no corresponden a variantes móvil/escritorio duplicadas; el JSON registra cada URL. NetLog confirma ambos vídeos completos durante el recorrido, mientras en Inicio de la candidata no hay ninguna petición a vídeos/poster. En PC parte del ahorro adicional procede de `sizes` y parte de rangos de vídeo evitados. Una fase intermedia con metadata reiniciaba rangos; la candidata usa auto solo tras preparar la fuente y el arnés funcional final verifica exactamente una petición por cada uno de los dos vídeos y por el poster en las cuatro combinaciones.

## Implementación

### Preparación de medios

- SSR y primer render de hidratación: sin `src` de los dos vídeos ni `poster` de Visión. Todo el texto y los mismos contenedores siguen en HTML inicial.
- Escritorio narrativo: App pasa la relación real activo/adyacente de capítulo. Servicios prepara Reformas; Reformas prepara Visión. No se usa IntersectionObserver para escenas narrativas superpuestas, tampoco durante el snapshot natural provisional de hidratación.
- Natural: IntersectionObserver con margen de **800 px**, usando explícitamente main como raíz si es el scrollport, o el viewport si no lo es. Evita que el clip del main anule el margen de anticipación. El arnés verifica que Reformas ya tiene src estando todavía 400 px por debajo del scrollport. Al aproximarse se asignan las URL originales y se usa preload auto; lejos, src ausente y preload none.
- Preparación persistente durante el montaje: no se retira src al salir, volver atrás o cambiar de modo. Reformas conserva controles móviles y búsqueda temporal PC, esperando metadata antes del seek. Atributos 768×432 reservan su proporción.
- Visión solo completa con fuente preparada y datos reproducibles; un `ended` sin búfer no revela comparación ni marca la sesión como vista. AbortError no se interpreta como final. Error real libera el hold sin fingir final; si la carga se atasca 8 s también se libera la navegación. Replay antes de búfer no vuelve a bloquearla. Se conservan autoplay narrativo, play móvil, replay y slider táctil/teclado. CompareSlider solo expone videoPreload (metadata por defecto para otros consumidores), sin cambios de geometría o comparación.

### Imágenes, logos, fuentes y CSS

La prueba DPR 1/2 de 390 y 1440 registra exactamente una variante por foto, sin pareja móvil/escritorio duplicada. En móvil las secundarias ocupan 342 px; en PC las de Quiénes somos unos 416 px y Servicios unos 486 px. Los antiguos `42vw`/`55vw` declaraban 605/792 px en PC: exceso verificado.

`src/config/mediaAssets.ts` ajusta exclusivamente `sizes` de esas secundarias según max-w-5xl, columnas, gaps, padding y gutter ya existentes, con un límite conservador anterior al fit-down. Incluye la altura narrativa de 560 px; en modo natural ancho usa una columna. Inicio no cambia.

| Foto en PC 1440, DPR 1 | Antes | Candidata |
|---|---|---|
| Experiencia | desktop-880, 42.514 B | desktop-480, 14.344 B |
| Equipo | 960, 37.382 B | 480, 16.794 B |
| Compromiso | desktop-880, 26.294 B | desktop-480, 7.086 B |
| Servicios | 1024, 69.644 B | 640, 26.650 B |

DPR 2 conserva experiencia/compromiso 880 y Servicios 1536; Equipo elige 960 frente a 1448. Las selecciones móviles permanecen en las variantes aprobadas 480 (DPR 1), 960/941/1024 (DPR 2). Evidencia: `/tmp/opencode/perf-photos.json`.

React SSR genera dos preloads de logos, 14.560 y 30.508 B; las múltiples instancias reutilizan cada URL y no generan duplicados de red. Ambos se usan en la identidad visible/header según modo. Las dos fuentes observadas suman unos 40 kB; preconnect y swap ya están presentes. No se añaden preloads ni se cambian familias/pesos. theme-bootstrap sigue síncrono antes del cuerpo para conservar el tema inicial sin flash. CSS idéntico (71,79 kB), sin cambios cosméticos.

### Evaluación secundaria

Traza adicional PC de 6,5 s, sin throttling, no comparable como puntuación: Layout 205 eventos / 162 ms agregados, UpdateLayoutTree 412 / 178 ms, Paint 1086 / 135 ms. Evidencia `/tmp/opencode/perf-secondary.json`. Incluye la animación SVG y efectos aprobados: no se interpreta la cantidad de eventos como 162 ms de bloqueo continuo ni como prueba de que todo el trabajo es un reflow forzado.

La revisión detecta lectura/escritura intercalada en el ajuste proporcional de capítulos y animaciones no limitadas a transform/opacity (trazo SVG, filter, top). Se conservan: retirar esos efectos o sustituir la medición de fit podría alterar la referencia y la evidencia actual no los establece como el cuello de botella principal. Coverage confirma descarga de AssistantShell y el prefetch intencional de ChatPanel (≈7,76/17,79 kB sin comprimir); no se confunde función todavía no ejecutada con código muerto. Se conserva la preparación del primer chat, sus proveedores y chunks, sin reestructurar negocio.

JS principal 356,69 → **358,08 kB** (gzip 111,29 → **111,85 kB**). La pequeña subida es el hook y la protección de reproducción. Catálogo, fichas, presupuesto y asistente mantienen sus chunks cliente separados; el bundle autocontenido de ≈2,06 MB sigue limitado al renderer **servidor**.

## Caché del VPS: propuesta, NO aplicada

Directorio físico confirmado por el propietario:
`/opt/proyectos-assets/public/proyectos/lrmq/site/media-20261015`.

**Política actual mutable:** se han sustituido bytes manteniendo URL. Propuesta inicial: cache almacenable pero con validación en cada reutilización (`public, no-cache`) mediante ETag/Last-Modified. No se recomienda `immutable` en este directorio. Los clientes con una copia ya fresca por heurística pueden necesitar recarga/revalidación; cambiar la cabecera hoy no purga mágicamente esa copia.

Ejemplo para integrar en la configuración Nginx existente, conservando MIME, rangos, CORS y cabeceras que ya tenga el servidor (una nueva directiva add_header puede cambiar su herencia):

```nginx
location ^~ /proyectos/lrmq/site/media-20261015/ {
    root /opt/proyectos-assets/public;
    try_files $uri =404;
    etag on;
    add_header Cache-Control "public, no-cache";
}
```

La concatenación root + URI coincide con el directorio confirmado. No usar aquí un alias que duplique el prefijo. Cache-Control se aplica a 200/206/304, sin extender frescura a 404 mediante `always`. Evitar directivas `expires` contradictorias. El propietario debe revisar `nginx -t`, recargar y comprobar HEAD/GET, Range→206, validación If-None-Match→304 y errores antes de declarar aplicada la propuesta. `vercel.json` no configura este host.

**Política futura versionada, previa a immutable:** publicar nuevos bytes con nombre content-hash o nuevo directorio de versión, nunca sobrescribir una URL declarada inmutable; registrar tamaño/hash, actualizar referencias de forma coordinada y conservar la versión anterior para rollback. Solo las URL nuevas con ese contrato podrían llevar `public, max-age=31536000, immutable`. Definir responsable, retención e invalidación/purga de cualquier CDN; ante una corrección urgente, crear URL nueva en vez de reemplazar bytes inmutables. Las URL actuales siguen intactas en esta candidata.

## Build obligatorio y validación

`npm run build` ahora encadena cliente → servidor/prerender → `npm run package:seo`. Cualquier fallo del sandbox devuelve estado no cero antes de desplegar en el flujo de build existente. Se corrigió tanto el comentario del arnés como la descripción histórica contradictoria: el sandbox contiene `dist/server` **sin node_modules**. Esto prueba autocontención local, no empaquetado remoto de Vercel.

- Build y sandbox: correctos; división cliente conservada. Aviso preexistente de deprecación de inlineDynamicImports; no se cambia herramienta ni dependencia.
- Lint: 0 errores, 10 avisos conocidos. Typecheck correcto. Suite: **65 archivos, 588 pruebas pasan, 1 omitida preexistente**.
- `mediaDeliveryReview.js`: cuatro combinaciones PC/móvil claro/oscuro, 0 solicitudes de vídeos/poster en Inicio, anticipación narrativa, seek, controles, reproducción hasta `ended` real, replay, teclado/arrastre y vuelta atrás sin errores de página.
- Comparación de siete capítulos con browserReview: 1366×768 claro, 1440×900 oscuro, 390×844 claro/oscuro; geometría desktop sin diferencias >1 px. Capturas y montajes revisados. Movimiento reducido PC/móvil también comprobado.
- `documentReview.js`: 11 documentos, HTML inicial/no-JS, canonical/robots, 200/404, 308, 503/Retry-After y recuperación; resize 1023/1024 y alturas 559/560, main único y borrador conservado; swipe táctil CDP, controles nativos y scrubbing PC; sitemap 153 URL.
- `browserFlows.js` en 390/1440: chat, hidratación y reutilización SSR sin lectura duplicada, catálogo/búsqueda/retorno, siete familias de variantes, presupuesto privado/persistencia, formularios y destinos externos. 15/14 recorridos, errores `[]`. Un chat y cuatro presupuestos POST controlados por viewport, sin entregas externas.
- Fixtures de Vision actualizados para representar vídeo cargado (`readyState=4`); los nuevos tests cubren específicamente src ausente, preparación por proximidad, retención, snapshot de hidratación y carga atascada/replay. El arnés de documentos se acerca antes de reproducir y espera final real: no se relajan aserciones para simular carga exitosa.

Reproducir sobre un build y previews separados:

```sh
npm run build
node server/seo/performanceReview.js http://127.0.0.1:4192 baseline
node server/seo/performanceReview.js http://127.0.0.1:4193 candidate
SEO_CANDIDATE_ORIGIN=http://127.0.0.1:4194 node server/seo/mediaDeliveryReview.js
SEO_CANDIDATE_ORIGIN=http://127.0.0.1:4194 SEO_FAILURE_ORIGIN=http://127.0.0.1:4195 node server/seo/documentReview.js
SEO_CANDIDATE_ORIGIN=http://127.0.0.1:4194 node server/seo/browserFlows.js 390
SEO_CANDIDATE_ORIGIN=http://127.0.0.1:4194 node server/seo/browserFlows.js 1440
```

## Archivos y pendientes

15 archivos: `src/App.jsx`, `src/hooks/usePreparedMedia.js`, `src/hooks/usePreparedMedia.test.jsx`, `src/sections/desktop/{Reformas.jsx,Vision.jsx,Vision.test.jsx}`, `src/config/mediaAssets.ts`, `src/components/CompareSlider.jsx`, `package.json`, `server/seo/{packageCheck.js,performanceReview.js,mediaDeliveryReview.js,documentReview.js}`, `docs/audit/{existing-site-technical-seo-review.md,landing-performance-2026-10-17.md}`.

Pendientes concretos:

1. Revisión y aceptación de la candidata por el propietario; commit, push y despliegue pendientes.
2. VPS: adoptar política de versionado/invalidación y aplicar/verificar Nginx con acceso del propietario. No aplicado desde este entorno.
3. Safari/iPhone físico: validar preparación por proximidad, controles/seek, muted autoplay, replay, cambio de orientación y comparación táctil sobre red móvil. Chromium local no lo sustituye.
4. Vercel: después de autorizar despliegue, comprobar build obligatorio, artefactos, HTTP/SSR/hidratación y solicitudes reales de la candidata en su Preview/dominio.
5. Search Console: obtener el detalle del error de lectura de sitemap.xml e inspección/renderizado/canonical elegido. Se conserva su URL y generación completa; ningún resultado de laboratorio ni Lighthouse SEO 100 garantiza indexación.
