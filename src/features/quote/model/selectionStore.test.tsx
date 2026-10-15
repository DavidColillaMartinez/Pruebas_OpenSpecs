import { fireEvent, render, screen, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuoteSelectionProvider, QUOTE_SELECTION_STORAGE_KEY, QUOTE_SELECTION_TTL_MS, useQuoteSelection } from './selectionStore';

const START = new Date('2026-02-01T12:00:00Z').getTime();
const DAY = 24 * 60 * 60 * 1000;

const firstLine = {
  productId: 'mt-espejos-alba',
  variantId: 'mt-espejos-alba--v0001',
  reference: '7195',
  quantity: 1,
  productName: 'Alba',
  supplier: 'Manillons Torrent',
  category: 'Espejos',
  imageUrl: 'https://assets.example/alba.webp',
  selectedAttributes: { dimension: 'Ø 60', finish: 'Terracota', has_led: false },
};

const secondLine = { ...firstLine, variantId: 'mt-espejos-alba--v0005', reference: '7196', selectedAttributes: { dimension: 'Ø 70', finish: 'Terracota', has_led: false } };
const noReferenceLine = { ...firstLine, productId: 'gme-mamparas-ducha-akt', variantId: 'gme-mamparas-ducha-akt--ang-cr', reference: undefined, productName: 'Aktual', supplier: 'GME', category: 'Mamparas', selectedAttributes: { finish: 'Cromo', distribution: 'Angular al vértice' } };
const noAttributesLine = { ...firstLine, productId: 'royo-simple-product', variantId: 'royo-simple-product--v0001', reference: 'C0074654', productName: 'Mueble sencillo', supplier: 'Royo', category: 'Muebles y lavabos', selectedAttributes: undefined };
const royoLine = { ...firstLine, productId: 'royo-logika', variantId: 'royo-logika--v0002', reference: 'R-2', productName: 'Logika', supplier: 'Royo', category: 'Muebles y lavabos', selectedAttributes: { finish: 'Nogal', handle_finish: 'Inox' } };
const compactDuplachLine = {
  productId: 'duplach-stone-plus',
  quantity: 1,
  productName: 'Stone Plus',
  supplier: 'Duplach',
  category: 'Platos de ducha',
  variantSnapshot: { measure: '100x100', texture: 'Pizarra', color: 'Blanco', grille: 'Color' },
  selectedAttributes: { measure: '100x100', texture: 'Pizarra', color: 'Blanco', grille: 'Color' },
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(START);
});

afterEach(() => {
  window.localStorage.clear();
  const documentRecord = document as unknown as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(documentRecord, 'visibilityState')) delete documentRecord.visibilityState;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function seedSelection(lines: unknown[], options: { remember?: boolean; updatedAt?: number; expiresAt?: number | null } = {}) {
  const { remember = false, updatedAt = START, expiresAt = START + QUOTE_SELECTION_TTL_MS } = options;
  const stored = (lines as Array<Record<string, unknown>>).map((line) => { const copy = { ...line }; delete copy.notes; return copy; });
  window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify({ version: 3, lines: stored, remember, updatedAt, expiresAt }));
}

