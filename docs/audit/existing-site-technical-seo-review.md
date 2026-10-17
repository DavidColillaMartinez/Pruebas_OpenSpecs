# Revisión técnica SEO de la web existente · AREA LRMQ

Cambio OpenSpec: `improve-existing-site-technical-seo`.
Fecha de registro: 2026-10-16. Última actualización: 2026-10-17. Estado: implementación y validación local preparadas para revisión, sin commit. El estado vigente está en §10; los resultados de fases anteriores se conservan como historial.

Alcance: SEO técnico sobre las páginas actuales. Sin páginas nuevas, sin cambios de diseño, textos, medios, navegación ni contratos de API. Este documento registra el estado; no sustituye la revisión visual del propietario.

## 1. Estado del repositorio (tarea 1.1)

- Rama `main`. HEAD observado: `55062aa`. Última entrega legal: `997f60a` (publicada tras `1b163c3`).
- Worktrees: solo el principal. Referencia `55062aa` extraída y compilada en `/tmp/opencode/reference`, servida en 4181. Fuente candidata en la raíz actual, con build en `dist` y adaptador local en 4182. No se ha creado la rama/worktree candidata exigida en 1.3; sigue pendiente de ubicación autorizada. La comparación actual separa archivos de referencia y candidata, pero no cierra 1.3.
- Cambios ajenos previos, fuera del alcance de este cambio. Se preservan sin tocar:
  - Modificados sin commit: `docs/audit/owner-responsive-stability-review-2026-10-13.md` y `openspec/changes/fix-responsive-landing-commercial-ui/tasks.md`.
  - Sin seguimiento: `.agents/skills/.agents/` y `.agents/skills/skills-lock.json`.
- Cambios propios sin commit (2026-10-17): ver §8.
- Solapamiento a vigilar: el cambio `fix-responsive-landing-commercial-ui` define los umbrales narrativos (`DESKTOP_MIN_WIDTH=1024`, `DESKTOP_MIN_HEIGHT=560`, `isNarrativeViewport` en `src/data/copy.js`). Este cambio no los modifica.

Commits desde `1b163c3` (12, del 15/10/2026):

| Commit | Asunto resumido | Visible en la web |
|---|---|---|
| `8dc00cc` | Aclarar productos y configuración pendiente | Sí (presupuesto) |
| `a6ad686` | Servir el lote de medios aprobado desde el VPS con variantes | Sí (medios) |
| `4c4ec5b` | Retirar la franja de bienvenida opaca del dock móvil | Sí (móvil) |
| `62e5cd9` | Caducidad de la selección a 7 días y recordatorio opcional | Sí (presupuesto) |
| `8410396` | Alinear pruebas de navegación con los enlaces legales | No |
| `b53b488`, `0b8ffc1`, `a7f5116` | Especificaciones y panel de privacidad/WhatsApp del asistente | Sí (asistente) |
| `b7dc514` | Hero desenfocado con scrim en Inicio | Sí (portada) |
| `69b0e71` | Texto de navegación blanco sobre Inicio en modo claro | Sí (cabecera) |
| `8274bfe` | Normalizar selección vacía, temporizador y parser v3 | Lógica |
| `55062aa` | Guardia de mensaje vacío en WhatsApp, textos alternativos y etiquetas | Parcial |

Procesos locales ajenos detectados con `ss`: puertos 4173, 4189, 4040 (ngrok), 5432, 11434, 631 y 3389/3390. No se han tocado. Puertos 4181, 4182, 4183 y 4184 libres en la comprobación (4183 y 4184 usados solo por el emulador de §8 y ya detenidos).

## 2. Contratos vigentes que deben conservarse

- API de lectura pública (GET):
  - `/api/catalog/config`: 200 JSON.
  - `/api/catalog/products`: 200 JSON, paginación `offset`/`limit` con `pagination.has_more`; `pagination.total` es nulo; `limit` efectivo máximo 60; el parámetro `page` no existe y el proxy lo descarta.
  - `/api/catalog/products/:slug`: 200 JSON; 404 JSON (`PRODUCT_NOT_FOUND`) si la ficha no existe.
- API de escritura (no invocadas en esta fase):
  - `/api/catalog/quote-requests`: POST JSON validado en `server/catalog/quoteBody.js`, con consentimiento obligatorio y campo `website` como trampa.
  - `/api/chat/messages`: POST JSON con `requestId`, `conversationId`, turno y contexto.
- Almacenamiento del navegador:
  - `lrmq:quote-selection:v3`: selección con 7 días de inactividad; «recordar» la mantiene sin caducidad; migra una vez desde v2 y v1; las notas no se persisten.
  - `lrmq:theme:v1`, `catalog:return-state`, `lrmq:assistant:welcome:v1`, `lrmq:assistant:chat:v1`.
- Comportamientos aprobados (`integrate-approved-media-welcome-and-selection-expiry`): renovación del plazo solo con cambios reales; vaciar elimina productos y metadatos; el envío retira únicamente las líneas confirmadas; sincronización entre pestañas por evento `storage`; el aviso de privacidad del panel se pliega; el borrador de WhatsApp admite 1000 caracteres; la preparación usa `wa.me` sin guardar nombre ni mensaje.

Observación fuera de alcance: las páginas legales describen la selección «sin caducidad programada» (`src/features/legal/content.ts`), mientras la especificación aprobada fija 7 días salvo que se active «recordar». Corresponde al cambio `integrate-approved-media-welcome-and-selection-expiry`. No se modifica aquí.

## 3. Línea base de calidad (tarea 1.2)

Ejecutada sobre `55062aa`, sin cambios locales en `src/`.

| Comprobación | Resultado |
|---|---|
| `npm test` | 56 archivos; 506 pruebas pasan; 1 omitida (preexistente) |
| `npm run typecheck` | Correcto |
| `npm run lint` | 0 errores; 12 avisos |
| `npm run build` | Correcto; 113 módulos; JS principal 355,55 kB (108,19 kB gzip); CSS 68,62 kB |

El inventario y las capturas de referencia se completan en §10; esta tabla conserva el baseline original.

## 4. Matriz HTTP de producción (tarea 1.2, solo lectura)

Consultas GET a `https://arealrmq.es` el 2026-10-16 con `/tmp/opencode/seo-matrix.sh`, fuera del repositorio. Repetida el 2026-10-17 con el mismo resultado.

| Ruta | HTTP | Canonical en HTML inicial | Robots en HTML inicial | `<h1>` inicial |
|---|---|---|---|---|
| `/` | 200 | `https://arealrmq.es/` | index, follow | 0 |
| `/productos` | 200 | `https://arealrmq.es/` (**incorrecto**) | index, follow | 0 |
| `/productos/` | **404** (**incorrecto**: el canonical del código y el sitemap antiguo lo usaban) | — | — | — |
| `/productos/gme-mamparas-ducha-akord` (ficha válida) | 200 | `https://arealrmq.es/` (**incorrecto**) | index, follow | 0 |
| `/productos/zz-inexistente-20261016` | **200** (soft 404) | `https://arealrmq.es/` | index, follow | 0 |
| `/presupuesto` | 200 | `https://arealrmq.es/` | index, follow (**debería ser noindex**) | 0 |
| `/presupuesto/` | **404** (**incorrecto**: el canonical del código lo usaba) | — | — | — |
| `/aviso-legal`, `/privacidad`, `/cookies` | 200 | `https://arealrmq.es/` | index, follow (**debería ser noindex**) | 0 |
| `/ruta-desconocida-20261016` | 404 (página de la plataforma) | — | — | — |
| `/robots.txt` | 200 (105 B) | — | — | — |
| `/sitemap.xml` | 200 (298 B); incluye `/productos/`, que devuelve 404 | — | — | — |
| `/api/catalog/config` | 200 JSON | — | — | — |
| `/api/catalog/products/zz-inexistente-20261016` | 404 JSON | — | — | — |

