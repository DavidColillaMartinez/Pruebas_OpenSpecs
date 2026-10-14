import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemeToggle';
import { applyRouteMeta } from '../../routes/routeMeta';
import { BROWSER_STORAGE, LEGAL_DOCUMENTS, PROVIDER_PRIVACY_LINKS } from './content';
import { LEGAL_BUSINESS } from './business';
import { LegalLinks } from './LegalLinks';

export function LegalPage({ kind }: { kind: keyof typeof LEGAL_DOCUMENTS }) {
  const documentContent = LEGAL_DOCUMENTS[kind];
  useEffect(() => {
    const { title, description, path } = documentContent;
    const restoreRoute = applyRouteMeta({ title: `${title} · ${LEGAL_BUSINESS.brand}`, description, canonicalPath: path, noindex: true });
    // Keep social metadata scoped to this page, including client-side return.
    const values: Record<string, string> = {
      'meta[property="og:title"]': `${title} · ${LEGAL_BUSINESS.brand}`,
      'meta[property="og:description"]': description,
      'meta[property="og:url"]': `${LEGAL_BUSINESS.origin}${path}`,
      'meta[name="twitter:title"]': `${title} · ${LEGAL_BUSINESS.brand}`,
      'meta[name="twitter:description"]': description,
    };
    const originals = Object.entries(values).map(([selector, value]) => {
      const element = document.querySelector(selector);
      const original = element?.getAttribute('content') ?? null;
      element?.setAttribute('content', value);
      return { element, original };
    });
    return () => {
      restoreRoute();
      originals.forEach(({ element, original }) => {
        if (original === null) element?.removeAttribute('content');
        else element?.setAttribute('content', original);
      });
    };
  }, [documentContent]);

  return (
    <main id="legal-content" className="min-h-svh bg-surface px-5 py-8 pb-32 text-primary sm:px-8 sm:py-12 sm:pb-32">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Volver a la web" className="flex flex-wrap gap-5 text-sm text-secondary">
            <Link to="/" className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Inicio</Link>
            <Link to="/productos" className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Catálogo</Link>
          </nav>
          <ThemeToggle />
        </header>
        <article className="mt-10 break-words">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{documentContent.title}</h1>
          <p className="mt-5 text-lg leading-8 text-secondary">{documentContent.intro}</p>
          <p className="mt-3 text-sm text-secondary">Información preparada el 14 de octubre de 2026.</p>
          <nav aria-label="En esta página" className="mt-8 border-y border-border-hairline/20 py-4">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-secondary">
              {documentContent.sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="inline-flex min-h-8 items-center underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">{section.title}</a></li>)}
            </ul>
          </nav>
          {documentContent.sections.map(({ id, title, paragraphs }, index) => (
            <section id={id} key={id} aria-labelledby={`legal-${id}`} className="mt-10 scroll-mt-8">
              <h2 id={`legal-${id}`} className="font-display text-2xl leading-snug sm:text-3xl">{title}</h2>
              {paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-base leading-7 text-secondary">{paragraph}</p>)}
              {kind === 'cookies' && index === 0 && <StorageTable />}
            </section>
          ))}
          {kind === 'privacy' && <section className="mt-10" aria-labelledby="legal-resources">
            <h2 id="legal-resources" className="font-display text-2xl">Más información</h2>
            <ul className="mt-4 space-y-2 text-secondary">
              <li><a href="https://www.aepd.es/" className="underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-clay">Agencia Española de Protección de Datos</a></li>
              <li><Link to="/cookies" className="underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-clay">Cookies y almacenamiento del navegador</Link></li>
              {PROVIDER_PRIVACY_LINKS.map(({ label, href }) => <li key={label}><a href={href} className="underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-clay">Privacidad de {label}</a></li>)}
            </ul>
          </section>}
        </article>
        <footer className="mt-12 border-t border-border-hairline/20 pt-5">
          <LegalLinks />
          <a href={`mailto:${LEGAL_BUSINESS.email}`} className="mt-3 inline-flex min-h-8 break-all text-sm text-secondary underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-clay">{LEGAL_BUSINESS.email}</a>
        </footer>
      </div>
    </main>
  );
}

function StorageTable() {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border-hairline/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay" tabIndex={0} role="region" aria-label="Tabla de almacenamiento, desplazable horizontalmente">
      <table className="w-full min-w-[38rem] text-left text-sm leading-6 text-secondary">
        <caption className="px-4 py-3 text-left font-semibold text-primary">Almacenamiento propio de AREA LRMQ en este navegador</caption>
        <thead><tr className="border-y border-border-hairline/20 bg-surface-elevated"><th scope="col" className="p-4">Clave y tecnología</th><th scope="col" className="p-4">Titular y finalidad</th><th scope="col" className="p-4">Duración</th></tr></thead>
        <tbody>{BROWSER_STORAGE.map(({ key, type, purpose, duration }) => <tr key={key} className="border-b border-border-hairline/10 last:border-0"><th scope="row" className="p-4 align-top font-normal"><code className="break-all">{key}</code><br />{type}</th><td className="p-4 align-top">{LEGAL_BUSINESS.brand}. {purpose}</td><td className="p-4 align-top">{duration}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
