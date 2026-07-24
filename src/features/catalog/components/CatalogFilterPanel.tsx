import { useEffect, useRef } from 'react';
import type { CatalogFacetKey, CatalogFacets } from '../model/types';
import type { CatalogFilters } from '../model/catalogQuery';

type CatalogFilterPanelProps = {
  facets: CatalogFacets;
  filters: CatalogFilters;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onToggle: (key: CatalogFacetKey, value: string, checked: boolean) => void;
};

const facetLabels: Record<CatalogFacetKey, string> = {
  category: 'Categoría',
  supplier: 'Proveedor',
  subcategory: 'Subcategoría',
  collection: 'Colección',
  product_kind: 'Tipo de producto',
  finish: 'Acabado',
  measure: 'Medida',
};

function FilterGroups({ facets, filters, onToggle }: Omit<CatalogFilterPanelProps, 'mobileOpen' | 'onMobileClose'>) {
  const groups = (Object.entries(facets) as [CatalogFacetKey, NonNullable<CatalogFacets[CatalogFacetKey]>][])
    .filter(([, options]) => options.length > 0);

  if (groups.length === 0) return <p className="text-sm leading-relaxed text-graphite">Las opciones aparecerán cuando el catálogo las devuelva.</p>;

  return (
    <div className="space-y-7">
      {groups.map(([key, options]) => (
        <fieldset key={key}>
          <legend className="text-sm font-semibold text-ink">{facetLabels[key]}</legend>
          <div className="mt-3 space-y-1">
            {options.map((option) => {
              const checked = filters[key]?.includes(option.value) || false;
              return (
                <label key={option.value} className="flex min-h-11 items-center gap-3 rounded-md text-sm text-graphite hover:text-ink">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onToggle(key, option.value, event.target.checked)}
                    className="h-4 w-4 accent-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
                  />
                  <span className="min-w-0 flex-1">{option.label}</span>
                  <span aria-hidden="true" className="text-xs tabular-nums text-graphite/70">{option.count}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function CatalogFilterPanel({ facets, filters, mobileOpen, onMobileClose, onToggle }: CatalogFilterPanelProps) {
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
        onMobileClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled'));
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
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      <aside aria-label="Filtros del catálogo" className="hidden lg:block">
        <h2 className="font-display text-2xl">Filtrar</h2>
        <div className="mt-6">
          <FilterGroups facets={facets} filters={filters} onToggle={onToggle} />
        </div>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button type="button" aria-label="Cerrar filtros" className="absolute inset-0 bg-ink/30" onClick={onMobileClose} />
          <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="mobile-filters-heading" className="absolute inset-y-0 right-0 w-[min(92vw,26rem)] overflow-y-auto bg-porcelain p-6 shadow-lift">
            <div className="flex items-center justify-between gap-4">
              <h2 id="mobile-filters-heading" className="font-display text-2xl">Filtrar</h2>
              <button ref={closeButtonRef} type="button" onClick={onMobileClose} className="min-h-11 rounded-full px-3 text-sm font-semibold text-graphite underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Cerrar</button>
            </div>
            <div className="mt-7">
              <FilterGroups facets={facets} filters={filters} onToggle={onToggle} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