function storedRecord(): { version: number; lines: unknown[]; remember: boolean; updatedAt: number; expiresAt: number | null } | null {
  const raw = window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function visit() {
  return render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
}

function Harness() {
  const selection = useQuoteSelection();
  return <>
    <button type="button" onClick={() => selection.addLine(firstLine)}>Añadir primera</button>
    <button type="button" onClick={() => selection.addLine(secondLine)}>Añadir segunda</button>
    <button type="button" onClick={() => selection.addLine(noReferenceLine)}>Añadir GME</button>
    <button type="button" onClick={() => selection.addLine(noAttributesLine)}>Añadir Royo</button>
    <button type="button" onClick={() => selection.addLine(royoLine)}>Añadir Royo real</button>
    <button type="button" onClick={() => selection.updateQuantity('mt-espejos-alba::mt-espejos-alba--v0001', 4)}>Cambiar cantidad</button>
    <button type="button" onClick={() => selection.updateQuantity('mt-espejos-alba::mt-espejos-alba--v0001', 1)}>Repetir cantidad 1</button>
    <button type="button" onClick={() => selection.removeLine('mt-espejos-alba::mt-espejos-alba--v0001')}>Eliminar primera</button>
    <button type="button" data-testid="remember-on" onClick={() => selection.setRemember(true)}>Activar recordar</button>
    <button type="button" data-testid="remember-off" onClick={() => selection.setRemember(false)}>Desactivar recordar</button>
    <output data-testid="count">{selection.count}</output>
    <output data-testid="lines">{JSON.stringify(selection.lines)}</output>
    <output data-testid="remember">{String(selection.remember)}</output>
  </>;
}

describe('quote selection store (v3 persistence)', () => {
  it('removes legacy free-text notes from persisted selections', () => {
    seedSelection([{ ...firstLine, notes: 'Datos de contacto privados' }]);
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).not.toContain('Datos de contacto privados');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('deduplicates the same variant and keeps another variant independent', () => {
    visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir segunda' }));

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    const lines = JSON.parse(screen.getByTestId('lines').textContent || '[]');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ variantId: firstLine.variantId, quantity: 2 });
    expect(lines[1]).toMatchObject({ variantId: secondLine.variantId, quantity: 1 });
  });

  it('hydrates complete lines from local storage after remount', () => {
    seedSelection([firstLine]);
    const firstVisit = visit();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    firstVisit.unmount();
    visit();
    expect(screen.getByTestId('lines')).toHaveTextContent(firstLine.variantId);
  });

  it('does not renew the window when visiting without changes', () => {
    seedSelection([firstLine]);
    const firstVisit = visit();
    expect(storedRecord()?.updatedAt).toBe(START);
    firstVisit.unmount();

    vi.setSystemTime(START + 5 * DAY);
    const secondVisit = visit();
    expect(storedRecord()?.updatedAt).toBe(START);
    secondVisit.unmount();

    // One second before the exact limit the selection is still alive.
    vi.setSystemTime(START + 7 * DAY - 1000);
    visit();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('discards the selection exactly after seven days without changes', () => {
    seedSelection([firstLine]);
    const harness = visit();
    harness.unmount();
    vi.setSystemTime(START + 7 * DAY + 1);
    visit();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
  });

  it('renews on real modifications and keeps timestamps on no-op writes', () => {
    seedSelection([firstLine]);
    const harness = visit();
    // Same quantity: not a real change, the metadata stays untouched.
    fireEvent.click(screen.getByRole('button', { name: 'Repetir cantidad 1' }));
    expect(storedRecord()?.updatedAt).toBe(START);
    expect(storedRecord()?.expiresAt).toBe(START + QUOTE_SELECTION_TTL_MS);

    // Real change: quantity differs, the window restarts from that instant.
    vi.setSystemTime(START + 3 * DAY);
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar cantidad' }));
    expect(storedRecord()?.updatedAt).toBe(START + 3 * DAY);
    expect(storedRecord()?.expiresAt).toBe(START + 3 * DAY + QUOTE_SELECTION_TTL_MS);
    expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0].quantity).toBe(4);

    // After the renewed window the selection expires exactly on time.
    harness.unmount();
    vi.setSystemTime(START + 3 * DAY + 7 * DAY + 1);
    visit();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('clearing the basket removes products and metadata', () => {
    seedSelection([firstLine, secondLine]);
    visit();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar primera' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    // No direct UI-clear button here: QuoteSelectionPage tests cover «Vaciar».
    expect(storedRecord()?.lines).toHaveLength(1);
  });

  it('updates quantity and removes a line by its stable identity', () => {
    visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar cantidad' }));
    expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0].quantity).toBe(4);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar primera' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
  });

  it('keeps a complete variant whose API does not publish a reference', () => {
    visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir GME' }));
    const lines = JSON.parse(screen.getByTestId('lines').textContent || '[]');
    expect(lines[0]).toMatchObject({ productId: noReferenceLine.productId, variantId: noReferenceLine.variantId, selectedAttributes: noReferenceLine.selectedAttributes });
    expect(lines[0].reference).toBeUndefined();
  });

  it('keeps a complete variant whose API publishes no extra attributes', () => {
    visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Royo' }));
    expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0]).toMatchObject({
      productId: noAttributesLine.productId,
      variantId: noAttributesLine.variantId,
      reference: noAttributesLine.reference,
    });
  });

  it('merges repeated Royo variants while keeping other Royo variants independent', () => {
    visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Royo real' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Royo real' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Royo' }));
    const lines = JSON.parse(screen.getByTestId('lines').textContent || '[]');
    expect(lines).toHaveLength(2);
    expect(lines.find((line: { variantId: string }) => line.variantId === royoLine.variantId)).toMatchObject({ quantity: 2, selectedAttributes: royoLine.selectedAttributes });
    expect(lines.find((line: { variantId: string }) => line.variantId === noAttributesLine.variantId)).toMatchObject({ quantity: 1 });
  });

  it('drops legacy lines that cannot be safely migrated to the complete snapshot contract', () => {
    window.localStorage.setItem('lrmq:quote-selection:v1', JSON.stringify([{ ...firstLine, supplier: undefined, category: undefined }]));
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('keeps different compact Duplach configurations as independent lines', () => {
    const compactOther = { ...compactDuplachLine, variantSnapshot: { ...compactDuplachLine.variantSnapshot, color: 'Antracita' }, selectedAttributes: { ...compactDuplachLine.selectedAttributes, color: 'Antracita' } };
    function CompactHarness() {
      const selection = useQuoteSelection();
      return <><button type="button" onClick={() => selection.addLine(compactDuplachLine)}>Añadir compacto</button><button type="button" onClick={() => selection.addLine(compactOther)}>Añadir otro compacto</button><output data-testid="compact-count">{selection.count}</output></>;
    }
    render(<QuoteSelectionProvider><CompactHarness /></QuoteSelectionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir compacto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir compacto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir otro compacto' }));
    expect(screen.getByTestId('compact-count')).toHaveTextContent('2');
  });

  it('remember keeps the selection without automatic expiry until cleared', () => {
    const harness = visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    vi.setSystemTime(START + 2 * DAY);
    fireEvent.click(screen.getByTestId('remember-on'));
    expect(storedRecord()?.remember).toBe(true);
    expect(storedRecord()?.expiresAt).toBeNull();
    harness.unmount();

    vi.setSystemTime(START + 40 * DAY);
    visit();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('unchecking remember restarts the seven-day window from that moment', () => {
    seedSelection([firstLine], { remember: true, updatedAt: START, expiresAt: null });
    visit();
    vi.setSystemTime(START + 30 * DAY);
    fireEvent.click(screen.getByTestId('remember-off'));
    expect(storedRecord()?.remember).toBe(false);
    expect(storedRecord()?.expiresAt).toBe(START + 30 * DAY + QUOTE_SELECTION_TTL_MS);
  });

  it('migrates a v2 selection once, with seven days from the migration moment', () => {
    window.localStorage.setItem('lrmq:quote-selection:v2', JSON.stringify([firstLine]));
    const firstVisit = visit();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(storedRecord()?.version).toBe(3);
    expect(storedRecord()?.updatedAt).toBe(START);
    expect(storedRecord()?.expiresAt).toBe(START + QUOTE_SELECTION_TTL_MS);
    expect(window.localStorage.getItem('lrmq:quote-selection:v2')).toBeNull();
    firstVisit.unmount();

    // A later visit must not re-migrate nor restart the migration clock.
    vi.setSystemTime(START + 2 * DAY);
    visit();
    expect(storedRecord()?.updatedAt).toBe(START);
    expect(storedRecord()?.expiresAt).toBe(START + QUOTE_SELECTION_TTL_MS);
  });

  it('does not revive a truthy v2 remember flag as an explicit choice', () => {
    window.localStorage.setItem('lrmq:quote-selection:v2', JSON.stringify([firstLine]));
    visit();
    expect(storedRecord()?.remember).toBe(false);
  });

  it('discards corrupt or expired records without resurrecting them', () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, '{oops');
    const firstVisit = render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
    firstVisit.unmount();

    seedSelection([firstLine], { remember: false, updatedAt: START - 9 * DAY, expiresAt: START - 2 * DAY });
    window.localStorage.setItem('lrmq:quote-selection:v2', JSON.stringify([{ ...firstLine, variantId: 'v2-stale' }]));
    visit();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem('lrmq:quote-selection:v2')).toBeNull();
  });

  it('survives an unavailable localStorage while keeping the in-memory selection', () => {
    const originalStorage = window.localStorage;
    const throwing = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
      clear: () => { throw new Error('blocked'); },
      key: () => null,
      get length() { return 0; },
    };
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => throwing });
    try {
      const harness = render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
      fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
      expect(screen.getByTestId('count')).toHaveTextContent('1');
      expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0].variantId).toBe(firstLine.variantId);
      harness.unmount();
    } finally {
      Object.defineProperty(window, 'localStorage', { configurable: true, get: () => originalStorage });
    }
  });
});