Otros datos:

- Todas las rutas HTML devuelven el mismo documento de 2 582 bytes y sin `<h1>`: el contenido se genera en el navegador.
- `www.arealrmq.es` redirige con 308 al dominio principal.

## 5. Hallazgos y estado

- **H1 — URL canónica del catálogo.** `/productos/` responde 404 y figuraba como canonical y en el sitemap. Estado: canonical `https://arealrmq.es/productos`, redirección 308 de `/productos/` en `vercel.json`, sitemap nuevo sin esa URL. Pendiente: verificar la redirección en Vercel.
- **H2 — Paginación. Falso positivo, corregido.** La API pagina por `offset`/`limit`. La prueba original usó `?page=2`, que el proxy descarta; por eso la página 2 repetía la 1. Con `offset=24` el upstream devuelve fichas distintas. Enumeración de solo lectura el 2026-10-17: 151 fichas únicas, sin duplicados, todas `publishable|approved`, en 3 páginas con límite 60.
- **H3 — Soft 404 de fichas.** Una ficha inexistente responde 200 con el HTML de portada en producción. Estado local: función conectada en configuración, renderer React compartido y 200/404/503 verificados con el artefacto compilado (§9). 404 sin canonical y con noindex; 503 sin canonical ni noindex, con `Retry-After`. Pendiente de comprobar en Vercel tras publicación autorizada.
- **H4 — Robots iniciales.** Corregido localmente: presupuesto y legales emiten `noindex, follow` desde el HTML, con su contenido y canonical propios. Catálogo filtrado/búsqueda/orden alternativo aplica la misma matriz desde servidor y cliente. Ver §10.
- **H5 — Bloqueo de `/api/`.** Estado: aplicado en `public/robots.txt`. Se permiten las rutas públicas `/api/catalog/config` y `/api/catalog/products` (incluidas fichas); se mantiene `Disallow: /api/` para el resto. Robots regula rutas, no distingue métodos HTTP ni actúa como control de acceso. Se quita `Disallow: /presupuesto/` para que el `noindex` sea legible.
- **H6 — Base de referencia.** Resuelto por decisión del propietario: `55062aa`, último commit desplegado en producción.
- **H7 — Layout decidido en cliente.** Corregido localmente: un solo árbol de secciones; CSS selecciona presentación desde el primer pintado. Viewport y tema usan snapshots de servidor deterministas; los efectos activan narrativa/medios después de hidratar. Se verifica conservación del mismo nodo main y borrador al cruzar ancho/alto, sin errores de hidratación. Ver §10.
- **H8 — Canonical de presupuesto. Nuevo.** El código usaba `/presupuesto/`, que responde 404. Estado: canonical `/presupuesto` y redirección 308 de `/presupuesto/` en `vercel.json`.

## 6. Decisiones

1. **Referencia:** `55062aa`. Confirmada por el propietario.
2. **Portada:** opción A confirmada: DOM único PC/móvil con CSS responsive; PC sin cambio visual; móvil comparte estructura, orden e identidad, con tamaños y controles táctiles adaptados y medios conservados. Se permite scroll natural sin bloqueo de rueda. La revisión de textos exclusivos móviles sigue pendiente.
3. **Archivos:** superar cinco archivos autorizado; la lista está en §8.
4. **Rutas y sitemap:** `/productos` y `/presupuesto` como canonicals; redirecciones 308 desde las variantes con barra y los archivos HTML internos del build; sitemap desde el catálogo; 404/503 para catálogo/fichas verificados localmente, pendientes de alojamiento.
5. **Textos de contenido móvil/PC:** aprobación expresa: Inicio móvil comparte contenido/orden PC y sustituye su párrafo/CTA exclusivos; asesoría sigue disponible en el menú móvil. Las demás secciones toman PC como referencia y conservan información útil móvil y funciones. Reformas mantiene su explicación y CTA de asesoría en adaptación móvil. Profesionales independientes y contratación separada permanecen tanto en el método de Inicio como en Servicios. No hay bloqueo de contenido pendiente para esta implementación.
6. **Datos de identidad:** la dirección visible (`C. de Aquitania, 69, San Blas-Canillejas, 28032 Madrid`) y la del aviso legal (`C/ Aquitania, 69, local 1, 28032 Madrid, España`) no coinciden. El JSON-LD usa la legal. Pendiente de confirmar cuál es la correcta. La cabecera muestra «DESIGN» y la razón social legal es «DESING»: no se cambia el texto visible sin aprobación.

## 7. Estado de tareas (OpenSpec)

Estado vigente: ver §10. Las líneas siguientes describen el cierre del corte de ficha anterior a la aprobación de la portada.

- 1.1: completada.
- 1.2: parcial. Referencia y baseline registrados; falta el inventario de textos/medios y el DOM inicial de referencia.
- 2.4: completada para el corte de ficha con fixtures y navegador real (§9). El gate conjunto de portada/ficha 2.5 sigue pendiente.
- 3.x: parcial. Canonicals y robots aplicados; ficha con HTML inicial y 404/503 locales. Faltan respuesta inicial de otras rutas (H4), matriz completa de metadatos y verificación de redirecciones/servido en Vercel.
- 4.1, 4.2, 4.3: completadas con las limitaciones de §8.
- 4.4: pendiente. El JSON-LD está corregido, pero se monta en cliente: no aparece en el HTML inicial.
- Resto de 2.x, 5.x, 6.x, 7.x, 8.x: pendientes. Las tareas 7.x y 8.x dependen del propietario o de servicios externos.

## 8. Implementación del 2026-10-17 (sin commit)

### 8.1 Archivos modificados y justificación

Se superan los cinco archivos porque el cambio toca configuración de servido, un generador nuevo, metadatos y pruebas. El propietario lo autorizó con la condición de documentar la lista.

| Archivo | Cambio | Motivo |
|---|---|---|
| `vercel.json` | Redirecciones 308 de `/productos/`, `/presupuesto/`, `/aviso-legal/`, `/privacidad/`, `/cookies/`; rewrite de `/sitemap.xml` a `/api/sitemap`; `maxDuration` 30 s para la función | H1, H8, sitemap |
| `public/robots.txt` | Sin `Disallow: /presupuesto/`; permite rutas de lectura pública de catálogo; mantiene `Disallow: /api/` | H5, H4 |
| `public/sitemap.xml` | Eliminado | Sustituido por la función; un archivo estático tendría prioridad sobre la regla |
| `api/sitemap.js` | Nuevo: handler de la función | Sitemap desde catálogo |
| `server/seo/sitemap.js` | Nuevo: enumeración paginada, validación, XML y respuesta 503 | Sitemap completo o fallo explícito |
| `server/seo/sitemap.test.js` | Nuevo: 15 pruebas | Paginación, duplicados, fallos, límites |
| `src/components/BusinessJsonLd.jsx` | Sin `priceRange`; `name`/`legalName`; dirección del aviso legal; `sameAs` con perfil de Google | Datos estructurados veraces |
| `src/components/BusinessJsonLd.test.jsx` | Nuevo | Prueba de datos emitidos |
| `src/features/catalog/pages/CatalogPage.tsx` | Canonical `/productos` | H1 |
| `src/features/catalog/pages/CatalogPage.test.tsx` | Prueba de canonical | H1 |
| `src/features/quote/pages/QuoteSelectionPage.tsx` | Canonical `/presupuesto` | H8 |
| `src/features/quote/pages/QuoteSelectionPage.test.tsx` | Prueba de canonical y noindex | H8, H4 |
| `src/features/legal/LegalPage.test.tsx` | Fixture de canonical actualizado a `/productos` | Coherencia de la prueba |
| `openspec/changes/improve-existing-site-technical-seo/design.md` | Addendum con decisiones y correcciones | Decisión 5 |
| `openspec/changes/improve-existing-site-technical-seo/tasks.md` | 4.1, 4.2 y 4.3 marcadas | Estado real |
| `docs/audit/existing-site-technical-seo-review.md` | Este documento | Registro |

