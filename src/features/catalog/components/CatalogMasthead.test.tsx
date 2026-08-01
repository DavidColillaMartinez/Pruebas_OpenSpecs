import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { CatalogMasthead } from './CatalogMasthead';
import { QuoteSelectionProvider, QUOTE_SELECTION_STORAGE_KEY, useQuoteSelection } from '../../quote/model/selectionStore';

const line = {
  productId: 'mt-espejos-alba',
  variantId: 'mt-espejos-alba--v0001',
  reference: '7195',
  quantity: 1,
  productName: 'Alba',
  supplier: 'Manillons Torrent',
  category: 'Espejos',
  imageUrl: 'https://assets.example/alba.webp',
  selectedAttributes: { dimension: 'Ø 60' },
};

function AddSelectionButton() {
  const { addLine } = useQuoteSelection();
  return <button type="button" onClick={() => addLine(line)}>Añadir prueba</button>;
}

afterEach(() => window.localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY));

describe('CatalogMasthead', () => {
  it('keeps the historical dark masthead structure and updates the compact basket action immediately', () => {
    render(<MemoryRouter><QuoteSelectionProvider><CatalogMasthead /><AddSelectionButton /></QuoteSelectionProvider></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ambiente de baño de AREA LRMQ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Presupuesto, 0 selecciones' })).toHaveTextContent('Mis selecciones (0)');

    fireEvent.click(screen.getByRole('button', { name: 'Añadir prueba' }));

    expect(screen.getByRole('link', { name: 'Presupuesto, 1 selección' })).toHaveTextContent('Presupuesto (1)');
  });
});