describe('empty normalization and inactivity expiry', () => {
  it('drops remember when removing the last line and starts fresh on the next addition', () => {
    const harness = visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    fireEvent.click(screen.getByTestId('remember-on'));
    expect(storedRecord()?.remember).toBe(true);
    expect(storedRecord()?.expiresAt).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar primera' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('remember')).toHaveTextContent('false');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();

    vi.setSystemTime(START + DAY);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    expect(screen.getByTestId('remember')).toHaveTextContent('false');
    expect(storedRecord()?.remember).toBe(false);
    expect(storedRecord()?.updatedAt).toBe(START + DAY);
    expect(storedRecord()?.expiresAt).toBe(START + DAY + QUOTE_SELECTION_TTL_MS);
    harness.unmount();
  });

  it('normalizes the emptied basket when retiring all sent lines without renewal', () => {
    seedSelection([firstLine, secondLine]);
    function RetireHarness() {
      const selection = useQuoteSelection();
      return <>
        <button type="button" onClick={() => selection.removeLines(['mt-espejos-alba::mt-espejos-alba--v0001', 'mt-espejos-alba::mt-espejos-alba--v0005'], { renewTtl: false })}>Retirar enviadas</button>
        <output data-testid="count">{selection.count}</output>
        <output data-testid="remember">{String(selection.remember)}</output>
      </>;
    }
    render(<QuoteSelectionProvider><RetireHarness /></QuoteSelectionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Retirar enviadas' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('remember')).toHaveTextContent('false');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
  });

  it('expires via the in-page timer without focus or reload', () => {
    const harness = visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    act(() => {
      vi.advanceTimersByTime(QUOTE_SELECTION_TTL_MS);
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
    harness.unmount();
  });

  it('expires exactly at the boundary instant of the window', () => {
    seedSelection([firstLine], { expiresAt: START + QUOTE_SELECTION_TTL_MS });
    const harness = visit();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    act(() => {
      vi.advanceTimersByTime(QUOTE_SELECTION_TTL_MS);
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
    harness.unmount();
  });

  it('keeps the selection when another tab renewal lands before the timer callback', () => {
    const harness = visit();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    const renewedRecord = {
      version: 3,
      lines: [firstLine].map((line) => { const copy: Record<string, unknown> = { ...line }; delete copy.notes; return copy; }),
      remember: false,
      updatedAt: START + QUOTE_SELECTION_TTL_MS - 1000,
      expiresAt: START + QUOTE_SELECTION_TTL_MS + 5 * DAY,
    };
    act(() => {
      window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify(renewedRecord));
    });
    act(() => {
      vi.advanceTimersByTime(QUOTE_SELECTION_TTL_MS);
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(storedRecord()?.expiresAt).toBe(START + QUOTE_SELECTION_TTL_MS + 5 * DAY);
    harness.unmount();
  });

  it('does not resuscitate expired lines when adding after system suspension', () => {
    seedSelection([firstLine]);
    const harness = visit();
    vi.setSystemTime(START + 8 * DAY);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir segunda' }));
    const lines = JSON.parse(screen.getByTestId('lines').textContent || '[]');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ variantId: secondLine.variantId });
    expect(storedRecord()?.updatedAt).toBe(START + 8 * DAY);
    expect(storedRecord()?.expiresAt).toBe(START + 8 * DAY + QUOTE_SELECTION_TTL_MS);
    harness.unmount();
  });

  it('rejects inconsistent v3 remember/expiresAt pairs without reviving them', () => {
    seedSelection([firstLine], { remember: true, expiresAt: START + 1000 });
    const firstVisit = visit();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
    firstVisit.unmount();

    seedSelection([firstLine], { remember: false, expiresAt: null });
    visit();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
  });

  it('cannot activate remember while the selection is empty', () => {
    visit();
    fireEvent.click(screen.getByTestId('remember-on'));
    expect(screen.getByTestId('remember')).toHaveTextContent('false');
    expect(window.localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY)).toBeNull();
  });

  it('an empty adoption from another tab also drops the remember preference', () => {
    seedSelection([firstLine], { remember: true, expiresAt: null });
    const harness = visit();
    expect(screen.getByTestId('remember')).toHaveTextContent('true');

    window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: QUOTE_SELECTION_STORAGE_KEY, newValue: null, storageArea: window.localStorage }));
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('remember')).toHaveTextContent('false');
    harness.unmount();
  });
});