No se han tocado: `CompareSlider`, las secciones de Visión, `assets/`, los medios, los contratos de API, la selección ni el chat. Los cambios ajenos siguen sin commit y sin modificar.

### 8.2 Verificación

- `npm test`: 58 archivos; 524 pruebas pasan; 1 omitida. Base de 506 más 18 nuevas.
- `npm run typecheck`: correcto.
- `npm run lint`: 0 errores; 12 avisos, los mismos que en la base.
- `npm run build`: correcto; JS principal 355,55 kB. `dist/robots.txt` actualizado; `dist/sitemap.xml` no existe.
- Emulación de la función de sitemap (`/tmp/opencode/vercel-emulator.mjs`, fuera del repositorio), con el listado público como upstream (solo lectura):
  - 200, `application/xml; charset=utf-8`, `cache-control` con `s-maxage=3600` y `stale-if-error=86400`.
  - 153 `<loc>`: `/`, `/productos` y 151 fichas. El conjunto coincide con el inventario leído: 0 faltantes, 0 sobrantes. Sin `/productos/`.
  - Upstream inaccesible: 503, `Retry-After: 300`, `Cache-Control: no-store`, sin `<urlset>`. Registro: solo el código de fallo.

### 8.3 Límites y lo que no se ha verificado

- **Vercel no se ha probado** (sin login ni despliegue de vista previa). Pendiente: la redirección de `/productos/` sin bucle, la precedencia de la regla de `/sitemap.xml`, el comportamiento de `stale-if-error` en el CDN y el límite de duración de la función.
- Las páginas de presupuesto, legales y catálogo siguen devolviendo en el HTML inicial el canonical `/` y `index, follow` (H4). Hasta el renderizado previo, Google solo verá el `noindex` tras ejecutar JavaScript.
- El JSON-LD no aparece en el HTML inicial (4.4).
- Fichas inexistentes siguen devolviendo 200 en producción (H3); la corrección local está verificada en §9.
- La portada no está unificada ni pre-renderizada (H7). La adaptación está confirmada (§6.2); queda la decisión sobre textos exclusivos móviles (§6.5).
- Revisión local de capturas y navegador realizada para el corte de ficha e Inicio (§9). La matriz completa y la aprobación del propietario siguen pendientes.
- Sin commit, sin push y sin despliegue.

### 8.4 Próximos pasos

1. Aplicar la interpretación confirmada de «móvil reproduce el diseño PC» (§6.2), con revisión de las diferencias de textos.
2. Head y `noindex` iniciales por ruta para presupuesto, legales y catálogo.
3. Función de ficha con 200/404/503 en el artefacto servido.
4. Portada unificada con CSS responsive, `hydrateRoot` y HTML inicial con contenido real; luego JSON-LD en el HTML inicial.
5. Validación en navegador, referencia `55062aa` frente a la candidata, en escritorio y móvil, claro y oscuro.
6. Confirmar con el propietario los datos de identidad (dirección y nombre) y el perfil de empresa.

### 8.5 Corte de ficha retomado: inventario previo de alcance

Se mantiene la autorización registrada para superar cinco archivos. El corte reutiliza la vista actual; no introduce otro diseño de ficha. Archivos necesarios y responsabilidades:

- `server/seo/head.js`, `server/seo/productPage.js` y sus pruebas: head sin canonical para 404, 503 recuperable sin noindex, carga GET y renderizado del documento.
- `api/product-page.js`, `vercel.json`: conectar la función a la ruta e incluir el shell y el renderer compilados.
- `src/entry-product-server.jsx` (nuevo): renderizar la misma app y normalizador de producto en servidor, sin efectos de navegador.
- `server/seo/build.js` (nuevo), `package.json`: compilar el renderer de ficha y preservar el shell vacío independiente de la portada futura.
- `src/App.jsx`, `src/main.jsx`: inyectar Router/vista/datos para SSR e hidratar solo documentos marcados; mantener lazy la ficha en las demás rutas y montar el asistente después de la activación cliente.
- `src/features/catalog/pages/ProductDetailPage.tsx`: recibir datos iniciales de la petición, reutilizarlos sin doble lectura, mantener reintento y navegación a otras fichas.
- `src/theme/useThemePreference.ts`: snapshot determinista en hidratación, manteniendo el bootstrap de tema previo al pintado.
- `src/routes/routeMeta.ts`: crear/restaurar canonical y robots al salir de una ficha 404; actualizar metadatos sociales coherentes.
- `src/features/legal/LegalPage.tsx`: retirar únicamente el escritor social duplicado que queda sustituido por `routeMeta`; su doble limpieza restauraba metadatos obsoletos.
- `src/features/catalog/model/initialDuplachSelection.ts` (nuevo), `src/features/catalog/components/DuplachVariantSelector.tsx`: compartir el cálculo inicial ya existente del selector con la ficha para emitir desde servidor la misma selección inicial, sin esperar a un efecto cliente.
- Pruebas de integración del renderer y del arranque de ficha: comprobar HTML público, aislamiento, serialización, hidratación y ausencia de segunda petición.

El corte de portada continúa pendiente; no se considera superado el gate 2.5 ni se expande a otras rutas por disponer de este renderer de ficha.

## 9. Resultado del corte de ficha · 2026-10-17

## Ampliación autorizada: portada común y HTML de todas las rutas

Aprobación expresa del propietario recibida después del corte de ficha: Inicio común PC/móvil con imagen vertical, tarjetas apiladas y scroll natural; sustituir el párrafo/CTA exclusivos de Inicio y comprobar asesoría móvil. Resto de secciones con PC como referencia, información útil móvil conservada, contratación separada/profesionales independientes intactos. Completar HTML inicial, JSON-LD y validación, sin commit/push/despliegue.

Inventario previo de esta ampliación (más de cinco archivos autorizado):

