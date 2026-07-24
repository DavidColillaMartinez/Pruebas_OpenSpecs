import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-porcelain px-6 text-center text-ink">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-graphite">404</p>
        <h1 className="mt-3 font-display text-5xl">Página no encontrada</h1>
        <Link to="/" className="mt-6 inline-block font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Volver al inicio</Link>
      </div>
    </main>
  );
}
