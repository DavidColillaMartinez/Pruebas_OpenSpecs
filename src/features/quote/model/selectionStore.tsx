/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { QuoteRequestItem } from './types';

export const QUOTE_SELECTION_STORAGE_KEY = 'lrmq:quote-selection:v3';
export const LEGACY_QUOTE_SELECTION_STORAGE_KEY = 'lrmq:quote-selection:v2';
const V2_QUOTE_SELECTION_STORAGE_KEY = LEGACY_QUOTE_SELECTION_STORAGE_KEY;
const V1_QUOTE_SELECTION_STORAGE_KEY = 'lrmq:quote-selection:v1';
const QUOTE_SELECTION_STORAGE_VERSION = 3;
// Approved inactivity window: seven days without real changes.
export const QUOTE_SELECTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type QuoteSelectionLine = QuoteRequestItem;

export type QuoteSelectionSnapshot = {
  lines: QuoteSelectionLine[];
  remember: boolean;
  updatedAt: number;
  expiresAt: number | null;
};

const EMPTY_SNAPSHOT: QuoteSelectionSnapshot = { lines: [], remember: false, updatedAt: 0, expiresAt: null };

type QuoteSelectionContextValue = {
  lines: QuoteSelectionLine[];
  count: number;
  remember: boolean;
  setRemember: (remember: boolean) => void;
  addLine: (line: QuoteSelectionLine) => boolean;
  updateQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  removeLines: (keys: string[], options?: { renewTtl?: boolean }) => void;
  clear: () => void;
};

const emptyContext: QuoteSelectionContextValue = {
  lines: [],
  count: 0,
  remember: false,
  setRemember: () => undefined,
  addLine: () => false,
  updateQuantity: () => undefined,
  removeLine: () => undefined,
  removeLines: () => undefined,
  clear: () => undefined,
};

const QuoteSelectionContext = createContext<QuoteSelectionContextValue>(emptyContext);

type SelectionIdentity = Pick<QuoteRequestItem, 'productId' | 'variantId' | 'commercialOfferVariantId'>
  & Partial<Pick<QuoteRequestItem, 'variantSnapshot' | 'selectedAttributes'>>;

function lineKey(line: SelectionIdentity): string {
  const identity = line.variantId || line.commercialOfferVariantId;
  if (identity) return `${line.productId}::${identity}`;
  const attributes = line.variantSnapshot || line.selectedAttributes || {};
  return `${line.productId}::selection:${JSON.stringify(Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b)))}`;
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
  const reference = typeof record.reference === 'string' && record.reference.trim() ? record.reference : undefined;
  const productName = typeof record.productName === 'string' ? record.productName : '';
  const supplier = typeof record.supplier === 'string' ? record.supplier : '';
  const category = typeof record.category === 'string' ? record.category : '';
  const imageUrl = typeof record.imageUrl === 'string' ? record.imageUrl : undefined;
  const selectedAttributes = cleanAttributes(record.selectedAttributes);
  const variantSnapshot = cleanAttributes(record.variantSnapshot);
  const quantity = Number(record.quantity);
  const compactDuplachSelection = productId.toLocaleLowerCase().startsWith('duplach-')
    && Boolean(variantSnapshot && Object.keys(variantSnapshot).length > 0);
  if (!productId || (!variantId && !commercialOfferVariantId && !compactDuplachSelection) || !productName || !supplier || !category || !Number.isInteger(quantity) || quantity < 1) return null;

  return {
    productId,
    ...(variantId ? { variantId } : {}),
    ...(commercialOfferVariantId ? { commercialOfferVariantId } : {}),
    ...(reference ? { reference } : {}),
    quantity: Math.min(999, quantity),
    productName,
    supplier,
    category,
    ...(imageUrl ? { imageUrl } : {}),
    ...(selectedAttributes ? { selectedAttributes } : {}),
    ...(variantSnapshot ? { variantSnapshot } : {}),
    ...(typeof record.notes === 'string' && record.notes.trim() ? { notes: record.notes.trim() } : {}),
  };
}

