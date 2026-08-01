/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { QuoteRequestItem } from './types';

export const QUOTE_SELECTION_STORAGE_KEY = 'lrmq:quote-selection:v2';
const LEGACY_QUOTE_SELECTION_STORAGE_KEY = 'lrmq:quote-selection:v1';
const QUOTE_SELECTION_STORAGE_VERSION = 2;

export type QuoteSelectionLine = QuoteRequestItem;

type QuoteSelectionContextValue = {
  lines: QuoteSelectionLine[];
  count: number;
  addLine: (line: QuoteSelectionLine) => boolean;
  updateQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
};

const emptyContext: QuoteSelectionContextValue = {
  lines: [],
  count: 0,
  addLine: () => false,
  updateQuantity: () => undefined,
  removeLine: () => undefined,
  clear: () => undefined,
};

const QuoteSelectionContext = createContext<QuoteSelectionContextValue>(emptyContext);

function lineKey(line: Pick<QuoteRequestItem, 'productId' | 'variantId' | 'commercialOfferVariantId'>): string {
  return `${line.productId}::${line.variantId || line.commercialOfferVariantId || ''}`;
}

function cleanAttributes(value: unknown): Record<string, string | number | boolean> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const attributes = Object.fromEntries(Object.entries(value).filter(([key, item]) => (
    ['string', 'number', 'boolean'].includes(typeof item)
      && !/(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i.test(key)
  ))) as Record<string, string | number | boolean>;
  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

function normalizeLine(value: unknown): QuoteSelectionLine | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const productId = typeof record.productId === 'string' ? record.productId : '';
  const variantId = typeof record.variantId === 'string' ? record.variantId : undefined;
  const commercialOfferVariantId = typeof record.commercialOfferVariantId === 'string' ? record.commercialOfferVariantId : undefined;
  const reference = typeof record.reference === 'string' ? record.reference : '';
  const productName = typeof record.productName === 'string' ? record.productName : '';
  const supplier = typeof record.supplier === 'string' ? record.supplier : '';
  const category = typeof record.category === 'string' ? record.category : '';
  const imageUrl = typeof record.imageUrl === 'string' ? record.imageUrl : undefined;
  const selectedAttributes = cleanAttributes(record.selectedAttributes);
  const quantity = Number(record.quantity);
  if (!productId || (!variantId && !commercialOfferVariantId) || !reference || !productName || !supplier || !category || !selectedAttributes || !Number.isInteger(quantity) || quantity < 1) return null;

  return {
    productId,
    ...(variantId ? { variantId } : {}),
    ...(commercialOfferVariantId ? { commercialOfferVariantId } : {}),
    reference,
    quantity: Math.min(999, quantity),
    productName,
    supplier,
    category,
    ...(imageUrl ? { imageUrl } : {}),
    selectedAttributes,
    variantSnapshot: cleanAttributes(record.variantSnapshot),
    ...(typeof record.notes === 'string' && record.notes.trim() ? { notes: record.notes.trim() } : {}),
  };
}

function readStoredLines(): QuoteSelectionLine[] {
  if (typeof window === 'undefined') return [];
  for (const key of [QUOTE_SELECTION_STORAGE_KEY, LEGACY_QUOTE_SELECTION_STORAGE_KEY]) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || 'null');
      const values: unknown[] = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && parsed.version === QUOTE_SELECTION_STORAGE_VERSION && Array.isArray(parsed.lines)
          ? parsed.lines
          : [];
      const lines = values.map((value) => normalizeLine(value)).filter((line): line is QuoteSelectionLine => line !== null);
      if (lines.length > 0 || parsed === null) return lines;
    } catch {
      continue;
    }
  }
  return [];
}

export function getQuoteSelectionKey(line: Pick<QuoteRequestItem, 'productId' | 'variantId' | 'commercialOfferVariantId'>): string {
  return lineKey(line);
}

export function QuoteSelectionProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<QuoteSelectionLine[]>(readStoredLines);

  useEffect(() => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify({ version: QUOTE_SELECTION_STORAGE_VERSION, lines }));
  }, [lines]);

  const addLine = (line: QuoteSelectionLine): boolean => {
    const normalized = normalizeLine(line);
    if (!normalized) return false;
    const key = lineKey(normalized);
    setLines((current) => {
      const existing = current.find((item) => lineKey(item) === key);
      if (!existing) return [...current, normalized];
      return current.map((item) => item === existing
        ? { ...item, quantity: Math.min(999, item.quantity + normalized.quantity) }
        : item);
    });
    return true;
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setLines((current) => current.map((line) => lineKey(line) === key ? { ...line, quantity: Math.min(999, quantity) } : line));
  };

  const removeLine = (key: string) => setLines((current) => current.filter((line) => lineKey(line) !== key));
  const clear = () => setLines([]);

  return <QuoteSelectionContext.Provider value={{ lines, count: lines.length, addLine, updateQuantity, removeLine, clear }}>{children}</QuoteSelectionContext.Provider>;
}

export function useQuoteSelection(): QuoteSelectionContextValue {
  return useContext(QuoteSelectionContext);
}