- `src/App.jsx`, `src/hooks/useNarrativeScroll.js`, `src/components/Header.jsx`: un solo árbol de secciones, estado de viewport determinista y cabecera elegida por CSS; Router/componentes inyectables en SSR.
- `src/sections/desktop/Inicio.jsx`, `QuienesSomos.jsx`, `Reformas.jsx`, `Vision.jsx`, `Opiniones.jsx`: adaptar las vistas existentes para ambos modos; Coleccion/Contacto conservan contenido y reciben adaptación CSS. No se eliminan las vistas antiguas móviles ni se modifica CompareSlider/medios.
- `src/components/ResponsivePhoto.jsx` (nuevo), `src/styles/index.css`, `src/styles/utilities.css`: picture con variantes aprobadas y reglas responsive locales; estilos desktop preservados donde sea posible.
- `src/routes/pageMeta.ts` (nuevo), `src/routes/routeMeta.ts`, páginas de catálogo/ficha/presupuesto/legal: descriptores comunes entre petición inicial y cliente.
- `src/features/catalog/model/useCatalogDiscovery.ts`: inicializar caché de la misma vista con datos públicos SSR, conservar búsqueda/filtros/carga incremental y reintento.
- `src/entry-server.jsx` (nuevo), `src/entry-product-server.jsx`, `src/main.jsx`, `server/seo/build.js`, `server/seo/head.js`: HTML estático de rutas estables, bootstrap inerte e hidratación compartida.
- `server/seo/catalogPage.js`, `api/catalog-page.js` (nuevos), `server/seo/productPage.js`, `vercel.json`: HTML por petición para catálogo/fichas y servido de páginas estables; métodos GET/HEAD, 404 confirmado y 503 temporal.
- `src/features/quote/components/CatalogSelectionSummary.tsx`: retrasar únicamente el portal de controles flotantes hasta montar en navegador; el resumen inicial permanece vacío, sin acceder a `document` en servidor.
- `src/components/ScrollTopButton.tsx`: mismo tratamiento del portal flotante «Volver arriba», sin tocar umbral ni acción.
- `server/seo/preview.js` (nuevo), `package.json`: adaptador local reproducible del artefacto y las rutas HTTP, con lecturas públicas y transportes de escritura controlados por las pruebas de navegador.
- Pruebas focalizadas de renderizado, hidratación, metadatos, aislamiento de presupuesto y regresiones; actualización de pruebas de landing que esperaban el contenido móvil sustituido expresamente.
- Este informe y los artefactos OpenSpec: decisiones, evidencias y pendientes reales.

### Implementación

- `npm run build` genera cliente y renderer React de ficha (`dist/server/entry-product-server.js`) más shell vacío independiente (`dist/server/shell.html`). No incorpora dependencias nuevas. La función usa ambos artefactos y `vercel.json` incluye `dist/server/**` con un máximo de 15 s y rewrite `/productos/:slug` → `/api/product-page?slug=:slug`.
- La función consulta únicamente GET al origen fijo configurado del catálogo, sin reenviar cookies, datos de contacto o selección. Solo una inexistencia explícita/ficha no pública produce 404. Error de red, timeout, configuración inválida, contrato/renderer inválido o upstream 5xx produce 503 recuperable.
- La respuesta válida incluye la vista `ProductDetailPage` existente y un modelo normalizado de datos públicos en `<template id="lrmq-page-data">`, escapado como texto HTML. El cliente lo decodifica y usa `hydrateRoot`; no requiere JavaScript inline ni debilita CSP. No serializa el JSON upstream completo.
- Los proveedores de selección/asistente se montan una vez y recuperan sus estados locales mediante sus efectos existentes. El asistente se activa después de la hidratación en la entrada SSR, conservando sus chunks lazy. La selección inicial del producto se calcula con la misma regla del selector para evitar el aviso falso de variante incompleta antes del efecto cliente.
- La ficha inicial no dispara otra petición de detalle; al cambiar de slug se recupera el contrato GET habitual. El botón existente «Reintentar» conserva la recuperación desde un 503.
- `routeMeta` aplica/restaura canonical, robots y metadatos sociales, incluso cuando faltan en una entrada 404. `LandingPage` recupera explícitamente el head aprobado de Inicio tras navegar desde un documento de ficha. Se ha retirado exclusivamente el escritor social duplicado de `LegalPage`.

### Comprobaciones automatizadas

| Comando | Resultado |
|---|---|
| `npm test` | 61 archivos; 552 pruebas pasan; 1 omitida preexistente |
| `npm run typecheck` | Correcto |
| `npm run lint` | 0 errores; 11 avisos (12 en baseline; desaparece el del efecto de tema sustituido) |
| `npm run build` | Correcto; cliente JS principal 358,44 kB (109,18 kB gzip), CSS 68,62 kB; renderer SSR 242,05 kB |
| `git diff --check` | Correcto |
| `openspec validate improve-existing-site-technical-seo --strict` | Correcto |

El build SSR avisa `INEFFECTIVE_DYNAMIC_IMPORT` porque la ficha se importa estáticamente en su entrada de servidor y dinámicamente en la app. Es deliberado en el renderer; el cliente conserva un chunk separado de ficha (45,87 kB). No se afirma una mejora de Core Web Vitals: la medición 6.2 sigue pendiente.

Pruebas persistidas: `server/seo/productPage.test.js`, `server/seo/productRender.test.js` y `src/features/catalog/pages/ProductDetailHydration.test.tsx`. Cubren existencia/fallo/timeout, GET/HEAD/405, configuración inválida, serialización, aislamiento entre renderizados, rechazo de identidad diferente, ausencia de segunda lectura, cambio de slug y reintento.

### Navegador y capturas

Chromium headless, movimiento normal, viewports 390×844 y 1366×768, temas claro y oscuro. Mismo fixture público `product-detail.mt-espejos-alba.json` en ambos orígenes (fixture de prueba, no inventario publicado). Las imágenes originales se cargan desde su URL pública y se comprueba `naturalWidth > 0`.

- Referencia: `http://127.0.0.1:4181/productos/mt-espejos-alba` (requiere fixture interceptado por el arnés).
- Candidata controlada: `http://127.0.0.1:4182/productos/mt-espejos-alba`.
- 8 estados de comparación de ficha: sin errores JavaScript ni peticiones POST. Una lectura cliente de detalle en referencia, cero en candidata; el nodo H1 inicial permanece tras hidratar (sin reemplazo del root).
- H1 móvil en `(20; 822,78125)`, ancho 350; escritorio en `(700,9375; 212)`, ancho 569,046875: iguales en referencia y candidata. Ratios, tamaños y fuentes de las imágenes coinciden. Sin overflow horizontal.
- Comprobados «Añadir al presupuesto» (una línea en almacenamiento v3), navegación a Inicio y restauración del título/canonical de portada.
- Peticiones a `missing-product` → 404, noindex y sin canonical; `unavailable` → 503, `Retry-After: 300`, sin noindex ni canonical, con «Reintentar». Hidratación sin errores en ambos estados.
- Contexto sin JavaScript: H1 público presente y selección inicial coherente; el botón «Añadir al presupuesto» conserva el mismo estado habilitado en el HTML (su interacción requiere JavaScript).
- Revisadas visualmente capturas de ficha y de Inicio, incluyendo claro desktop/móvil antes/después. No se han observado cambios de composición. En capturas de ficha varía el anillo/estado temporal del botón del asistente; no se toma como diferencia del contenido de ficha. No se presenta esta comparación como validación de toda la web.

Arnés local (fuera del repo): `/tmp/opencode/seo-product-preview.mjs` sirve el build y usa el handler real con upstream de fixtures controlado; `/tmp/opencode/seo-product-browser.mjs` ejecuta la comparación e intercepta las lecturas de referencia. Informe: `/tmp/opencode/seo-product-browser-report.json`. Capturas: `/tmp/opencode/seo-product-{reference,candidate}-{390,1366}-{light,dark}.png` y `/tmp/opencode/seo-landing-{reference,candidate}-{390,1366}-{light,dark}.png`.

Reproducción en este entorno: `npm run build`, `node /tmp/opencode/seo-product-preview.mjs` (4182 libre) y, en otro terminal, `node /tmp/opencode/seo-product-browser.mjs`. El preview permanece disponible en 4182 para revisar el fixture; no consulta ni escribe en servicios comerciales.