function toStoredLines(lines: QuoteSelectionLine[]): Omit<QuoteSelectionLine, 'notes'>[] {
  return lines.map((line) => { const stored: QuoteSelectionLine = { ...line }; delete stored.notes; return stored; });
}

function stableSignature(lines: QuoteSelectionLine[]): string {
  return JSON.stringify(toStoredLines(lines).map(line => ({ ...line, key: lineKey(line) }))
    .sort((a, b) => a.key.localeCompare(b.key)));
}

function isExpired(snapshot: Pick<QuoteSelectionSnapshot, 'remember' | 'expiresAt'>, now: number): boolean {
  return !snapshot.remember && snapshot.expiresAt !== null && now > snapshot.expiresAt;
}

type ParsedSnapshot = QuoteSelectionSnapshot | 'expired' | 'invalid';

function isSnapshot(value: ParsedSnapshot): value is QuoteSelectionSnapshot {
  return value !== 'expired' && value !== 'invalid';
}

function availableStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window.localStorage;
    storage.getItem(QUOTE_SELECTION_STORAGE_KEY);
    return storage;
  } catch {
    return null;
  }
}

function parseStoredSnapshot(raw: string | null, sourceVersion: 3 | 2 | 'v1', now: number): ParsedSnapshot {
  if (raw === null) return 'invalid';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return 'invalid';
  }
  const rawValues: unknown[] | null = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).lines)
      ? (parsed as { lines: unknown[] }).lines
      : null;
  if (rawValues === null) return 'invalid';
  const lines = rawValues.map((value) => normalizeLine(value)).filter((line): line is QuoteSelectionLine => line !== null);

  if (sourceVersion === 3) {
    const record = parsed as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return 'invalid';
    if (record.version !== QUOTE_SELECTION_STORAGE_VERSION) return 'invalid';
    const remember = record.remember === true;
    const updatedAt = typeof record.updatedAt === 'number' && Number.isFinite(record.updatedAt) ? record.updatedAt : NaN;
    const expiresAt = record.expiresAt === null
      ? null
      : typeof record.expiresAt === 'number' && Number.isFinite(record.expiresAt) ? record.expiresAt : NaN;
    if (Number.isNaN(updatedAt) || Number.isNaN(expiresAt as number) && expiresAt !== null) return 'invalid';
    // A v2-style truthy value (or a missing option) must NOT revive as remembered.
    const snapshot: QuoteSelectionSnapshot = { lines, remember, updatedAt, expiresAt };
    if (isExpired(snapshot, now)) return 'expired';
    if (lines.length === 0) return 'invalid';
    return snapshot;
  }

  // Legacy v2/v1: the historical format has no reliable dates, so a valid
  // legacy selection migrates ONCE to the default mode from the current time.
  if (lines.length === 0) return 'invalid';
  return { lines, remember: false, updatedAt: now, expiresAt: now + QUOTE_SELECTION_TTL_MS };
}

function removeStoredKeys(storage: Storage): void {
  for (const key of [QUOTE_SELECTION_STORAGE_KEY, V2_QUOTE_SELECTION_STORAGE_KEY, V1_QUOTE_SELECTION_STORAGE_KEY]) {
    try {
      storage.removeItem(key);
    } catch {
      continue;
    }
  }
}

function writeSnapshot(storage: Storage, snapshot: QuoteSelectionSnapshot): void {
  const record = {
    version: QUOTE_SELECTION_STORAGE_VERSION,
    lines: toStoredLines(snapshot.lines),
    remember: snapshot.remember,
    updatedAt: snapshot.updatedAt,
    expiresAt: snapshot.expiresAt,
  };
  storage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify(record));
  for (const key of [V2_QUOTE_SELECTION_STORAGE_KEY, V1_QUOTE_SELECTION_STORAGE_KEY]) {
    try {
      storage.removeItem(key);
    } catch {
      continue;
    }
  }
}

