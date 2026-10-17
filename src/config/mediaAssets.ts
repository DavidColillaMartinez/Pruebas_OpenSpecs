export const LRMQ_ASSET_BASE_URL = 'https://assets.colilladavid.es/proyectos/lrmq/site';
// Batch media-20261015: approved final photos/videos converted by the owner and
// served from the VPS. Consumed by URL only: no repository binaries or fallbacks.
export const LRMQ_MEDIA_BASE_URL = `${LRMQ_ASSET_BASE_URL}/media-20261015`;

const asset = (relativePath: string) => `${LRMQ_ASSET_BASE_URL}/${relativePath}`;
const media = (relativePath: string) => `${LRMQ_MEDIA_BASE_URL}/${relativePath}`;

export const LRMQ_ASSETS = Object.freeze({
  logo: media('logo-principal.webp'),
  mark: media('logo-marca-512.webp'),
  // Open Graph / Twitter keep the existing PNG resource (deliberate exception).
  socialLogo: asset('logopng.png'),
  sketchVideo: media('vision-boceto.mp4'),
  sketchPoster: media('vision-boceto-poster.webp'),
  sketchFinal: media('vision-boceto-final.webp'),
  renovationVideo: media('reforma-proceso.mp4'),
  review: (filename: string) => media(`reviews/${filename}`),
});

export type LrmqPhotoVariant = { src: string; srcSet: string; sizes: string };

function photo(filePattern: string, widths: readonly number[], sizes: string): LrmqPhotoVariant {
  const widest = widths[widths.length - 1];
  return {
    src: media(filePattern.replace('{w}', String(widest))),
    srcSet: widths.map((width) => `${media(filePattern.replace('{w}', String(width)))} ${width}w`).join(', '),
    sizes,
  };
}

export type LrmqResponsivePhoto = { desktop: LrmqPhotoVariant; mobile: LrmqPhotoVariant };

function responsivePhoto(
  desktopPattern: string,
  desktopWidths: readonly number[],
  mobilePattern: string,
  mobileWidths: readonly number[],
  sizes: string,
): LrmqResponsivePhoto {
  return { desktop: photo(desktopPattern, desktopWidths, sizes), mobile: photo(mobilePattern, mobileWidths, sizes) };
}

// Real pixel widths from MANIFIESTO-MEDIOS.json; only the URLs/metadata the
// code needs are mirrored here.
// Match the existing max-w-5xl grids before their optional fit-down transform:
// 88px chapter gutter + 48px panel padding; about gap 28px, 0.8/1.8 column;
// services gap 40px, 1/1.76 column. Natural flow is one column, also at short
// desktop heights. Keep conservative upper bounds rather than under-resolving.
const aboutSizes = '(min-width: 1024px) and (min-height: 560px) min(443px, calc(44.445vw - 73px)), min(1024px, calc(100vw - 48px))';
const servicesSizes = '(min-width: 1024px) and (min-height: 560px) min(560px, calc(56.819vw - 100px)), min(1024px, calc(100vw - 48px))';
export const LRMQ_PHOTOS = Object.freeze({
  inicioCocina: responsivePhoto('fotos/inicio-cocina-desktop-{w}.webp', [960, 1440, 1672], 'fotos/inicio-cocina-movil-{w}.webp', [480, 768, 1152], '100vw'),
  quienesExperiencia: responsivePhoto('fotos/quienes-experiencia-desktop-{w}.webp', [480, 880], 'fotos/quienes-experiencia-movil-{w}.webp', [480, 960], aboutSizes),
  quienesEquipo: photo('fotos/quienes-equipo-{w}.webp', [480, 960, 1448], aboutSizes),
  quienesCompromiso: responsivePhoto('fotos/quienes-compromiso-desktop-{w}.webp', [480, 880], 'fotos/quienes-compromiso-movil-{w}.webp', [480, 941], aboutSizes),
  serviciosEscalera: photo('fotos/servicios-escalera-{w}.webp', [640, 1024, 1536], servicesSizes),
  catalogoFachada: photo('fotos/catalogo-fachada-{w}.webp', [640, 1280, 2048], '(min-width: 1024px) 59vw, 100vw'),
} satisfies Record<string, LrmqResponsivePhoto | LrmqPhotoVariant>);
