export const LRMQ_ASSET_BASE_URL = 'https://assets.colilladavid.es/proyectos/lrmq/site';

const asset = (relativePath: string) => `${LRMQ_ASSET_BASE_URL}/${relativePath}`;

export const LRMQ_ASSETS = Object.freeze({
  logo: asset('logopng.png'),
  mark: asset('logo-area-lrmq.webp'),
  sketchVideo: asset('boceto-video.mp4'),
  sketchPoster: asset('boceto-poster.webp'),
  sketchFinal: asset('boceto-final.png'),
  renovationVideo: asset('reforma-bano.mp4'),
  review: (filename: string) => asset(`reviews/${filename}`),
});