describe('cross-tab coordination', () => {
  it('adopts another tab clearing the basket and never resurrects the stale copy', () => {
    seedSelection([firstLine]);
    const harness = visit();
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Another tab empties the basket: the storage event clears this tab too.
    window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: QUOTE_SELECTION_STORAGE_KEY, newValue: null, storageArea: window.localStorage }));
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    harness.unmount();
    visit();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('adopts another tab modifications on visibility without renewing', () => {
    seedSelection([firstLine]);
    const harness = visit();
    vi.setSystemTime(START + 2 * DAY);
    const otherTabSelection = { version: 3, lines: [firstLine, secondLine].map((line) => { const copy: Record<string, unknown> = { ...line }; delete copy.notes; return copy; }), remember: false, updatedAt: START + 2 * DAY, expiresAt: START + 2 * DAY + QUOTE_SELECTION_TTL_MS };
    act(() => {
      window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify(otherTabSelection));
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(storedRecord()?.updatedAt).toBe(START + 2 * DAY);
    harness.unmount();
  });

  it('discards an expired in-memory state when the tab recovers focus late', () => {
    seedSelection([firstLine]);
    const harness = visit();
    vi.setSystemTime(START + 8 * DAY);
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    harness.unmount();
  });

  it('ignores storage events for unrelated keys', () => {
    seedSelection([firstLine]);
    visit();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'otro:key', newValue: null, storageArea: window.localStorage }));
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});

