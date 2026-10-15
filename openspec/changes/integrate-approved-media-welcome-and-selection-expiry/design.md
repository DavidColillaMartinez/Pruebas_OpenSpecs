# Design

## Contexto

- HEAD `8dc00cc`. Vista desktop = ancho ≥1024 y alto ≥560 (`isNarrativeViewport`); móvil el resto. La web tiene 7 capítulos
  con reveal por pasos y un mecanismo de ajuste proporcional (`--lrmq-fit-scale`) por capítulo.
- Medios nuevos: base `https://assets.colilladavid.es/proyectos/lrmq/site/media-20261015` (verificado HTTP 200/ MIME correcto
  para los 42 archivos). Manifiesto externo aporta anchos reales; no se copia a Git.
- Selección actual (`src/features/quote/model/selectionStore.tsx`): clave `lrmq:quote-selection:v2`, sin TTL, escribe al
  montar. `removeLines` solo quita líneas enviadas tras confirmación válida.

## Goals / Non-Goals

- Goals: consumir el lote por URL; jerarquía de textos exacta; bienvenida sin superficie extra; selección v3 con TTL.
- Non-Goals: nueva generación/retoque de fotos, fallbacks binarios, almacenamiento de datos personales, CMP/legal certificado.

## 1. Configuración de medios (`src/config/mediaAssets.ts`)

- `LRMQ_ASSET_BASE_URL` se mantiene (`…/site`); nueva constante pública `LRMQ_MEDIA_BASE_URL = …/site/media-20261015`.
- `LRMQ_ASSETS`: `logo → logo-principal.webp`, `mark → logo-marca-512.webp`, `sketchVideo → vision-boceto.mp4`,
  `sketchPoster → vision-boceto-poster.webp`, `sketchFinal → vision-boceto-final.webp`,
  `renovationVideo → reforma-proceso.mp4`, `review(name) → reviews/{name}.webp`. Añade `socialLogo` con el PNG existente
  para separar el logo de interfaz (`logo`) del recurso Open Graph/Twitter (solo en `index.html`, que no cambia).
- Nuevo `LRMQ_PHOTOS` con grupos reales del manifiesto; cada grupo expone `src`, `srcSet` y `sizes` recomendados.
  Las fotos de Quiénes/Servicios/Catálogo y de reseñas pasan por helpers, sin copiar el manifiesto completo.

## 2. Consumo responsivo

- **Inicio desktop**: `<picture>` con `<source media="(max-width: 1023.98px)">` para la variante vertical y `srcset`
  960/1440/1672 para desktop; `alt=""` (fondo decorativo), `eager`, gradiente oscuro intacto.
- **Inicio móvil**: se añade el fondo vertical (480/768/1152) como background con superposición ligera; la sección ya no
  queda plana; se comprueba contraste del texto en claro y oscuro sin overlay excesivo.
- **Quiénes somos**: desktop consume los detalles 2,7:1 (480/880) con citas centradas en los strips `h-32/36/40`
  (`object-cover`, `object-center`); Erase Equipo usa 480/960/1448. Móvil usa los originales verticales en la caja
  `aspect-[16/10]` con `object-position` local (experiencia/compromiso) para mostrar más contexto.
- **Servicios**: escalera 640/1024/1536 conserva obra y acabado (un solo bloque, sin tarjetas nuevas).
- **Catálogo (`CatalogMasthead`)**: fachada 640/1280/2048, `sizes` existente, alt real (no baño), se elimina la lógica
  `w=2200` de Unsplash.
- **Reseñas**: la tabla solo cambia la extensión de fichero a WebP; autores, textos, enlaces y orden intactos.
- **Favicon**: `logo-marca-512.webp` con `type="image/webp"`. JSON-LD puede usar `logo` (WebP nuevo).
- Comprobación de red: solo se descarga la variante de viewport activa (sin doble descarga del hero).

## 3. Jerarquía de textos

- Servicios: `categories[0].title = 'Reformas integrales'`; desktop y móvil suprimen la etiqueta cuando `label === title`
  (criterio exacto, no por índice) y ningún otro texto cambia.
- Quiénes somos: el antiguo h2 desaparece; el párrafo aprobado se convierte en h2 (con `id` en móvil para
  `aria-labelledby`). Sin duplicado como párrafo; los tres bloques intactos. Tipografía local del h2 ajustada
  (tamaño/línea/anchura) para portátiles cortos sin tocar la escala global ni el fit-scale.

## 4. Bienvenida móvil (defecto de primera entrada)

- Causa reproducida en navegador: `body:has(.assistant-welcome)` infla `--lrmq-tool-region` +180 px (total ≈244 px) y
  `body::after` pinta una franja opaca fija del tamaño de la región; el contenido principal se acorta y la franja tapa la
  web detrás de la burbuja.
- Arreglo: eliminar la inflación de la región para la burbuja (regla y su media query); la burbuja es una tarjeta flotante
  sobre el dock de 64 px, con su propio fondo. Se conservan apertura/aparición temporal, autodescarte, teclado,
  reduced-motion, safe-area y la inhibición desktop existente (`useFloatingSurface` sin cambios).

## 5. Selección con caducidad v3

- Registro `{ version: 3, lines: [...] (sin notas), remember: boolean, updatedAt: number, expiresAt: number | null }`.
- Semántica:
  - Por defecto: `remember=false`; `expiresAt = updatedAt + 7 días`.
  - «Recordar mi selección en este dispositivo hasta que la borre» (checkbox, desmarcado por defecto, compartido entre
    resumen de la cesta y página de presupuesto): al activar, `expiresAt=null`; al desactivar, 7 días desde ese momento.
  - Solo un cambio real renueva: add/update/remove/clear producen nuevo array; una escritura con valores equivalentes no
    toca metadatos (comparación de líneas normalizadas).
  - Lectura/visitas/recarga/rerender no escriben: la hidratación es read-only salvo el descarte de expirados o migración.
  - Expire>now al montar → descartar líneas (memoria y clave). `visibilitychange`/`focus` re-leen para no mantener estado
    vencido en pestañas largas; sin depender de timers de fondo.
  - `storage` nativo sincroniza pestañas sin dependencias; no renueva; no restaura una selección ya vaciada/caducada si la
    pestaña vieja conserva su estado; gran foco/visibilidad maneja ese caso.
  - Vaciar/ eliminar todas → se elimina la clave y el modo vuelve a por defecto. Errar tras envío conserva líneas y metadatos.
  - Migración: registro v2 (array u objeto `version:2`) con líneas válidas migra una vez a v3 con `remember=false` y 7 días
    desde la migración; no se re-migra a cada visita (write-once durante el primer render; siguientes lecturas ven v3).
    Corrupto/sele vacío se descarta sin reanimar.
  - Storage no disponible/corrupto: try/catch en lecturas/escrituras; la memoria manda.
- UI de la opción compartida en `CatalogSelectionSummary` y `QuoteSelectionPage`; no es consentimiento de marketing.
- `clear()` de «Vaciar selección» elimina productos y metadatos (clave entera).

## 6. Textos legales

- `/cookies` tabla «Selección de productos»: 7 días sin cambios por defecto; con «Recordar» se conserva hasta borrarla;
  se menciona la casilla en el texto afectado. Privacidad «Conservación»: mismo ajuste mínimo. Sin claves técnicas ni
  certificaciones nuevas.

## Trade-offs

- Sin franja de reserva, la burbuja cubre temporalmente contenido inferior durante ≤8 s; es el comportamiento aprobado.
- `expiresAt` es orientativo (client-side); con la web cerrada no corre JS (aprobado por propietario).
