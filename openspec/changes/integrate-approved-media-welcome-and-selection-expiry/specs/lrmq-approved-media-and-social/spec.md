## ADDED Requirements

### Requirement: Approved media batch served from the VPS base
El lote definitivo SHALL consumirse exclusivamente por URL pública VPS, sin binarios en el repositorio.
La web consume el lote definitivo exclusivamente por URL pública
`https://assets.colilladavid.es/proyectos/lrmq/site/media-20261015/…`, centralizado en `src/config/mediaAssets.ts`.
No se copian binarios ni manifiestos al repositorio y no existe código de fallback local.

#### Scenario: Configuration exposes the new base and names
- **WHEN** se inspecciona `src/config/mediaAssets.ts`
- **THEN** `LRMQ_MEDIA_BASE_URL` apunta a `…/site/media-20261015` y `LRMQ_ASSETS` usa `logo-principal.webp`,
  `logo-marca-512.webp`, `vision-boceto.mp4`, `vision-boceto-poster.webp`, `vision-boceto-final.webp`,
  `reforma-proceso.mp4` y `reviews/*.webp`

#### Scenario: No repository binaries or fallbacks
- **WHEN** se revisa el resultado del cambio
- **THEN** no se añaden imágenes, vídeos, ZIP, capturas ni `public/media/` al repositorio, y ninguna imagen del lote se
  resuelve mediante import local, base64 o fallback

### Requirement: Rule-based hero and section photographs with real variants
Las fotografías SHALL seleccionarse con picture/srcSet/sizes según los anchos reales del manifiesto.
Las fotografías del index y del masthead de catálogo se seleccionan con `<picture>`/srcSet/sizes según los anchos reales del
manifiesto y los breakpoints de la aplicación (1024 px), evitando descargas duplicadas de la misma foto.

#### Scenario: Landing hero per viewport
- **WHEN** se carga Inicio con ancho ≥1024 y alto ≥560
- **THEN** el navegador pide una variante de `fotos/inicio-cocina-desktop-*.webp` y no descarga la vertical de móvil

#### Scenario: Mobile hero per viewport
- **WHEN** se carga Inicio con ancho <1024
- **THEN** el navegador pide una variante de `fotos/inicio-cocina-movil-*.webp` con una única descarga efectiva

#### Scenario: Quiénes somos uses approved crops per viewport
- **WHEN** se visualiza Quiénes somos en desktop
- **THEN** Experiencia y Compromiso usan los detalles 2,7:1 (`quienes-experiencia-desktop-*`,
  `quienes-compromiso-desktop-*`) y Equipo usa `quienes-equipo-*`, ambos reconocibles sin recortes indebidos

#### Scenario: Mobile uses the original vertical photos
- **WHEN** se visualiza Quiénes somos en móvil
- **THEN** Experiencia y Compromiso usan las originales verticales (`*-movil-*`) con foco local en la caja 16:10

#### Scenario: Servicios main image keeps both halves
- **WHEN** se muestra la tarjeta principal de Servicios
- **THEN** se usa `servicios-escalera-*` manteniendo obra y acabado, sin sustituir Visión/CompareSlider ni crear tarjetas nuevas

#### Scenario: Catalog masthead uses the store facade
- **WHEN** se carga `/productos`
- **THEN** el masthead muestra `catalogo-fachada-*` con srcset 640/1280/2048, desaparece la lógica `w=2200` de Unsplash y el
  alt describe la fachada, no un baño

#### Scenario: Reviews images keep identity
- **WHEN** se compara el capítulo Opiniones antes y después
- **THEN** autores, textos, enlaces y orden no cambian y todas las miniaturas usan `reviews/reviewer-NN.webp`

### Requirement: Social PNG exception and WebP interface logo
El logo de interfaz y el favicon SHALL usar el WebP nuevo; el PNG de Open Graph y Twitter SHALL conservarse.
El logotipo de interfaz y el favicon usan el WebP nuevo; `.logopng.png` se conserva para Open Graph/Twitter.

#### Scenario: Favicon points to the new mark
- **WHEN** se inspecciona `index.html`
- **THEN** `link[rel="icon"]` apunta a `media-20261015/logo-marca-512.webp` con `type="image/webp"`

#### Scenario: Social metadata keeps the PNG
- **WHEN** se inspeccionan los metadatos og/twitter
- **THEN** `og:image` y `twitter:image` siguen siendo `https://assets.colilladavid.es/proyectos/lrmq/site/logopng.png`

#### Scenario: JSON-LD may reference the WebP logo
- **WHEN** se inspecciona el JSON-LD de negocio
- **THEN** su imagen es el logo WebP público correcto y el diseño visual no cambia