### Límites actuales y siguiente gate

- Esta emulación prueba el artefacto y el handler, no acredita el empaquetado de Vercel, precedencia real del rewrite, caché CDN ni despliegue. Todo ello sigue pendiente.
- Portada unificada, prerender de portada y JSON-LD inicial, catálogo con datos iniciales, presupuesto y legales siguen pendientes. No se marca 2.5/2.6 ni 3.4 completa por haber terminado solo el corte de ficha.
- Queda una decisión de contenido para la portada: PC tiene enlace a Tienda y tarjetas del método; móvil añade párrafo y CTA «Pedir asesoría» en Inicio, y párrafo/CTA propios en Reformas. Un DOM y contenido compartidos requieren acordar si se adopta íntegramente el contenido PC o se conservan estas variantes. No se eliminan textos aprobados por inferencia.
- Aprobación visual del propietario, commit, push y publicación siguen pendientes. Los cuatro cambios ajenos iniciales permanecen fuera de esta implementación.

## 10. Entrega local preparada para revisión · 2026-10-17

Esta sección sustituye los estados pendientes de implementación de las fases anteriores. La aprobación recibida autoriza la adaptación y el trabajo, no acredita aceptación de las capturas finales ni autoriza commit/push/publicación.

### 10.1 Contenido, medios y arquitectura entregados

| Ruta/sección | Contenido y medios conservados / adaptación autorizada |
|---|---|
| Inicio | Un H1 AREA LRMQ; logo, Tienda → `/productos`, DESIGN S.L. y tres tarjetas de `methodSteps`. Móvil usa imagen vertical aprobada, tarjetas en columna, tipografía legible y scroll natural. Sustituido únicamente su párrafo/CTA exclusivos, según aprobación. Asesoría funcional en el menú móvil. Logo móvil estático, sin añadir animación. |
| Quiénes somos | Título aprobado y tres bloques de `aboutContent`; mismas fotos con variantes desktop/móvil de `mediaAssets`. Filas PC conservadas; columna móvil. |
| Servicios | `categories`, foto aprobada y textos PC compartidos. Se conserva íntegra la aclaración de profesionales independientes y contratación separada; también permanece en el método de Inicio. |
| Reformas | Vídeo original de reforma, título y cuatro `projectFacts` compartidos. Móvil conserva explicación útil y CTA de asesoría; vídeo con controles nativos/progreso. PC mantiene scrubbing narrativo. |
| Visión | Un CompareSlider, mismo vídeo/poster/imagen final y copy PC. Móvil conserva reproducción bajo demanda, repetición y comparación táctil/teclado; PC conserva autoplay/retención narrativa. CompareSlider y archivos de medios sin editar. |
| Opiniones | Mismos registros `googleReviews`, estrellas, autores, fechas y enlaces. Carrusel PC conservado; misma lista de figuras adaptada a scroll-snap móvil, sin autoplay móvil. |
| Contacto | Texto, formulario, privacidad, enlaces legales, teléfono, WhatsApp, Instagram y mapa conservados. Orden común PC adaptado a columna móvil. |
| Catálogo/fichas | Vistas actuales, galerías, filtros, búsqueda, orden y botón Cargar más. Datos públicos actuales por petición, normalizados con los mismos modelos que usa el cliente. |
| Presupuesto | Documento inicial genérico vacío. El navegador recupera su selección v3 y preferencias mediante el proveedor existente, sin datos del visitante en el build, HTML o caché compartida. |
| Aviso legal/privacidad/cookies | Mismos textos y estructura; renderizados en build con sus metadatos y noindex iniciales. No se han reescrito los textos legales. |

`App` monta un solo árbol de secciones y un solo conjunto de proveedores. El breakpoint CSS coincide con los umbrales vigentes 1024 px / 560 px; no se cambia `src/data/copy.js`. Se mantienen los componentes móviles anteriores como archivos existentes, pero ya no se montan como una segunda portada ni entran en el bundle activo.

Entradas de servidor: `src/entry-server.jsx` y `src/entry-product-server.jsx`. `server/seo/build.js` genera `dist/index.html`, `dist/presupuesto.html`, `dist/aviso-legal.html`, `dist/privacidad.html`, `dist/cookies.html` y el renderer/shell para las funciones. Las rutas públicas conservan sus URLs; los nombres `.html` internos redirigen a ellas para evitar arranques con un pathname distinto del prerenderizado.

`src/routes/pageMeta.ts` define metadatos compartidos de portada, catálogo, ficha, presupuesto y legales. `routeMeta.ts` aplica/restaura esos descriptores en cliente. `BusinessJsonLd` aparece ya en el HTML inicial de portada (una instancia), con nombre/razón social/dirección legal confirmados y sin priceRange, horarios, stock o valoraciones inventados. La diferencia entre dirección visible/legal y el contraste del Perfil de Empresa permanecen como seguimiento del propietario, sin alterar textos.

El estado público se serializa como texto HTML escapado dentro de un template inerte. El cliente carga el chunk de la ruta y llama a `hydrateRoot`. Los portales flotantes se activan solo al montar en navegador. No se ejecutan POST durante el build/renderizado y no se modifica la CSP.

El bootstrap se consume únicamente en el primer montaje de catálogo/ficha. Al abandonar y volver a montar esa ruta se usa el contrato GET/caché/revalidación habitual, evitando reutilizar indefinidamente una captura inicial de datos. Dos pruebas de regresión comprueban expresamente la actualización tras regresar, además de conservar cero peticiones duplicadas al hidratar. La memoria de consumo se escribe solo en efectos del navegador, nunca durante renderizado de solicitudes.

### 10.2 HTTP/HTML e indexación verificados con el build servido

Evidencia reproducible: `server/seo/documentReview.js`; resultado `/tmp/opencode/seo-document-review.json`.

| Petición representativa | HTTP | Canonical inicial | Robots inicial |
|---|---:|---|---|
| `/` | 200 | `/` | index, follow |
| `/productos` | 200 | `/productos` | index, follow |
| `/productos?page=2` (48 resultados acumulados) | 200 | `/productos?page=2` | index, follow |
| `/productos?search=Alba&sort=name_asc&utm_source=tracking-canary` | 200 | `/productos?search=Alba&sort=name_asc` | noindex, follow |
| `/productos?page=8` (fin del inventario confirmado) | 404 | Omitido | noindex, follow |
| `/productos/mt-espejos-alba` | 200 | Propio | index, follow |
| `/productos/zz-inexistente-seo-review` | 404 | Omitido | noindex, follow |
| `/presupuesto` | 200 | `/presupuesto` | noindex, follow |
| `/aviso-legal`, `/privacidad`, `/cookies` | 200 | Propio | noindex, follow |
| Fallo controlado de lectura de catálogo o ficha | 503 | Omitido | Sin noindex; Retry-After 300 y no-store |

Todas las rutas estables y catálogo entregan H1/contenido propio sin JavaScript en 390×844 y 1366×768; la ficha se verificó también sin JS en el corte anterior. La portada inicial contiene 7 secciones, un H1 y JSON-LD parseable. Tamaños de documento observados: portada 92 482 B; catálogo base 87 484 B; presupuesto 5 975 B, sin formulario personal ni líneas privadas iniciales.

