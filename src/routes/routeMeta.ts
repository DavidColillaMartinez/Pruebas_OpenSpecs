export type RouteMeta = {
  title: string;
  description: string;
  canonicalPath?: string | null;
  noindex?: boolean;
  socialDescription?: string;
};

const SITE_ORIGIN = 'https://arealrmq.es';

export { HOME_META } from './pageMeta';

export function applyRouteMeta({ title, description, canonicalPath = null, noindex = false, socialDescription = description }: RouteMeta): () => void {
  const previousTitle = document.title;
  const restore: Array<() => void> = [];
  function setTag(selector: string, tagName: string, identity: Record<string, string>, attribute: string, value: string | null) {
    const existing = document.querySelector(selector);
    if (value === null) {
      if (existing) {
        const parent = existing.parentNode;
        const next = existing.nextSibling;
        existing.remove();
        restore.push(() => parent?.insertBefore(existing, next?.parentNode === parent ? next : null));
      }
      return;
    }
    const element = existing || document.createElement(tagName);
    const previous = element.getAttribute(attribute);
    if (!existing) {
      for (const [key, content] of Object.entries(identity)) element.setAttribute(key, content);
      document.head.appendChild(element);
    }
    element.setAttribute(attribute, value);
    restore.push(() => {
      if (!existing) element.remove();
      else if (previous === null) element.removeAttribute(attribute);
      else element.setAttribute(attribute, previous);
    });
  }
  const canonical = canonicalPath ? `${SITE_ORIGIN}${canonicalPath}` : null;
  document.title = title;
  setTag('meta[name="description"]', 'meta', { name: 'description' }, 'content', description);
  setTag('meta[name="robots"]', 'meta', { name: 'robots' }, 'content', noindex ? 'noindex, follow' : 'index, follow');
  setTag('link[rel="canonical"]', 'link', { rel: 'canonical' }, 'href', canonical);
  for (const [property, content] of Object.entries({ 'og:title': title, 'og:description': socialDescription, 'og:url': canonical })) {
    setTag(`meta[property="${property}"]`, 'meta', { property }, 'content', content);
  }
  for (const [name, content] of Object.entries({ 'twitter:title': title, 'twitter:description': socialDescription })) {
    setTag(`meta[name="${name}"]`, 'meta', { name }, 'content', content);
  }
  return () => {
    document.title = previousTitle;
    for (const undo of restore.reverse()) undo();
  };
}
