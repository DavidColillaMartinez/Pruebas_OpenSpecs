import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { CatalogSelectionSummary } from './CatalogSelectionSummary';
import { QUOTE_SELECTION_STORAGE_KEY, QuoteSelectionProvider } from '../model/selectionStore';

const line = {
  productId: 'mt-espejos-alba',
  variantId: 'mt-espejos-alba--v0001',
  reference: '7195',
  quantity: 2,
  productName: 'Alba',
  supplier: 'Manillons Torrent',
  category: 'Espejos',
  imageUrl: 'https://assets.example/mt26-esp-alba-i01.webp',
  selectedAttributes: { dimension: 'Ø 60', finish: 'Terracota' },
};

afterEach(() => window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY));

describe('CatalogSelectionSummary', () => {
  it('shows shared lines and changes quantity from the catalog summary', () => {
    window.localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify([line]));
    render(<MemoryRouter><QuoteSelectionProvider><CatalogSelectionSummary /></QuoteSelectionProvider></MemoryRouter>);

    expect(screen.getByText('Alba')).toBeInTheDocument();
    const quantityInput = screen.getByLabelText('Cantidad de Alba');
    fireEvent.change(quantityInput, { target: { value: '4' } });

    expect(quantityInput).toHaveValue(4);
    expect(screen.getAllByRole('link', { name: /Ir a presupuesto/ })[0]).toHaveAttribute('href', '/presupuesto');
  });

  it('opens an accessible mobile summary panel and closes it with Escape', () => {
    render(<MemoryRouter><QuoteSelectionProvider><CatalogSelectionSummary /></QuoteSelectionProvider></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Mis selecciones, 0' }));
    expect(screen.getByRole('dialog', { name: 'Mis selecciones' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
