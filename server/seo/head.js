// Metadatos iniciales compartidos por el prerender (build) y por la función de
// fichas. Cada plantilla debe contener exactamente una etiqueta de cada tipo;
// si falta alguna, el build o la respuesta fallan en lugar de servir un head
// incompleto.

export const SITE_ORIGIN = 'https://arealrmq.es';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function absoluteUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) throw new TypeError('canonical path must start with /');
  return `${SITE_ORIGIN}${path}`;
}

// Each entry: the pattern that must match exactly once in the template, and how
// to render the replacement for the given metadata.
const HEAD_TAGS = Object.freeze([
  { name: 'title', pattern: /<title>[\s\S]*?<\/title>/g, render: (meta) => `<title>${escapeAttribute(meta.title)}</title>` },
  { name: 'description', pattern: /<meta name="description" content="[^"]*"\s*\/?>/g, render: (meta) => `<meta name="description" content="${escapeAttribute(meta.description)}" />` },
  { name: 'canonical', pattern: /<link rel="canonical" href="[^"]*"\s*\/?>/g, render: (meta) => meta.canonicalPath === null ? '' : `<link rel="canonical" href="${escapeAttribute(absoluteUrl(meta.canonicalPath))}" />` },
  { name: 'robots', pattern: /<meta name="robots" content="[^"]*"\s*\/?>/g, render: (meta) => `<meta name="robots" content="${escapeAttribute(meta.robots)}" />` },
  { name: 'og:title', pattern: /<meta property="og:title" content="[^"]*"\s*\/?>/g, render: (meta) => `<meta property="og:title" content="${escapeAttribute(meta.title)}" />` },
  { name: 'og:description', pattern: /<meta property="og:description" content="[^"]*"\s*\/?>/g, render: (meta) => `<meta property="og:description" content="${escapeAttribute(meta.socialDescription || meta.description)}" />` },
  { name: 'og:url', pattern: /<meta property="og:url" content="[^"]*"\s*\/?>/g, render: (meta) => meta.canonicalPath === null ? '' : `<meta property="og:url" content="${escapeAttribute(absoluteUrl(meta.canonicalPath))}" />` },
  { name: 'twitter:title', pattern: /<meta name="twitter:title" content="[^"]*"\s*\/?>/g, render: (meta) => `<meta name="twitter:title" content="${escapeAttribute(meta.title)}" />` },
  { name: 'twitter:description', pattern: /<meta name="twitter:description" content="[^"]*"\s*\/?>/g, render: (meta) => `<meta name="twitter:description" content="${escapeAttribute(meta.socialDescription || meta.description)}" />` },
]);

export const ROBOTS_INDEX = 'index, follow';
export const ROBOTS_NOINDEX = 'noindex, follow';

// Returns the template with its head metadata replaced for one route. Throws
// SEO_TEMPLATE_TAG_MISSING:<name> when a tag is absent or duplicated.
export function applyHead(template, meta) {
  if (!meta || typeof meta.title !== 'string' || typeof meta.description !== 'string') throw new TypeError('head metadata requires title and description');
  if (meta.robots !== ROBOTS_INDEX && meta.robots !== ROBOTS_NOINDEX && meta.robots !== 'noindex') throw new TypeError('unsupported robots value');
  let html = template;
  for (const tag of HEAD_TAGS) {
    const matches = html.match(tag.pattern);
    if (!matches || matches.length !== 1) throw new Error(`SEO_TEMPLATE_TAG_MISSING:${tag.name}`);
    html = html.replace(tag.pattern, () => tag.render(meta));
  }
  return html;
}

// Replaces the root placeholder with pre-rendered markup. The placeholder must
// appear exactly once.
export function injectRoot(template, markup) {
  const placeholder = '<div id="root"></div>';
  if (template.split(placeholder).length !== 2) throw new Error('SEO_TEMPLATE_ROOT_MISSING');
  return template.replace(placeholder, () => `<div id="root">${markup}</div>`);
}

export function renderInitialDocument(template, { markup, initialPage, meta }) {
  const html = injectRoot(applyHead(template, meta), markup);
  const data = `<template id="lrmq-page-data">${escapeAttribute(JSON.stringify(initialPage))}</template>`;
  if (!html.includes('</body>')) throw new Error('SEO_TEMPLATE_BODY_MISSING');
  return html.replace('</body>', () => `${data}</body>`);
}
