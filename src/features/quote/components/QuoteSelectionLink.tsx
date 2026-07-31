import { Link } from 'react-router-dom';
import { useQuoteSelection } from '../model/selectionStore';

export function QuoteSelectionLink({ compact = false, tone = 'light' }: { compact?: boolean; tone?: 'light' | 'dark' }) {
  const { count } = useQuoteSelection();
  const dark = tone === 'dark';
  return (
    <Link
      to="/presupuesto"
      aria-label={`Presupuesto, ${count} ${count === 1 ? 'selección' : 'selecciones'}`}
      className={compact
        ? `inline-flex min-h-11 items-center justify-center rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${dark ? 'border-white/35 text-white hover:border-white/80' : 'border-ink/15 text-ink hover:border-ink/40'}`
        : `inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${dark ? 'border-white/35 text-white hover:border-white/80' : 'border-ink/15 bg-white/75 text-ink hover:border-ink/40'}`}
    >
      {count > 0 ? `Presupuesto (${count})` : 'Mis selecciones (0)'}
    </Link>
  );
}
