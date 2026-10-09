import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QuoteSelectionPage } from './QuoteSelectionPage';
import { QuoteSelectionProvider, QUOTE_SELECTION_STORAGE_KEY } from '../model/selectionStore';

const lines = [
  { productId: 'mt-espejos-alba', variantId: 'mt-espejos-alba--v0001', reference: '7195', quantity: 1, productName: 'Alba', supplier: 'Manillons Torrent', category: 'Espejos', imageUrl: 'https://assets.example/alba.webp', selectedAttributes: { dimension: 'Ø 60', finish: 'Terracota', has_led: false } },
  { productId: 'mt-espejos-alba', variantId: 'mt-espejos-alba--v0005', reference: '7196', quantity: 1, productName: 'Alba', supplier: 'Manillons Torrent', category: 'Espejos', imageUrl: 'https://assets.example/alba.webp', selectedAttributes: { dimension: 'Ø 70', finish: 'Terracota', has_led: false } },
];

const royoLine = { productId: 'royo-logika', variantId: 'royo-logika--v0002', reference: 'R-2', quantity: 1, productName: 'Logika', supplier: 'Royo', category: 'Muebles y lavabos', imageUrl: 'https://assets.example/logika.webp', selectedAttributes: { finish: 'Nogal', presentation_type: 'Suspendido' } };

afterEach(() => {
  window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
  vi.unstubAllGlobals();
});

describe('QuoteSelectionPage', () => {
  it('reviews two complete variants and submits both items', async () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify(lines));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'quote-1', status: 'received', item_count: 2 }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><QuoteSelectionProvider><QuoteSelectionPage /></QuoteSelectionProvider></MemoryRouter>);

    expect(screen.getAllByText('Alba')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar 2 selecciones' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Solicitud registrada con el identificador quote-1.'));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.items).toHaveLength(2);
    expect(body.items.map((item: { variantId: string }) => item.variantId)).toEqual(['mt-espejos-alba--v0001', 'mt-espejos-alba--v0005']);
    expect(body.items[0].selectedAttributes).toMatchObject({ dimension: 'Ø 60', finish: 'Terracota' });
    expect(JSON.stringify(body)).not.toMatch(/price|precio|€/i);
  });

  it('submits all shared lines, including Royo attributes, without prices', async () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify([...lines, royoLine]));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'quote-2', status: 'received', item_count: 3 }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><QuoteSelectionProvider><QuoteSelectionPage /></QuoteSelectionProvider></MemoryRouter>);

    expect(screen.getByRole('button', { name: 'Enviar 3 selecciones' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar 3 selecciones' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Solicitud registrada con el identificador quote-2.'));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.items).toHaveLength(3);
    expect(body.items[2]).toMatchObject({ variantId: royoLine.variantId, selectedAttributes: royoLine.selectedAttributes });
    expect(JSON.stringify(body)).not.toMatch(/price|precio|coste|importe|€/i);
  });

  it('stops trusting a partial confirmation: keeps the basket and reports the mismatch', async () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify(lines));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'quote-3', status: 'received', item_count: 1 }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><QuoteSelectionProvider><QuoteSelectionPage /></QuoteSelectionProvider></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar 2 selecciones' }));

    expect(await screen.findByText('La confirmación del presupuesto no es válida.')).toBeInTheDocument();
    // Basket untouched: 2 Alba lines remain editable for a retry.
    expect(screen.getAllByText('Alba')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Enviar 2 selecciones' })).not.toBeDisabled();
  });

  it('maps per-line server errors next to the offending line and keeps every line', async () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify(lines));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'VALIDATION_ERROR',
      message: 'La solicitud de presupuesto no es válida.',
      fields: ['items.1.quantity'],
    }), { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><QuoteSelectionProvider><QuoteSelectionPage /></QuoteSelectionProvider></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar 2 selecciones' }));

    expect(await screen.findByText('Esta línea: Revisa quantity de esta línea.')).toBeInTheDocument();
    expect(screen.getAllByText('Alba')).toHaveLength(2);
  });

  it('blocks line and form edits while the POST travels', async () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify([...lines, royoLine]));
    let resolveRequest!: (value: Response) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((resolve) => { resolveRequest = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><QuoteSelectionProvider><QuoteSelectionPage /></QuoteSelectionProvider></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar 3 selecciones' }));

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
    expect(screen.getAllByLabelText('Cantidad').every((input) => (input as HTMLInputElement).disabled)).toBe(true);
    expect(screen.getAllByRole('button', { name: /Eliminar/ }).every((button) => button.hasAttribute('disabled'))).toBe(true);
    expect(screen.getByRole('button', { name: 'Vaciar' })).toBeDisabled();
    resolveRequest(new Response(JSON.stringify({ id: 'quote-4', status: 'received', item_count: 3 }), { status: 201 }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Solicitud registrada con el identificador quote-4.'));
  });
});