const duplachLine = {
  productId: 'duplach-stone-plus',
  variantId: 'duplach-stone-plus--v00001',
  quantity: 1,
  productName: 'Stone Plus',
  supplier: 'Duplach',
  category: 'Platos de ducha',
  imageUrl: 'https://assets.example/catalogo/images/duplach_platos/stone-plus/gallery-1.webp',
  selectedAttributes: { measure: '70x70', texture: 'Liso', color: 'Antracita', grille: 'Acero inoxidable' },
};
const duplachOtherLine = { ...duplachLine, variantId: 'duplach-stone-plus--v00003', selectedAttributes: { ...duplachLine.selectedAttributes, texture: 'Pizarra', grille: 'Color' } };
const duplachIncompleteLine = { ...duplachLine, variantId: undefined };

function DuplachHarness({ incompleteRef }: { incompleteRef: { current: boolean | undefined } }) {
  const selection = useQuoteSelection();
  return <>
    <button type="button" onClick={() => selection.addLine(duplachLine)}>Añadir Duplach</button>
    <button type="button" onClick={() => selection.addLine(duplachOtherLine)}>Añadir otra variante</button>
    <button type="button" onClick={() => { incompleteRef.current = selection.addLine(duplachIncompleteLine); }}>Añadir incompleta</button>
    <output data-testid="duplach-count">{selection.count}</output>
    <output data-testid="duplach-lines">{JSON.stringify(selection.lines)}</output>
  </>;
}

describe('duplach budget selection', () => {
  it('increments repeated variant quantities, keeps other variants independent and rejects incomplete lines', () => {
    render(<QuoteSelectionProvider><DuplachHarness incompleteRef={{ current: undefined }} /></QuoteSelectionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Duplach' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Duplach' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir otra variante' }));
    expect(screen.getByTestId('duplach-count')).toHaveTextContent('2');
    const lines = JSON.parse(screen.getByTestId('duplach-lines').textContent || '[]');
    expect(lines[0]).toMatchObject({ productId: 'duplach-stone-plus', variantId: 'duplach-stone-plus--v00001', quantity: 2 });
    expect(lines[1]).toMatchObject({ variantId: 'duplach-stone-plus--v00003', quantity: 1 });
    expect(lines[0].selectedAttributes).toMatchObject({ texture: 'Liso', color: 'Antracita' });
    expect(lines[0].reference).toBeUndefined();
  });

  it('rejects an incomplete duplach line without storing a product-only entry', () => {
    const incompleteRef = { current: undefined as boolean | undefined };
    render(<QuoteSelectionProvider><DuplachHarness incompleteRef={incompleteRef} /></QuoteSelectionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir incompleta' }));
    expect(incompleteRef.current).toBe(false);
    expect(screen.getByTestId('duplach-count')).toHaveTextContent('0');
  });

  it('restores duplach lines with prices stripped from persisted storage', () => {
    seedSelection([{ ...duplachLine, selectedAttributes: { ...duplachLine.selectedAttributes, price_eur: 120, coste: 40 }, variantSnapshot: { measure: '70x70', min_price: 9 } }]);
    render(<QuoteSelectionProvider><DuplachHarness incompleteRef={{ current: undefined }} /></QuoteSelectionProvider>);
    const lines = JSON.parse(screen.getByTestId('duplach-lines').textContent || '[]');
    expect(lines[0].selectedAttributes).not.toHaveProperty('price_eur');
    expect(lines[0].selectedAttributes).not.toHaveProperty('coste');
    expect(lines[0].variantSnapshot).not.toHaveProperty('min_price');
    expect(lines[0]).toMatchObject({ productId: 'duplach-stone-plus', variantId: 'duplach-stone-plus--v00001', quantity: 1 });
  });
});