Se comprueban seis alias con barra (incluida ficha) y cinco alias de archivos HTML internos: 308 a la URL canónica, un salto, parámetros conservados. API desconocida sigue siendo 404 JSON y recurso JS desconocido 404 de recurso, sin fallback SPA 200. Página desconocida permanece 404. El adaptador local reproduce estas reglas; su aplicación real en Vercel sigue pendiente.

Catálogo por petición: contrato GET existente, offset/limit, acumulación de las páginas de la URL, timeout global de 8 s y límite de recursos de 100 páginas iniciales (solicitud patológica → 503, no 404 inventado ni truncado silencioso). Final de paginación confirmado antes de la página solicitada → 404; fallo, datos incoherentes, repetición de fichas o respuesta no pública → 503 sin inventario parcial. Ficha explícitamente no publicable/no aprobada → 404, coherente con la exclusión del sitemap. Las API de catálogo, n8n y payloads permanecen sin cambios.

Robots permite documentos y rutas de lectura públicas necesarias, manteniendo Disallow de `/api/` para el resto. No discrimina métodos ni sustituye controles del servidor. Sitemap verificado de nuevo: 153 URLs únicas (portada, catálogo y 151 fichas), sin auxiliares ni alias con barra. Un origen inaccesible produce 503 explícito, no un urlset vacío/parcial.

### 10.3 Validación funcional y privacidad

Arneses persistidos: `server/seo/browserFlows.js` (390 y 1440 px) y `server/seo/documentReview.js`.

- Bienvenida/cierre, apertura/cierre del chat, privacidad desplegable, conversación controlada, contexto, recomendación/enlace, preparación/cancelación de WhatsApp y nueva conversación. Una sola petición por mensaje; sin envío externo.
- Catálogo: reutilización de datos SSR sin segunda lectura inicial, Cargar más, búsqueda, filtros, orden, canonical/noindex de cada clase, Atrás/Adelante y regreso desde ficha conservando consulta **y posición**.
- Comprobación final de retorno: móvil 1098 → 1098 px; escritorio 1073 → 1072 px. El arnés espera resultados filtrados asentados y contrasta la coordenada guardada en el clic, evitando comparar un estado transitorio anterior a terminar el filtrado. Los informes incluyen scrollDiagnostics.
- Galerías/selectores comprobados en siete fichas reales representativas: `mt-espejos-alba`, `royo-nonmodular-alfa-compact`, `royo-modular-alfa`, `gme-mamparas-ducha-akord`, `gme-cassio`, `duplach-stone-plus`, `duplach-stone-3d`.
- Selección: añadir, cambiar cantidades, recargar, sincronizar pestañas, eliminar, recordar sin caducidad, vaciar y retirar únicamente lo confirmado tras envío. Fixture v3 generado desde la ficha pública durante la ejecución; fechas de inactividad no se renuevan al leer. Fixture local expresamente caducado se elimina al hidratar. Las pruebas del esquema vigente cubren además migraciones, temporizador y límites.
- Dos contextos con nombres de producto canario distintos reciben el mismo HTML inicial de presupuesto vacío y recuperan exclusivamente su estado local. Ningún canario aparece en el documento inicial; se conserva updatedAt.
- Formulario de ficha: casilla obligatoria sin POST previo; error y éxito controlados, un POST por intento, payload idéntico y borrador conservado ante error/limpiado tras confirmación. Presupuesto conjunto: mismo contrato, lectura de privacidad en nueva pestaña sin perder el borrador y retiro de selección tras confirmación.
- Por viewport de flujos: 1 POST de chat y 4 POST de presupuesto, todos interceptados (dos intentos en ficha y dos en presupuesto conjunto). No se acredita correo, n8n IA o recepción externa; no hubo entrega comercial real.
- Contacto, WhatsApp, teléfono, Instagram, mapa y legales: destinos conservados; apertura externa interceptada. Acceso «Pedir asesoría» comprobado desde el menú móvil después de sustituir el CTA de Inicio.
- Mismo nodo main y borrador de Contacto conservados al cruzar 390 → 1366 → 1023 → 1024 y 559/560 de alto. Sin duplicar Inicio ni proveedores ni errores de hidratación. Teclado PageDown y rueda narrativos, reproducción/controles móviles de Reformas, repetición y flechas de Visión y swipe mediante eventos táctiles reales de Chromium comprobados.
- 503 servido con el artefacto tanto GET como HEAD (sin cuerpo HEAD), content-type HTML, no-store y Retry-After. Reintentar recupera contenido público en catálogo y ficha con transporte de lectura controlado.

Informes: `/tmp/opencode/seo-flows-390.json`, `/tmp/opencode/seo-flows-1440.json`, `/tmp/opencode/seo-document-review.json` (incluye recuperación desde 503 controlado) y `/tmp/opencode/seo-document-review-final.json` (matriz final, incluidos los alias .html).

### 10.4 Comparación visual y medición local

Referencia `55062aa`, compilación inmutable separada en `/tmp/opencode/reference`. Chromium, datos públicos equivalentes, mismo tema/viewport y puntos asentados de interacción. Para comparar composición se marca la bienvenida como dismissed en ambos orígenes; la bienvenida nueva se valida aparte en los flujos. Los estados de Visión se comparan en el mismo punto del slider y las reseñas se fijan con el mismo control, sin desactivar globalmente las animaciones.

- Siete capítulos comparados en 390×844, 1366×768 y 1440×900, claro/oscuro; también 1023/1024×768 y 1366×559/560 en ambos temas.
- Movimiento normal en la matriz; reducido adicionalmente en 390×844 y 1440×900. En todos los estados desktop comparables, **cero diferencias geométricas superiores a 1 px** en títulos, imágenes y vídeos. Las diferencias de estructura móvil son las autorizadas y registradas en 10.1.
- Comparación adicional de catálogo base/filtrado, ficha, presupuesto vacío/con selección y las tres legales, claro/oscuro, móvil y escritorio: cero diferencias geométricas superiores a 1 px en los elementos medidos. Las capturas esperan URL, encabezado y selección del destino; no se aceptan capturas de fallback lazy como estado final.
- Revisión visual realizada de capturas y montajes desktop/móvil claros/oscuros. Se conservan composición PC, tipografía, medios, ratios y navegación; la nueva portada móvil es legible y usa scroll natural. Se corrigió el source del picture que inicialmente participaba como celda de la cuadrícula; la comparación posterior vuelve a coincidir.
- Firefox: comprobación adicional 390×844 de portada, catálogo, presupuesto y privacidad, con contenido inicial y sin errores JS. No sustituye una revisión en Safari/iPhone físico, que sigue externa.

Capturas y métricas: `/tmp/opencode/seo-review-<ancho>x<alto>-<tema>-<movimiento>.json` y PNG asociados. Arneses `server/seo/browserReview.js` y `server/seo/browserRoutes.js`; informes de rutas `/tmp/opencode/seo-route-review-<ancho>-<tema>.json`. Montajes de revisión: `/tmp/opencode/seo-montage-1366x768-light.png`, `seo-montage-1440x900-dark.png`, `seo-montage-mobile-{light,dark}.png` y montajes `seo-montage-routes-*`; capturas seleccionadas de presupuesto `seo-route-{reference,candidate}-<ancho>-<tema>-selected.png` revisadas tras esperar la navegación completa.

Medición de laboratorio por PerformanceObserver, sin throttling, hasta antes de la primera interacción; un punto por contexto, no percentil 75. Orden/cachés y carga local pueden influir. Muestras representativas de movimiento normal:

