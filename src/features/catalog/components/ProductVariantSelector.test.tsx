import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { normalizeProductDetail } from '../model/normalize';
import { ProductVariantSelector } from './ProductVariantSelector';

function gmeProduct() {
  return normalizeProductDetail({
    id: 'gme-mamparas-ducha-glass',
    name: 'Glass',
    slug: 'gme-mamparas-ducha-glass',
    supplier_id: 'gme',
    category_id: 'mamparas',
    variants: [
      { id: 'glass-cromo-2', finish: 'Cromo', finish_code: 'cr', distribution: '2 abatibles', reference: 'GLASS-CR-2', sort_order: 1 },
      { id: 'glass-cromo-free', finish: 'Cromo', finish_code: 'cr', distribution: 'Free', reference: 'GLASS-CR-FREE', sort_order: 2 },
      { id: 'glass-negro-2', finish: 'Negro', finish_code: 'ng', distribution: '2 abatibles', reference: 'GLASS-NG-2', sort_order: 3 },
      { id: 'glass-negro-free', finish: 'Negro', finish_code: 'ng', distribution: 'Free', reference: 'GLASS-NG-FREE', sort_order: 4 },
      { id: 'glass-negro-lateral', finish: 'Negro', finish_code: 'ng', distribution: 'Lateral fijo', reference: 'GLASS-NG-LATERAL', sort_order: 5 },
      { id: 'glass-aluminio', finish: 'Aluminio', finish_code: 'al', distribution: 'Free', reference: 'GLASS-AL-FREE', sort_order: 6 },
    ],
  });
}

describe('ProductVariantSelector', () => {
  it('renders only commercial dependent controls and selects exact GME units', () => {
    const onSelectionChange = vi.fn();
    render(<ProductVariantSelector product={gmeProduct()} onSelectionChange={onSelectionChange} />);

    expect(screen.getByRole('group', { name: 'Acabado' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Distribución' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Código de acabado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Medida' })).not.toBeInTheDocument();
    expect(screen.queryByText('Aluminio')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Free' }));
    fireEvent.click(screen.getByRole('button', { name: 'Negro' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toMatchObject({
      variantId: 'glass-negro-free',
      variantSnapshot: { reference: 'GLASS-NG-FREE', finish: 'Negro', distribution: 'Free' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Lateral fijo' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toMatchObject({
      variantId: 'glass-negro-lateral',
      variantSnapshot: { reference: 'GLASS-NG-LATERAL' },
    });
  });
});
