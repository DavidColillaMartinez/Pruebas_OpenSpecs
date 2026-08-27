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

    expect(onSelectionChange.mock.calls[0]?.[1]).toEqual({ source: 'initial' });
    expect(screen.getByRole('group', { name: 'Acabado' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Distribución' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Código de acabado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Medida' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aluminio' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Free' }));
    fireEvent.click(screen.getByRole('button', { name: 'Negro' }));
    expect(onSelectionChange.mock.lastCall?.[1]).toEqual({ source: 'user' });
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

  it('renders Espejos selectors in dimension, finish and version order', () => {
    const product = normalizeProductDetail({
      id: 'mt-espejos-nova',
      name: 'Nova',
      slug: 'mt-espejos-nova',
      supplier_id: 'manillons-torrent',
      category_id: 'espejos',
      configuration_fields: ['dimension', 'finish', 'version'],
      variants: [
        { id: 'nova-basic', dimension: '60 x 80', finish: 'Negro mate', version: 'Básica', reference: 'NOVA-1', sort_order: 1 },
        { id: 'nova-plus', dimension: '60 x 80', finish: 'Negro mate', version: 'Plus', reference: 'NOVA-2', sort_order: 2 },
        { id: 'nova-other-finish', dimension: '60 x 80', finish: 'Oro cepillado', version: 'Básica', reference: 'NOVA-3', sort_order: 3 },
        { id: 'nova-other-dimension', dimension: '80 x 100', finish: 'Negro mate', version: 'Básica', reference: 'NOVA-4', sort_order: 4 },
      ],
    });
    render(<ProductVariantSelector product={product} onSelectionChange={() => undefined} />);

    expect([...document.querySelectorAll('fieldset legend')].map((legend) => legend.textContent)).toEqual(['Medida', 'Acabado', 'Versión']);
    expect(screen.getByRole('group', { name: 'Acabado' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Versión' })).toBeInTheDocument();
  });

  it('resolves a new real variant when measure, finish, and version change', () => {
    const product = normalizeProductDetail({
      id: 'mt-espejos-switch',
      name: 'Switch',
      slug: 'mt-espejos-switch',
      supplier_id: 'manillons-torrent',
      category_id: 'espejos',
      configuration_fields: ['dimension', 'finish', 'version'],
      variants: [
        { id: 'switch-small-basic', dimension: '60 x 80', finish: 'Negro mate', version: 'Básica', reference: 'SW-1', sort_order: 1 },
        { id: 'switch-large-basic', dimension: '80 x 100', finish: 'Negro mate', version: 'Básica', reference: 'SW-2', sort_order: 2 },
        { id: 'switch-large-plus', dimension: '80 x 100', finish: 'Oro cepillado', version: 'Plus', reference: 'SW-3', sort_order: 3 },
      ],
    });
    const onSelectionChange = vi.fn();
    render(<ProductVariantSelector product={product} onSelectionChange={onSelectionChange} />);

    fireEvent.click(screen.getByRole('button', { name: '80 x 100' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toMatchObject({ variantId: 'switch-large-basic' });
    fireEvent.click(screen.getByRole('button', { name: 'Oro cepillado' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toMatchObject({ variantId: 'switch-large-plus' });
    fireEvent.click(screen.getByRole('button', { name: 'Básica' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toMatchObject({ variantId: 'switch-small-basic' });
  });

  it('disables an incompatible Royo combination instead of creating it', () => {
    const product = normalizeProductDetail({
      id: 'royo-paired',
      name: 'Royo paired',
      slug: 'royo-paired',
      supplier_id: 'royo',
      category_id: 'muebles-y-lavabos',
      modularity: 'normal',
      configuration_fields: ['measure', 'finish', 'presentation_type'],
      variants: [
        { id: 'royo-paired-80-white-wall', measure: '80', finish: 'Blanco', reference: 'R-80-B', attributes: { presentation_type: 'Suspendido' } },
        { id: 'royo-paired-100-black-floor', measure: '100', finish: 'Negro', reference: 'R-100-N', attributes: { presentation_type: 'Al suelo' } },
      ],
    });
    const onSelectionChange = vi.fn();
    render(<ProductVariantSelector product={product} onSelectionChange={onSelectionChange} />);

    expect(screen.getByRole('button', { name: 'Negro' })).toBeDisabled();
    expect(onSelectionChange.mock.lastCall?.[0]).toMatchObject({ variantId: 'royo-paired-80-white-wall' });
  });

  it('supports API-backed normal presentation types and resolves their real variants', () => {
    const product = normalizeProductDetail({
      id: 'royo-normal-types',
      name: 'Normal types',
      slug: 'royo-normal-types',
      supplier_id: 'royo',
      category_id: 'muebles-y-lavabos',
      modularity: 'normal',
      configuration_fields: ['measure', 'presentation_type', 'finish'],
      variants: [
        { id: 'royo-suspended-white', measure: '80', presentation_type: 'Suspendido', finish: 'Blanco', reference: 'R-1' },
        { id: 'royo-floor-black', measure: '80', presentation_type: 'Al suelo', finish: 'Negro', reference: 'R-2' },
      ],
    });
    const onSelectionChange = vi.fn();
    render(<ProductVariantSelector product={product} onSelectionChange={onSelectionChange} />);

    expect(screen.getByRole('group', { name: 'Tipo de presentación' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Negro' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Al suelo' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toMatchObject({ variantId: 'royo-floor-black', variantSnapshot: { presentation_type: 'Al suelo', finish: 'Negro' } });
  });
});