| Viewport/tema | LCP referencia → candidata | CLS referencia → candidata |
|---|---|---|
| 390×844 claro | 536 → 200 ms | 0,000293 → 0,000349 |
| 1366×768 claro | 440 → 216 ms | 0,001376 → 0,001529 |
| 1440×900 claro | 728 → 268 ms | 0,001199 → 0,001199 |
| 1440×900 oscuro | 532 → 232 ms | 0,001147 → 0,001036 |
| 1366×560 claro | 448 → 220 ms | 0,016471 → 0,025110 |

Las variaciones CLS de la adaptación/medición quedan por debajo de 0,1 en estas muestras; no se presenta el orden de LCP como mejora de campo demostrada. No hay muestra de INP de campo ni acceso acreditado a Search Console/CrUX. No se afirma cumplimiento de Core Web Vitals de campo ni aceptación del propietario.

### 10.5 Comprobaciones finales y archivos

| Comprobación | Resultado final |
|---|---|
| `npm test` | 63 archivos; **573 pruebas pasan**, 1 omitida preexistente |
| `npm run typecheck` | Correcto |
| `npm run lint` | 0 errores, 10 avisos (12 en baseline; retirados los avisos de efectos sustituidos de tema/Visión) |
| `npm run build` | Cliente + renderer + HTML estable correctos; JS principal 356,69 kB (111,29 kB gzip), CSS 71,79 kB; renderer 316,63 kB |
| `git diff --check` | Correcto |
| `openspec validate improve-existing-site-technical-seo --strict` | Correcto |

Se conservan los avisos de JSDOM por pause() no implementado; no son fallos de aserción. En una ejecución de la suite simultánea con varios navegadores, el test temporizado de galería GME IO agotó su espera; pasó aislado y la suite completa posterior, sin contención de esos navegadores, pasó sin cambiar sus aserciones ni ampliar el timeout. El aviso SSR INEFFECTIVE_DYNAMIC_IMPORT afecta a las cuatro vistas importadas estáticamente por la entrada servidor: es deliberado; las rutas siguen teniendo chunks separados en cliente.

Además del inventario de §8/§9, pruebas/arneses nuevos exactos: `server/seo/catalogPage.test.js`, `server/seo/staticRender.test.js`, `server/seo/browserReview.js`, `server/seo/browserFlows.js`, `server/seo/browserRoutes.js`, `server/seo/documentReview.js`, `server/seo/preview.js`. Pruebas existentes ajustadas: LandingPage (consulta del menú responsive), CatalogPage (canonical y página fuera de rango; fixture de perfil Royo en una página válida), QuoteSelectionPage (canonical/noindex), LegalPage (canonical coherente). No se cambia ningún archivo protegido de medios, CompareSlider, datos de umbrales, proxy/API de negocio, workflows, modelo de selección ni contrato de chat.

Los cuatro cambios ajenos iniciales siguen fuera del alcance y no se han editado. HEAD continúa en `55062aa`, rama main, sin commit local nuevo, sin push ni despliegue.

### 10.6 Reproducción y URLs de revisión

- **Candidata:** `http://127.0.0.1:4182/`; `npm run build` y `npm run preview:seo` desde este repo. El preview sirve el artefacto y las reglas, consulta únicamente lecturas públicas y responde 405 a escrituras sin interceptar. Los formularios de los arneses usan respuestas controladas.
- **Referencia para revisión manual completa:** `http://127.0.0.1:4183/`; `node /tmp/opencode/seo-reference-preview.mjs`. Sirve exclusivamente los archivos compilados de `55062aa` en `/tmp/opencode/reference/dist` y el contrato GET sin cambios para las lecturas públicas. No modifica la referencia ni habilita envíos reales.
- **Referencia usada en capturas:** `http://127.0.0.1:4181/`, Vite preview del mismo snapshot. Los arneses de rutas interceptan allí los GET para usar las mismas fuentes públicas; no usar su fallback Vite como evidencia HTTP de Vercel.
- Dependencias de la referencia instaladas en su carpeta; no se ha compartido node_modules ni copiado almacenamiento de visitantes. El almacenamiento separado por puerto es esperado; los arneses crean fixtures locales equivalentes. Fixture individual inicial: `product-detail.mt-espejos-alba.json`; ampliación con lecturas públicas verificadas el 2026-10-17. Selección de prueba v3: ventana de 7 días, recordar opcional, fechas generadas durante cada ejecución y comprobadas sin renovación al leer.

Comandos de evidencia: `node server/seo/documentReview.js`; `node server/seo/browserFlows.js 390` y `1440`; `node server/seo/browserReview.js 1366 768 light` (parámetros ancho/alto/tema y opcional reduce); `node server/seo/browserRoutes.js 390 light` (ancho/tema). Un segundo preview con puerto distinto y upstream de lectura inaccesible permite verificar 503; `SEO_FAILURE_ORIGIN=<origen>` activa también recuperación controlada en documentReview. Ningún arnés necesita credenciales ni envía mensajes reales.

### 10.7 Estado OpenSpec y pendientes reales

**28/34 tareas completas localmente.** Se mantienen abiertas:

- **1.3:** no se creó la rama/worktree candidata formal prevista. La fuente candidata sigue en la raíz actual y la referencia es una copia inmutable separada del commit; comparación de archivos/puertos y dependencias separados sí realizada. No presentar esta alternativa como un worktree creado ni dar la casilla por terminada.
- **7.1:** revisión y aceptación visual final del propietario. La aprobación de la propuesta no completa esta tarea.
- **7.2:** coordinación/integración y cualquier commit/push, solo tras autorización correspondiente.
- **8.1 (Vercel):** verificar empaquetado Node/includeFiles de renderer/shell, ejecución del build estático, precedencia de rewrites, 308 (barras y archivos HTML) sin bucles y con queries, 404/503/content-types de documentos frente a APIs/assets, CSP/recursos, maxDuration y comportamiento real de caché CDN/stale-if-error. Repetir la matriz del dominio publicado, incluido robots/sitemap/JSON-LD. No hay despliegue de esta candidata ni evidencia de esta revisión en Vercel.
- **8.2:** Search Console, verificación DNS efectiva, sitemap, inspección de renderizado/canonical elegido e indexación: acceso/evidencia pendientes. Enviar sitemap y lograr indexación son hitos distintos.
- **8.3:** rutina entregada, pendiente acordar responsable y aceptación: revisar incidencias/consultas tras publicación; revisión mensual de consultas comerciales conocidas/rendimiento de búsqueda cuando exista acceso; repetir inventario/URLs tras cambios de catálogo. No requiere analítica adicional ni nuevo contenido. Mantener también el contraste de dirección/Perfil de Empresa como seguimiento del propietario.

Safari/iPhone físico y entrega real de proveedores siguen fuera de la evidencia local. No se han inventado aceptación, hosting, verificación DNS, indexación ni resultados de entrega externa.

## 11. Incidencia en producción tras el despliegue de `2e08e35` · 2026-10-17

Síntoma reportado y reproducido por lectura pública: `https://arealrmq.es/productos` y `/productos/mt-espejos-alba` respondían 503 con los documentos de emergencia de los handlers, de forma consistente, mientras las fuentes públicas `/api/catalog/config` y `/api/catalog/products?limit=1&offset=0&include_facets=false` respondían 200 con datos, y `sitemap.xml` seguía obteniendo 200 con 153 URL (application/xml).

### 11.1 Diagnóstico

