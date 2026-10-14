import { Link } from 'react-router-dom';
import { LEGAL_ROUTES } from './business';

export function LegalLinks({ inverse = false }: { inverse?: boolean }) {
  return (
    <nav aria-label="Información legal" className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${inverse ? 'text-white' : 'text-secondary'}`}>
      {LEGAL_ROUTES.map(({ path, title }) => (
        <Link key={path} to={path} className="inline-flex min-h-8 items-center underline underline-offset-4 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">{title}</Link>
      ))}
    </nav>
  );
}