function hydrateSnapshot(): QuoteSelectionSnapshot {
  const storage = availableStorage();
  if (!storage) return EMPTY_SNAPSHOT;
  const now = Date.now();
  try {
    const rawCurrent = storage.getItem(QUOTE_SELECTION_STORAGE_KEY);
    if (rawCurrent !== null) {
      const current = parseStoredSnapshot(rawCurrent, 3, now);
      if (isSnapshot(current)) return current;
      // Present-but-expired or corrupt: never fall back to older data.
      removeStoredKeys(storage);
      return EMPTY_SNAPSHOT;
    }
    // Missing v3 record: carry over legacy selections exactly once.
    const rawV2 = storage.getItem(V2_QUOTE_SELECTION_STORAGE_KEY);
    if (rawV2 !== null) {
      const v2 = parseStoredSnapshot(rawV2, 2, now);
      if (isSnapshot(v2)) {
        if (isExpired(v2, now)) {
          removeStoredKeys(storage);
          return EMPTY_SNAPSHOT;
        }
        writeSnapshot(storage, v2);
        return v2;
      }
      removeStoredKeys(storage);
      return EMPTY_SNAPSHOT;
    }
    const rawV1 = storage.getItem(V1_QUOTE_SELECTION_STORAGE_KEY);
    if (rawV1 !== null) {
      const v1 = parseStoredSnapshot(rawV1, 'v1', now);
      if (isSnapshot(v1)) {
        if (isExpired(v1, now)) {
          removeStoredKeys(storage);
          return EMPTY_SNAPSHOT;
        }
        writeSnapshot(storage, v1);
        return v1;
      }
    }
    // Nothing recoverable: clear historical leftovers without reviving them.
    removeStoredKeys(storage);
    return EMPTY_SNAPSHOT;
  } catch {
    removeStoredKeys(storage);
    return EMPTY_SNAPSHOT;
  }
}

export function getQuoteSelectionKey(line: SelectionIdentity): string {
  return lineKey(line);
}

