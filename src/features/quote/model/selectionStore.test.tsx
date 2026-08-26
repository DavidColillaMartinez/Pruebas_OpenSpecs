import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QuoteSelectionProvider, QUOTE_SELECTION_STORAGE_KEY, useQuoteSelection } from './selectionStore';

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

function Harness() {
  const selection = useQuoteSelection();
  return <><button type="button" onClick={() => selection.addLine(firstLine)}>Añadir primera</button><button type="button" onClick={() => selection.addLine(secondLine)}>Añadir segunda</button><button type="button" onClick={() => selection.addLine(noReferenceLine)}>Añadir GME</button><button type="button" onClick={() => selection.addLine(noAttributesLine)}>Añadir Royo</button><button type="button" onClick={() => selection.addLine(royoLine)}>Añadir Royo real</button><button type="button" onClick={() => selection.updateQuantity('mt-espejos-alba::mt-espejos-alba--v0001', 4)}>Cambiar cantidad</button><button type="button" onClick={() => selection.removeLine('mt-espejos-alba::mt-espejos-alba--v0001')}>Eliminar primera</button><output data-testid="count">{selection.count}</output><output data-testid="lines">{JSON.stringify(selection.lines)}</output></>;
}

afterEach(() => {
  window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
  window.localStorage.removeItem('lrmq:quote-selection:v1');
});

describe('quote selection store', () => {
  it('deduplicates the same variant and keeps another variant independent', () => {
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
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
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify([firstLine]));
    const { unmount } = render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    unmount();
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    expect(screen.getByTestId('lines')).toHaveTextContent(firstLine.variantId);
  });

  it('updates quantity and removes a line by its stable identity', () => {
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir primera' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar cantidad' }));
    expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0].quantity).toBe(4);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar primera' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('keeps a complete variant whose API does not publish a reference', () => {
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir GME' }));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0]).toMatchObject({
      productId: noReferenceLine.productId,
      variantId: noReferenceLine.variantId,
      selectedAttributes: noReferenceLine.selectedAttributes,
    });
    expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0].reference).toBeUndefined();
  });

  it('keeps a complete variant whose API publishes no extra attributes', () => {
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Royo' }));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(JSON.parse(screen.getByTestId('lines').textContent || '[]')[0]).toMatchObject({
      productId: noAttributesLine.productId,
      variantId: noAttributesLine.variantId,
      reference: noAttributesLine.reference,
    });
  });

  it('merges repeated Royo variants while keeping other Royo variants independent', () => {
    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);
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
});
