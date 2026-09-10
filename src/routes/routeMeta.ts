export type RouteMeta = {
  title: string;
  description: string;
  canonicalPath?: string | null;
  noindex?: boolean;
};

function originFromCanonical(canonicalHref: string | null): string {
  if (!canonicalHref) return window.location.origin;
  try {
    return new URL(canonicalHref).origin;
  } catch {
    return window.location.origin;
  }
}

export function applyRouteMeta({ title, description, canonicalPath = null, noindex = false }: RouteMeta): () => void {
  const previousTitle = document.title;
  const descriptionEl = document.querySelector('meta[name="description"]');
  const previousDescription = descriptionEl?.getAttribute('content') ?? null;
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  const previousCanonical = canonicalEl?.getAttribute('href') ?? null;
  let robotsEl = document.querySelector('meta[name="robots"]');
  const addedRobotsEl = robotsEl === null;
  const previousRobots = robotsEl?.getAttribute('content') ?? null;

  document.title = title;
  const siteOrigin = originFromCanonical(canonicalEl?.getAttribute('href') ?? null);
  descriptionEl?.setAttribute('content', description);
  if (canonicalPath && canonicalEl) canonicalEl.setAttribute('href', `${siteOrigin}${canonicalPath}`);

  if (noindex) {
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      document.head.appendChild(robotsEl);
    }
    robotsEl.setAttribute('content', 'noindex, follow');
  }

  return () => {
    document.title = previousTitle;
    if (descriptionEl) {
      if (previousDescription === null) descriptionEl.removeAttribute('content');
      else descriptionEl.setAttribute('content', previousDescription);
    }
    if (canonicalEl) {
      if (previousCanonical === null) canonicalEl.removeAttribute('href');
      else canonicalEl.setAttribute('href', previousCanonical);
    }
    if (robotsEl) {
      if (addedRobotsEl) robotsEl.remove();
      else if (previousRobots !== null) robotsEl.setAttribute('content', previousRobots);
    }
  };
}
