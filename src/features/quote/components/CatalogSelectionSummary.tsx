import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuoteSelectionKey, useQuoteSelection, type QuoteSelectionLine } from '../model/selectionStore';

const attributeLabels: Record<string, string> = {
  dimension: 'Medida',
  measure: 'Medida',
  finish: 'Acabado',
  version: 'Versión',
  has_led: 'LED',
  lighting_type: 'Iluminación',
  lighting_technology: 'Tecnología',
  light_temp: 'Temperatura',
  distribution: 'Distribución',
  glass: 'Vidrio',
  opening: 'Apertura',
  orientation: 'Orientación',
  offer: 'Oferta',
};

function formatAttributes(line: QuoteSelectionLine): string {
  return Object.entries(line.selectedAttributes || {})
    .filter(([key]) => key !== 'reference')
    .slice(0, 3)
    .map(([key, value]) => `${attributeLabels[key] || key}: ${typeof value === 'boolean' ? value ? 'Sí' : 'No' : String(value)}`)
    .join(' · ');
}

function SelectionLine({ line, compact = false }: { line: QuoteSelectionLine; compact?: boolean }) {
  const { updateQuantity, removeLine } = useQuoteSelection();
  const key = getQuoteSelectionKey(line);
  return (
    <li className={compact ? 'border-b border-ink/10 py-4 last:border-b-0' : 'border-b border-ink/10 py-4 last:border-b-0'}>
      <div className="flex items-start gap-3">
        {line.imageUrl ? <img src={line.imageUrl} alt="" className="h-14 w-11 shrink-0 object-contain" loading="lazy" decoding="async" /> : <span className="grid h-14 w-11 shrink-0 place-items-center border border-ink/10 text-[10px] text-graphite">Sin imagen</span>}
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{line.productName}</p>
          <p className="mt-1 text-xs text-graphite">{formatAttributes(line) || `Referencia ${line.reference}`}</p>
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor={`summary-quantity-${key}`} className="sr-only">Cantidad de {line.productName}</label>
            <input id={`summary-quantity-${key}`} type="number" min="1" max="999" value={line.quantity} onChange={(event) => updateQuantity(key, Number(event.target.value))} className="h-8 w-14 border-b border-ink/25 bg-transparent text-center text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-clay" />
            <button type="button" onClick={() => removeLine(key)} className="text-xs font-semibold text-graphite underline-offset-4 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Eliminar</button>
          </div>
        </div>
      </div>
    </li>
  );
}

function SummaryContent({ headingId, onClose, drawer = false }: { headingId: string; onClose?: () => void; drawer?: boolean }) {
  const { lines, count } = useQuoteSelection();
  return (
    <div className={drawer ? 'flex h-full flex-col' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">Cesta de presupuesto</p>
          <h2 id={headingId} className="mt-2 font-display text-2xl">Mis selecciones</h2>
        </div>
        {onClose && <button type="button" onClick={onClose} className="min-h-11 px-2 text-sm font-semibold text-graphite underline-offset-4 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Cerrar</button>}
      </div>
      {count === 0 ? (
        <p className="mt-5 text-sm leading-relaxed text-graphite">Añade una variante desde cualquier ficha y aparecerá aquí sin abandonar el catálogo.</p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10" aria-label={`${count} selecciones`}>{lines.map((line) => <SelectionLine key={getQuoteSelectionKey(line)} line={line} compact />)}</ul>
      )}
      <Link to="/presupuesto" onClick={onClose} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 px-4 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Ir a presupuesto{count > 0 ? ` (${count})` : ''}</Link>
    </div>
  );
}

export function CatalogSelectionSummary() {
  const { count } = useQuoteSelection();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button, input, a[href], [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      <aside className="hidden xl:block" aria-label="Resumen de mis selecciones">
        <div className="sticky top-6 max-h-[calc(100svh-3rem)] overflow-y-auto border-y border-ink/10 py-5">
          <SummaryContent headingId="catalog-selection-summary-heading" />
        </div>
      </aside>
      <div className="xl:hidden">
        <button type="button" onClick={() => setMobileOpen(true)} aria-label={`Mis selecciones, ${count}`} aria-expanded={mobileOpen} aria-controls="catalog-selection-drawer" className="fixed inset-x-4 bottom-4 z-40 flex min-h-12 items-center justify-between rounded-full border border-ink/20 bg-porcelain px-5 text-sm font-semibold text-ink shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
          <span>Mis selecciones</span>
          <span aria-live="polite">{count}</span>
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-[70]" role="presentation">
            <button type="button" aria-label="Cerrar resumen de selecciones" className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
            <div ref={panelRef} id="catalog-selection-drawer" role="dialog" aria-modal="true" aria-labelledby="catalog-selection-drawer-heading" className="absolute inset-y-0 right-0 w-[min(92vw,26rem)] overflow-y-auto bg-porcelain p-6 shadow-lift">
              <button ref={closeButtonRef} type="button" className="sr-only" onClick={() => setMobileOpen(false)}>Cerrar resumen</button>
              <SummaryContent headingId="catalog-selection-drawer-heading" onClose={() => setMobileOpen(false)} drawer />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
