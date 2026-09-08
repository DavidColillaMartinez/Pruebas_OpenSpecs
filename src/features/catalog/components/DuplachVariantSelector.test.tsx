import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { DuplachVariantSelector } from './DuplachVariantSelector';
import { normalizeProductDetail } from '../model/normalize';
import { duplachStonePlusFixture, duplachStone3dFixture } from '../api/fixtures/duplach-platos-contract';

const ASSET_BASE_URL = 'https://assets.example/catalogo';
const config = {
  catalog_version: 'test',
  api_contract_version: 'catalog-api-v1',
  asset_base_url: ASSET_BASE_URL,
  source_catalog_base_url: ASSET_BASE_URL,
  database_ready_for_public_api: true,
};

function plusProduct() {
  return normalizeProductDetail(duplachStonePlusFixture(), config);
}

function threeDProduct() {
  return normalizeProductDetail(duplachStone3dFixture(), config);
}

function group(name: string) {
  return within(screen.getByRole('group', { name }));
}

function clickGroupOption(name: string, value: string) {
  fireEvent.click(group(name).getByRole('button', { name: value }));
}

function optionNames(name: string): string[] {
  const element = screen.queryByRole('group', { name });
  return element ? within(element).getAllByRole('button').map((button) => String(button.textContent)) : [];
}

describe('duplach conventional selector', () => {
  it('emits the real variant identity on manual compatible changes', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    clickGroupOption('Medida', '100x100');
    clickGroupOption('Color', 'Blanco');
    clickGroupOption('Textura', 'Pizarra');
    clickGroupOption('Rejilla', 'Color');

    const calls = onSelectionChange.mock.calls.filter(([, meta]) => meta.source === 'user');
    const last = calls[calls.length - 1];
    expect(last?.[0]).toMatchObject({ variantId: 'duplach-stone-plus--v00005' });
    expect(last?.[0]?.attributes).toMatchObject({ measure: '100x100', texture: 'Pizarra', color: 'Blanco', grille: 'Color' });
  });

  it('hides incompatible textures for Stone Plus measures instead of offering fakes', () => {
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    expect(optionNames('Textura').sort()).toEqual(['Liso', 'Pizarra']);

    clickGroupOption('Medida', '100x100');
    expect(optionNames('Textura')).toEqual(['Pizarra']);
    expect(screen.queryByRole('button', { name: 'Liso' })).toBeNull();
  });

  it('never makes an impossible combination selectable', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    clickGroupOption('Textura', 'Pizarra');
    clickGroupOption('Color', 'Antracita');
    expect(optionNames('Rejilla')).toEqual(['Color']);

    clickGroupOption('Medida', '70x70');
    clickGroupOption('Textura', 'Liso');
    expect(optionNames('Rejilla')).toEqual(['Acero inoxidable']);
    clickGroupOption('Rejilla', 'Acero inoxidable');
    const calls = onSelectionChange.mock.calls.filter(([, meta]) => meta.source === 'user');
    expect(calls[calls.length - 1]?.[0]).toMatchObject({ variantId: 'duplach-stone-plus--v00001' });
  });

  it('shows API color swatches with their real names', () => {
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    const antracita = group('Color').getByRole('button', { name: 'Antracita' });
    expect(antracita.querySelector('img')).toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/gallery-1.webp`);
    expect(group('Color').getByRole('button', { name: 'Blanco' }).querySelector('img')).toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/cover.webp`);
  });
});

describe('duplach Stone 3D family-first selector', () => {
  it('starts without any finish selected and only shows family finishes after a family', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={threeDProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    expect(screen.queryByRole('group', { name: 'Acabado' })).toBeNull();
    expect(screen.getByText('Selecciona una familia para elegir su acabado.')).toBeInTheDocument();
    expect(onSelectionChange).toHaveBeenLastCalledWith(null, { source: 'initial' });

    clickGroupOption('Familia de acabado', 'Maderas naturales');
    expect(optionNames('Acabado').sort()).toEqual(['Olivo', 'Roble']);
    expect(screen.queryByRole('button', { name: 'Cemento 01' })).toBeNull();
    expect(onSelectionChange).toHaveBeenLastCalledWith(null, { source: 'user' });
  });

  it('emits the real variant id only after family and finish, and scopes finishes to the family', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={threeDProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    clickGroupOption('Familia de acabado', 'Cementos, metales y óxidos');
    expect(optionNames('Acabado')).toEqual(['Cemento 01']);
    clickGroupOption('Acabado', 'Cemento 01');

    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ variantId: 'duplach-stone-3d--v00003' }),
      { source: 'user' },
    );
  });

  it('renders API family demo images in a separate navigable gallery with finish swatches', () => {
    render(<DuplachVariantSelector product={threeDProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);

    clickGroupOption('Familia de acabado', 'Maderas naturales');
    expect(group('Acabado').getByRole('button', { name: 'Roble' }).querySelector('img'))
      .toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/swatches/maderas-naturales/duplach-stone-3d-maderas-naturales-roble.webp`);

    expect(screen.getByRole('img', { name: 'Stone 3D, familia Maderas naturales, imagen 1 de 2' }))
      .toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp`);
    fireEvent.click(screen.getByRole('button', { name: 'Imagen de familia siguiente' }));
    expect(screen.getByRole('img', { name: 'Stone 3D, familia Maderas naturales, imagen 2 de 2' })).toBeInTheDocument();
  });
});