- `/presupuesto` y `/privacidad` servían 200 el HTML prerrenderizado de `server/seo/build.js` (canonical y head correctos): el paso SSR del build sí se ejecutó en la VM de Vercel y `dist/server/*` existió en el directorio de salida.
- Las funciones `/api/catalog/*` (preexistentes) y `api/sitemap.js` funcionaban: upstream n8n y variables `N8N_*_UPSTREAM_BASE_URL` alcanzables desde las funciones. Descartada caída de n8n y de configuración.
- El 503 de ficha coincidía con el documento de `FALLBACK_TEMPLATE` (fase shell-unavailable o template-invalid del handler); el 503 de catálogo con el documento de emergencia del catch. Ambos caracterizan fallo en localizar/cargar la shell o el renderer dentro del sandbox de la función.
- Causa identificada (capa concretamente en producción, no reproducible localmente): los dos artefactos críticos se cargaban por lectura de fichero (`new URL('../dist/server/shell.html', import.meta.url)`) y por importación dinámica, con `includeFiles: "dist/server/**"` como única red de entrega de ficheros al sandbox. Cualquier discrepancia del empaquetado (@vercel/node: trazado nft del import dinámico, resolución de `import.meta.url` en la entrada compilada o cobertura del glob) dejaba la función sin artefactos y derivaba en el documento de emergencia 503, sin evidencia diferenciada en el cuerpo.
- Los logs remotos no estaban disponibles desde este entorno; la corrección prioriza que el fallo no dependa de esa entrega y que sea observables las fases.

### 11.2 Corrección

- `server/seo/build.js`: escribe la shell también como módulo ESM trazable `dist/server/shell.js` (además del `shell.html` existente, que queda como reserva de lectura) y compila el renderer como bundle ESM autocontenido de un solo fichero (`ssr.noExternal` + `inlineDynamicImports`): sin chunks hermanos ni imports de react en runtime del sandbox. Validado por `package:seo` en un sandbox sin node_modules.
- `server/seo/artifacts.js` (nuevo): `loadShellArtifact` importa primero el módulo trazado y, como reserva, lee `dist/server/shell.html` en dos ubicaciones (URL módulo y cwd); `loadRendererArtifact` importa el bundle dinámicamente y valida sus exports. Todo fallo se clasifica en fases cerradas `shell-missing | shell-io | shell-invalid | renderer-import | renderer-contract`, con clase de error pública (código/nombre), nunca rutas ni mensajes del intérprete.
- `api/product-page.js` y `api/catalog-page.js`: usan los cargadores clasificados; cada 503 añade cabecera `X-LRMQ-Diag` con el valor `fase` o `fase:clase` y consolida en el log el evento `*_page.diagnostic`. Los status, Retry-After, no-store, robots y cuerpos quedan idénticos; no se devuelve nunca 200 a cambio de ocultar el fallo.
- `server/seo/catalogPage.js`: separa etapas (shell → renderer → normalización/render → upstream). La indisponibilidad del servicio sigue sirviendo la vista hidratable del renderer con botón «Reintentar» (igual que antes del despliegue);
 `loadCatalogPages` devuelve `reason` clasificada (`not-configured | request-limit | timeout | network | upstream-status | response-limit | invalid-body | contract | inventory`) que alimenta `X-LRMQ-Diag`. El documento de emergencia sin estilos queda reservado a fallos de pipeline.
- `vercel.json`, rutas, rewrites, sitemap y robots: sin cambios.
- `package.json`: añade `npm run package:seo` (`server/seo/packageCheck.js`).

Evidencia de la primera corrección desplegada (`4f6c8cc`): las cabeceras de diagnóstico señalaron en producción `X-LRMQ-Diag: renderer-import` en `/productos` y en la ficha, con `/presupuesto` en 200. Es decir: la shell sí se cargaba y el paso fallido era el `import` del bundle del renderer dentro del sandbox, consistente con dependencias/chunks que el empaquetado no entregaba; no se dispuso de logs remotos. La segunda iteración elimina esa dependencia: bundle autocontenido de un fichero y fase/clase en la cabecera.

### 11.3 Comprobación del empaquetado (representativa del runtime serverless)

`node server/seo/packageCheck.js` tras `npm run build`:
1. Verifica que el bundle del renderer es autocontenido, sin imports de dependencias externas salvo módulos nativos de Node.
2. Copia `dist/server/**` (el alcance declarado en `includeFiles`) a un sandbox temporal **sin node_modules**, y en ese árbol aislado importa y ejecuta el renderer (estáticas, catálogo 503, ficha 404) y la shell módulo. Resultado: `package-seo ok`. `npm run build` ejecuta obligatoriamente esta comprobación al terminar el build; un fallo devuelve estado no cero antes de desplegar.
3. No equivale a evidencia de Vercel: el empaquetado real (@vercel/node, nft, runtime) solo se confirma con despliegue, logs o las cabeceras `X-LRMQ-Diag` en producción.

### 11.4 Verificación local ejecutada tras la corrección

- Suite completa: 64 archivos, 582 pruebas pasan, 1 omitida preexistente. Lint 0 errores/10 avisos conocidos; typecheck OK; `git diff --check` limpio.
- Batería HTTP/no-JS (`documentReview.js`, informe `/tmp/opencode/seo-document-review-incident-fix.json`): 11 documentos correctos, canonical/robots/sitemap, alias y 308; 503 con upstream caído en `/productos` y ficha (Retry-After 300, no-store, `X-LRMQ-Diag: network`), recuperación al reintentar sin errores de página; sitemap 153 URLs.
- Flujos de navegador completos a 1440 y 390 (`browserFlows.js`): 14 y 15 flujos sin errores, apertura directa, recarga, navegación cliente, hidratación sin petición duplicada, 1 POST de chat y 4 POST de presupuesto controlados, sin entrega externa.
- Empaquetado (`npm run package:seo`): correcto; sandbox sin node_modules.
- Sitemap: sin cambios; verificación externa vigente (200, application/xml, 153 URLs). El error de Search Console al leerlo no se atribuye al 503 de las fichas ni a ningún cambio del sitemap: se desconoce el detalle y sigue pendiente de la Vista al detalle de Search Console.

### 11.5 Verificación en producción tras desplegar `1067d56` (2026-10-17)

- `/productos`: 200 con HTML inicial (título `Catálogo de baños a medida · AREA LRMQ`), canonical propio y `index, follow`; recargas idénticas entre sí; `?page=2` 200 indexable.
- `/productos/mt-espejos-alba`: 200, canonical de ficha, bootstrap `lrmq-page-data` presente.
- Ficha inexistente `/productos/zz-inexistente-seo-review`: 404, `X-Robots-Tag: noindex, follow`, sin canonical.
- `/presupuesto`: 200 prerrenderizado. `/sitemap.xml`: 200, `application/xml`, 153 URLs.
- Smoke de hidratación en producción (solo lecturas GET, sin envíos): catálogo hidratado con 24 artículos, ficha con encabezado `Alba`, cero errores de página o consola.
- Segundo 503 observado ya no reproducible; si se repitiera, `X-LRMQ-Diag` debe distinguir `fase:clase` sin logs.

### 11.6 Pendientes en producción (no verificable desde este entorno)

- Lectura de logs de Vercel de las funciones para correlacionar fases si reapareciera algún 503.
- Vista al detalle de Search Console sobre sitemap.xml (pendiente; sin atribución de causa).
- Habilidad de retry del 503 bajo carga de CDN: las respuestas 503 son no-store; elyty la CDN puede servir snapshots prerenderizados solo para rutas estáticas, no para las funciones.
