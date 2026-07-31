import { useEffect, useRef, useState } from 'react';
import type { CatalogFacetKey, CatalogFacets } from '../model/types';
import { getCatalogFacetLabel, getCatalogFilterKeys, type CatalogFilterProfile, type CatalogFilters } from '../model/catalogQuery';

type CatalogFilterPanelProps = {
  facets: CatalogFacets;
  filters: CatalogFilters;
  profile: CatalogFilterProfile;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onToggle: (key: CatalogFacetKey, value: string, checked: boolean) => void;
};

const facetLabels: Record<CatalogFacetKey, string> = {
  category: 'Categoría',
  supplier: 'Proveedor',
  subcategory: 'Subcategoría',
  collection: 'Colección',
  distribution: 'Distribución',
  shape: 'Forma',
  has_led: 'LED',
  lighting_type: 'Tipo de iluminación',
  product_kind: 'Tipo de producto',
  finish: 'Acabado',
  measure: 'Medida',
};

type FilterGroupsProps = Omit<CatalogFilterPanelProps, 'mobileOpen' | 'onMobileClose'> & {
  openGroups: Set<CatalogFacetKey>;
  expandedGroups: Set<CatalogFacetKey>;
  onToggleGroup: (key: CatalogFacetKey) => void;
  onToggleExpanded: (key: CatalogFacetKey) => void;
  idPrefix: string;
};

function FilterGroups({ facets, filters, profile, onToggle, openGroups, expandedGroups, onToggleGroup, onToggleExpanded, idPrefix }: FilterGroupsProps) {
  const groupEntries = (Object.entries(facets) as [CatalogFacetKey, NonNullable<CatalogFacets[CatalogFacetKey]>][])
    .map(([key, options]) => [key, options.filter((option) => option.count > 0 || filters[key]?.includes(option.value))] as [CatalogFacetKey, NonNullable<CatalogFacets[CatalogFacetKey]>])
    .filter(([, options]) => options.length > 0);
  const visibleKeys = getCatalogFilterKeys(profile);
  const groups = visibleKeys
    .map((key) => groupEntries.find(([groupKey]) => groupKey === key))
    .filter((entry): entry is [CatalogFacetKey, NonNullable<CatalogFacets[CatalogFacetKey]>] => Boolean(entry));

  if (groups.length === 0) return <p className="text-sm leading-relaxed text-graphite">Las opciones aparecerán cuando el catálogo las devuelva.</p>;

  return (
    <div className="space-y-2">
      {groups.map(([key, options]) => {
        const open = openGroups.has(key);
        const expanded = expandedGroups.has(key);
        const contentId = `catalog-filter-${idPrefix}-${key}`;
        const countId = `catalog-filter-count-${idPrefix}-${key}`;
        const selectedOptions = options.filter((option) => filters[key]?.includes(option.value));
        const visibleOptions = expanded
          ? options
          : [...new Map([...options.slice(0, 8), ...selectedOptions].map((option) => [option.value, option])).values()];
        return (
          <fieldset key={key}>
            <legend className="w-full">
              <button
                type="button"
                 className="flex min-h-12 w-full items-center gap-3 border-b border-ink/10 px-1 text-left text-xs font-semibold uppercase tracking-[0.16em] text-graphite transition-colors duration-200 ease-out hover:border-ink/35 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
                aria-expanded={open}
                aria-controls={contentId}
                onClick={() => onToggleGroup(key)}
              >
                 <span className="min-w-0 flex-1">{getCatalogFacetLabel(key, profile) || facetLabels[key]}</span>
                <span aria-hidden="true" className="text-lg font-normal leading-none text-graphite/70">{open ? '−' : '+'}</span>
              </button>
            </legend>
            <div id={contentId} hidden={!open} className="space-y-1 px-1 pb-2 pt-1">
              {visibleOptions.map((option) => {
                const checked = filters[key]?.includes(option.value) || false;
                return (
                  <label key={option.value} className="group flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-1 text-sm text-graphite transition-colors duration-200 ease-out hover:bg-stonewash hover:text-ink">
                    <input
                      type="checkbox"
                      checked={checked}
                      aria-describedby={countId}
                      onChange={(event) => onToggle(key, option.value, event.target.checked)}
                      className="h-4 w-4 rounded border-ink/20 accent-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
                    />
                    <span className="min-w-0 flex-1">{option.label}</span>
                    <span aria-hidden="true" className="text-xs tabular-nums text-graphite/70 transition-colors duration-200 ease-out group-hover:text-ink">{option.count}</span>
                    <span id={countId} className="sr-only">{option.count} resultados</span>
                  </label>
                );
              })}
              {options.length > 8 && (
                <button
                  type="button"
                  className="px-2 pt-2 text-xs font-semibold text-graphite underline-offset-4 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                  aria-expanded={expanded}
                  aria-controls={contentId}
                  onClick={() => onToggleExpanded(key)}
                >
                  {expanded ? 'Ver menos' : 'Ver todas'}
                </button>
              )}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

export function CatalogFilterPanel({ facets, filters, profile, mobileOpen, onMobileClose, onToggle }: CatalogFilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<CatalogFacetKey>>(() => new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<CatalogFacetKey>>(() => new Set());

  const onToggleGroup = (key: CatalogFacetKey) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onToggleExpanded = (key: CatalogFacetKey) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
           <div className="sticky top-6 max-h-[calc(100svh-3rem)] overflow-y-auto overscroll-contain border-y border-ink/10 py-5">
          <h2 className="font-display text-2xl">Filtrar</h2>
           <p className="mt-1 text-xs text-graphite">Abre una categoría para explorar sus opciones. Las cantidades siguen la consulta activa cuando hay datos suficientes.</p>
          <div className="mt-6">
            <FilterGroups facets={facets} filters={filters} profile={profile} onToggle={onToggle} openGroups={openGroups} expandedGroups={expandedGroups} onToggleGroup={onToggleGroup} onToggleExpanded={onToggleExpanded} idPrefix="desktop" />
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button type="button" aria-label="Cerrar filtros" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onMobileClose} />
           <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="mobile-filters-heading" className="absolute inset-y-0 right-0 w-[min(92vw,26rem)] overflow-y-auto overscroll-contain border-l border-ink/10 bg-porcelain p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 id="mobile-filters-heading" className="font-display text-2xl">Filtrar</h2>
              <button ref={closeButtonRef} type="button" onClick={onMobileClose} className="min-h-11 rounded-full px-3 text-sm font-semibold text-graphite underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Cerrar</button>
            </div>
            <div className="mt-7">
              <FilterGroups facets={facets} filters={filters} profile={profile} onToggle={onToggle} openGroups={openGroups} expandedGroups={expandedGroups} onToggleGroup={onToggleGroup} onToggleExpanded={onToggleExpanded} idPrefix="mobile" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