type SelectionAction =
  | { type: 'hydrate'; snapshot: QuoteSelectionSnapshot }
  | { type: 'add'; line: QuoteSelectionLine }
  | { type: 'quantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'removeMany'; keys: string[]; renewTtl: boolean }
  | { type: 'clear' }
  | { type: 'remember'; remember: boolean }
  | { type: 'adopt'; snapshot: QuoteSelectionSnapshot };

function reducer(state: QuoteSelectionSnapshot, action: SelectionAction): QuoteSelectionSnapshot {
  const now = Date.now();
  const withChange = (lines: QuoteSelectionLine[], renewTtl = true): QuoteSelectionSnapshot => {
    // Only a real modification renewals the inactivity window: a write that
    // produces the same selection keeps the stored timestamps untouched.
    if (renewTtl && stableSignature(lines) === stableSignature(state.lines) && lines.length === state.lines.length) {
      return state;
    }
    const updatedAt = renewTtl ? now : state.updatedAt;
    const expiresAt = state.remember || !renewTtl ? state.expiresAt : updatedAt + QUOTE_SELECTION_TTL_MS;
    return { ...state, lines, updatedAt, expiresAt };
  };
  switch (action.type) {
    case 'hydrate':
    case 'adopt':
      return action.snapshot;
    case 'add': {
      const key = lineKey(action.line);
      const existing = state.lines.find((item) => lineKey(item) === key);
      const next = existing
        ? state.lines.map((item) => item === existing ? { ...item, quantity: Math.min(999, item.quantity + action.line.quantity) } : item)
        : [...state.lines, action.line];
      return withChange(next);
    }
    case 'quantity': {
      if (!Number.isInteger(action.quantity) || action.quantity < 1) return state;
      const next = state.lines.map((line) => lineKey(line) === action.key ? { ...line, quantity: Math.min(999, action.quantity) } : line);
      return withChange(next);
    }
    case 'remove': {
      const next = state.lines.filter((line) => lineKey(line) !== action.key);
      return withChange(next);
    }
    case 'removeMany': {
      const keysToRemove = new Set(action.keys);
      const next = state.lines.filter((line) => !keysToRemove.has(lineKey(line)));
      // Automatic retirement of sent lines follows the send flow: it preserves
      // the remaining lines' timestamps instead of renewing the window.
      return withChange(next, action.renewTtl);
    }
    case 'clear':
      // «Vaciar selección» removes products AND the stored metadata; the
      // preference returns to the default (no indefinite remember).
      return { ...EMPTY_SNAPSHOT };
    case 'remember': {
      if (action.remember === state.remember) return state;
      const updatedAt = now;
      const expiresAt = action.remember ? null : updatedAt + QUOTE_SELECTION_TTL_MS;
      return { ...state, remember: action.remember, updatedAt, expiresAt };
    }
    default:
      return state;
  }
}

function adoptFromStorage(state: QuoteSelectionSnapshot, dispatch: Dispatch<SelectionAction>): void {
  const storage = availableStorage();
  if (!storage) return;
  try {
    const now = Date.now();
    const current = parseStoredSnapshot(storage.getItem(QUOTE_SELECTION_STORAGE_KEY), 3, now);
    if (current === 'expired') {
      removeStoredKeys(storage);
      if (state.lines.length > 0) dispatch({ type: 'adopt', snapshot: EMPTY_SNAPSHOT });
      return;
    }
    if (current === 'invalid') {
      // Missing record: another tab cleared the basket. Never restore this
      // tab's stale copy over an emptied storage.
      if (state.lines.length > 0) dispatch({ type: 'adopt', snapshot: EMPTY_SNAPSHOT });
      return;
    }
    const sameSignature = stableSignature(current.lines) === stableSignature(state.lines);
    if (sameSignature && current.remember === state.remember && current.expiresAt === state.expiresAt) return;
    dispatch({ type: 'adopt', snapshot: current });
  } catch {
    return;
  }
}

export function QuoteSelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY_SNAPSHOT);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Hydrate once: reading/mounting must not write metadata or renew anything.
  useEffect(() => {
    const snapshot = hydrateSnapshot();
    dispatch({ type: 'hydrate', snapshot });
    setHydrated(true);
  }, []);

  // Persist on real changes only. The hydration pass is excluded so a plain
  // visit keeps the stored timestamps.
  useEffect(() => {
    if (!hydrated) return;
    const storage = availableStorage();
    if (!storage) return;
    try {
      if (state.lines.length === 0) removeStoredKeys(storage);
      else writeSnapshot(storage, state);
    } catch {
      return;
    }
  }, [hydrated, state]);

  // Native storage events keep tabs in sync without dependencies and without
  // renewing or resurrecting anything.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== QUOTE_SELECTION_STORAGE_KEY) return;
      adoptFromStorage(stateRef.current, dispatch);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') adoptFromStorage(stateRef.current, dispatch);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const { lines, remember } = state;

  const addLine = (line: QuoteSelectionLine): boolean => {
    const normalized = normalizeLine(line);
    if (!normalized) return false;
    dispatch({ type: 'add', line: normalized });
    return true;
  };

  const updateQuantity = (key: string, quantity: number) => {
    dispatch({ type: 'quantity', key, quantity });
  };

  const removeLine = (key: string) => dispatch({ type: 'remove', key });
  const removeLines = (keys: string[], options?: { renewTtl?: boolean }) => dispatch({ type: 'removeMany', keys, renewTtl: options?.renewTtl !== false });
  const clear = () => dispatch({ type: 'clear' });
  const setRemember = (value: boolean) => dispatch({ type: 'remember', remember: value });

  return (
    <QuoteSelectionContext.Provider
      value={{ lines, count: lines.length, remember, setRemember, addLine, updateQuantity, removeLine, removeLines, clear }}
    >
      {children}
    </QuoteSelectionContext.Provider>
  );
}

export function useQuoteSelection(): QuoteSelectionContextValue {
  return useContext(QuoteSelectionContext);
}
