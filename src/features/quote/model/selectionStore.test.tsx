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

function Harness() {
  const selection = useQuoteSelection();
  return <><button type="button" onClick={() => selection.addLine(firstLine)}>Añadir primera</button><button type="button" onClick={() => selection.addLine(secondLine)}>Añadir segunda</button><button type="button" onClick={() => selection.updateQuantity('mt-espejos-alba::mt-espejos-alba--v0001', 4)}>Cambiar cantidad</button><button type="button" onClick={() => selection.removeLine('mt-espejos-alba::mt-espejos-alba--v0001')}>Eliminar primera</button><output data-testid="count">{selection.count}</output><output data-testid="lines">{JSON.stringify(selection.lines)}</output></>;
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

  it('drops legacy lines that cannot be safely migrated to the complete snapshot contract', () => {
    window.localStorage.setItem('lrmq:quote-selection:v1', JSON.stringify([{ ...firstLine, supplier: undefined, category: undefined }]));

    render(<QuoteSelectionProvider><Harness /></QuoteSelectionProvider>);

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
