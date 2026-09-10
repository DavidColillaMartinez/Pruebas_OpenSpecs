import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applyRouteMeta } from './routeMeta';
import { ThemeToggle } from '../components/ThemeToggle';

export function NotFoundPage() {
  useEffect(() => {
    const restore = applyRouteMeta({
      title: 'Página no encontrada · AREA LRMQ',
      description: 'La página que buscas no existe. Explora el catálogo de baños a medida de AREA LRMQ o vuelve al inicio.',
      canonicalPath: null,
      noindex: true,
    });
    return restore;
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 text-center text-primary">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">404</p>
        <h1 className="mt-3 font-display text-5xl">Página no encontrada</h1>
        <p className="mt-4 text-secondary">Puedes volver al inicio o explorar el catálogo completo.</p>
          <div className="mt-6 flex flex-col items-center gap-3">
          <ThemeToggle />
          <Link to="/" className="inline-block font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Volver al inicio</Link>
          <Link to="/productos" className="inline-block font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Explorar el catálogo</Link>
        </div>
      </div>
    </main>
  );
}
