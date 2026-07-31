import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QuoteSelectionPage } from './QuoteSelectionPage';
import { QuoteSelectionProvider, QUOTE_SELECTION_STORAGE_KEY } from '../model/selectionStore';

const lines = [
  { productId: 'mt-espejos-alba', variantId: 'mt-espejos-alba--v0001', reference: '7195', quantity: 1, productName: 'Alba', selectedAttributes: { dimension: 'Ø 60', finish: 'Terracota', has_led: false } },
  { productId: 'mt-espejos-alba', variantId: 'mt-espejos-alba--v0005', reference: '7196', quantity: 1, productName: 'Alba', selectedAttributes: { dimension: 'Ø 70', finish: 'Terracota', has_led: false } },
];

afterEach(() => {
  window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
  vi.unstubAllGlobals();
});

describe('QuoteSelectionPage', () => {
  it('reviews two complete variants and submits both items', async () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify(lines));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'quote-1', status: 'received' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><QuoteSelectionProvider><QuoteSelectionPage /></QuoteSelectionProvider></MemoryRouter>);

    expect(screen.getAllByText('Alba')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar 2 selecciones' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Solicitud enviada correctamente.'));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.items).toHaveLength(2);
    expect(body.items.map((item: { variantId: string }) => item.variantId)).toEqual(['mt-espejos-alba--v0001', 'mt-espejos-alba--v0005']);
    expect(body.items[0].selectedAttributes).toMatchObject({ dimension: 'Ø 60', finish: 'Terracota' });
    expect(JSON.stringify(body)).not.toMatch(/price|precio|€/i);
  });
});
