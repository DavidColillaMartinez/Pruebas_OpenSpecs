import { getGmeIoValueLabel } from '../../catalog/model/gmeIo';

// Commercial summaries (detail page form, catalog drawer and /presupuesto)
// share one presenter so every family shows explicit fields, translated API
// values and consistent reference formatting.

export type QuoteSummarySource = {
  productName?: string;
  reference?: string;
  variantSnapshot?: Record<string, unknown>;
  selectedAttributes?: Record<string, unknown>;
};

export type QuoteSummaryAttribute = { label: string; value: string };

// Technical metadata and transport-only fields never appear in commercial text.
const HIDDEN_SUMMARY_KEY_PATTERN = /^(?:supplier|supplier_id|category|category_id|catalog_section|reference|reference_status|image|image_url|image_path|model|collection|brand|status|publication|gme_io_2026|source_.*|.*_source)$/i;
const FORBIDDEN_SUMMARY_KEY_PATTERN = /(?:price|precio|importe|cost|coste|quality|hash|raw_data|internal)/i;

const IO_SUMMARY_ORDER: Array<{ key: string; label: string }> = [
  { key: 'tap_type', label: 'Tipo de grifo' },
  { key: 'installation', label: 'Instalación' },
  { key: 'mechanism', label: 'Mecanismo' },
  { key: 'finish', label: 'Acabado' },
  { key: 'measure', label: 'Medida' },
  { key: 'dimension', label: 'Medida' },
];

const GENERAL_SUMMARY_ORDER: Array<{ key: string; label: string }> = [
  { key: 'dimension', label: 'Medida' },
  { key: 'measure', label: 'Medida' },
  { key: 'finish', label: 'Acabado' },
  { key: 'version', label: 'Versión' },
  { key: 'presentation_type', label: 'Tipo de presentación' },
  { key: 'furniture_type', label: 'Tipo de mueble' },
  { key: 'module_type', label: 'Tipo de módulo' },
  { key: 'distribution', label: 'Distribución' },
  { key: 'glass', label: 'Vidrio' },
  { key: 'opening', label: 'Apertura' },
  { key: 'orientation', label: 'Orientación' },
  { key: 'has_led', label: 'LED' },
  { key: 'offer', label: 'Oferta' },
  { key: 'furniture_finish', label: 'Acabado del mueble' },
  { key: 'handle_finish', label: 'Acabado del tirador' },
  { key: 'countertop_finish', label: 'Acabado de encimera' },
  { key: 'type', label: 'Tipo' },
];

const TRANSLATABLE_IO_KEYS = new Set(['tap_type', 'installation', 'mechanism']);

// Compares measures ignoring units, symbols and spacing: 'Ø 60 cm' and '60'
// are equivalent, '60x120' is not.
function normalizeMeasureText(text: string): string {
  return text.toLocaleLowerCase().replace(/[^0-9x×*.,]/g, '').replace(/×|[*]/g, 'x');
}

function isGmeIoSummary(source: Pick<QuoteSummarySource, 'variantSnapshot' | 'selectedAttributes'>): boolean {
  const merged = { ...source.selectedAttributes, ...source.variantSnapshot };
  // `tap_type`, `installation` and `mechanism` only exist for grifería IO.
  return Object.keys(merged).some((key) => TRANSLATABLE_IO_KEYS.has(key))
    || (merged.supplier_id === 'gme' && merged.category_id === 'griferia');
}

function summaryValue(key: string, value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim()) return TRANSLATABLE_IO_KEYS.has(key) ? getGmeIoValueLabel(key, value) : value;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

export function getQuoteSummaryAttributes(source: QuoteSummarySource): QuoteSummaryAttribute[] {
  const merged: Record<string, unknown> = { ...source.variantSnapshot, ...source.selectedAttributes };
  const shown = new Set<string>();
  let shownMeasureText = '';
  const attributes: QuoteSummaryAttribute[] = [];
  const push = (key: string, label: string, value: unknown) => {
    const text = summaryValue(key, value);
    if (!text) return;
    if (label === 'Medida' && shownMeasureText) {
      // Keep distinct dimensions/options, but skip a measure entry that is only
      // another spelling (units, symbols, spacing) of an already shown measure.
      if (normalizeMeasureText(text) === normalizeMeasureText(shownMeasureText)) {
        shown.add(`${label}\u0000${text}`);
        return;
      }
    }
    if (shown.has(`${label}\u0000${text}`)) return;
    shown.add(`${label}\u0000${text}`);
    if (label === 'Medida') shownMeasureText = text;
    attributes.push({ label, value: text });
  };

  if (isGmeIoSummary(source)) {
    IO_SUMMARY_ORDER.forEach(({ key, label }) => push(key, label, merged[key]));
  } else {
    GENERAL_SUMMARY_ORDER.forEach(({ key, label }) => push(key, label, merged[key]));
  }

  Object.entries(merged).forEach(([key, value]) => {
    if (!key || key.length > 40 || HIDDEN_SUMMARY_KEY_PATTERN.test(key) || FORBIDDEN_SUMMARY_KEY_PATTERN.test(key)) return;
    if (IO_SUMMARY_ORDER.some((entry) => entry.key === key) || GENERAL_SUMMARY_ORDER.some((entry) => entry.key === key)) return;
    push(key, key.replace(/_/g, ' ').replace(/^./, (first) => first.toLocaleUpperCase()), value);
  });

  return attributes;
}

export function formatQuoteLineSummary(source: QuoteSummarySource): string {
  const parts = getQuoteSummaryAttributes(source)
    .map((attribute) => attribute.value);
  const reference = typeof source.reference === 'string' && source.reference.trim() ? `Ref. ${source.reference.trim()}` : null;
  if (reference && !parts.includes(reference)) parts.push(reference);
  return parts.join(' · ');
}

export function formatQuoteLineReference(reference?: string): string {
  return reference && reference.trim() ? `Referencia ${reference.trim()}` : 'Referencia no publicada';
}
