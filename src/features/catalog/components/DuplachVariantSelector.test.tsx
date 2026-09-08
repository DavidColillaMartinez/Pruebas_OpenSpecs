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

function plusProduct(fixture?: ReturnType<typeof duplachStonePlusFixture>) {
  return normalizeProductDetail(fixture ?? duplachStonePlusFixture(), config);
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

function setMeasure(value: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Medida' }), { target: { value } });
}

function userCalls(onSelectionChange: ReturnType<typeof vi.fn>) {
  return onSelectionChange.mock.calls.filter(([, meta]) => (meta as { source: string }).source === 'user');
}

describe('duplach conventional selector', () => {
  it('renders measures as a closed native select with API-delivered values in order', () => {
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    const select = screen.getByRole('combobox', { name: 'Medida' });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('70x70');
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual(['70x70', '100x100']);
    expect(screen.queryByRole('button', { name: '100x100' })).toBeNull();
  });

  it('emits the real variant identity on manual compatible changes', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    setMeasure('100x100');
    clickGroupOption('Color', 'Blanco');
    clickGroupOption('Textura', 'Pizarra');
    clickGroupOption('Rejilla', 'Color');

    const last = userCalls(onSelectionChange).at(-1);
    expect(last?.[0]).toMatchObject({ variantId: 'duplach-stone-plus--v00005' });
    expect(last?.[0]?.attributes).toMatchObject({ measure: '100x100', texture: 'Pizarra', color: 'Blanco', grille: 'Color' });
  });

  it('hides incompatible textures for Stone Plus measures instead of offering fakes', () => {
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    expect(optionNames('Textura').sort()).toEqual(['Liso', 'Pizarra']);

    setMeasure('100x100');
    expect(optionNames('Textura')).toEqual(['Pizarra']);
    expect(screen.queryByRole('button', { name: 'Liso' })).toBeNull();
  });

  it('never makes an impossible combination selectable', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    clickGroupOption('Textura', 'Pizarra');
    clickGroupOption('Color', 'Antracita');
    expect(optionNames('Rejilla')).toEqual(['Color']);

    setMeasure('70x70');
    clickGroupOption('Textura', 'Liso');
    expect(optionNames('Rejilla')).toEqual(['Acero inoxidable']);
    clickGroupOption('Rejilla', 'Acero inoxidable');
    expect(userCalls(onSelectionChange).at(-1)?.[0]).toMatchObject({ variantId: 'duplach-stone-plus--v00001' });
  });

  it('shows published selector_images swatches as color cards, never color_image_map gallery images', () => {
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    const antracita = group('Color').getByRole('button', { name: 'Antracita' });
    expect(antracita.querySelector('img')).toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/swatches/duplach-stone-plus-color-antracita.webp`);
    expect(group('Color').getByRole('button', { name: 'Blanco' }).querySelector('img'))
      .toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-plus/swatches/duplach-stone-plus-color-blanco.webp`);
    expect(antracita.querySelector('img')?.getAttribute('src')).not.toContain('gallery');
  });

  it('keeps a text-only accessible card when the API publishes no swatch filename', () => {
    const raw = duplachStonePlusFixture();
    (raw.specs as { selector_images: unknown }).selector_images = { colors: [{ name: 'Antracita' }, { name: 'Blanco' }] };
    render(<DuplachVariantSelector product={plusProduct(raw)} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    const antracita = group('Color').getByRole('button', { name: 'Antracita' });
    expect(antracita.querySelector('img')).toBeNull();
    expect(antracita).toHaveTextContent('Antracita');
  });

  it('first click selects the real variant, second click only enlarges the selected swatch', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    const blanco = group('Color').getByRole('button', { name: 'Blanco' });
    fireEvent.click(blanco);
    expect(blanco).toHaveAttribute('aria-pressed', 'true');
    expect(blanco).toHaveAttribute('aria-expanded', 'false');
    expect(userCalls(onSelectionChange)).toHaveLength(1);
    expect(onSelectionChange.mock.calls.filter(([, meta]) => (meta as { source: string }).source === 'initial')).toHaveLength(1);

    fireEvent.click(blanco);
    expect(blanco).toHaveAttribute('aria-pressed', 'true');
    expect(blanco).toHaveAttribute('aria-expanded', 'true');
    expect(blanco.className).toContain('scale-125');
    expect(userCalls(onSelectionChange)).toHaveLength(1);
    const last = userCalls(onSelectionChange).at(-1);
    expect(last?.[0]).toMatchObject({ variantId: 'duplach-stone-plus--v00002' });

    fireEvent.click(blanco);
    expect(blanco).toHaveAttribute('aria-expanded', 'false');
    expect(userCalls(onSelectionChange)).toHaveLength(1);
  });

  it('clicking another swatch selects it and clears the previous enlargement', () => {
    render(<DuplachVariantSelector product={plusProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    const blanco = group('Color').getByRole('button', { name: 'Blanco' });
    const antracita = group('Color').getByRole('button', { name: 'Antracita' });

    fireEvent.click(blanco);
    fireEvent.click(blanco);
    expect(blanco).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(antracita);
    expect(antracita).toHaveAttribute('aria-pressed', 'true');
    expect(antracita).toHaveAttribute('aria-expanded', 'false');
    expect(blanco).toHaveAttribute('aria-pressed', 'false');
    expect(blanco).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('duplach Stone 3D family-first selector', () => {
  it('starts without any finish selected and only shows family finishes after a family', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={threeDProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    expect(screen.queryByRole('group', { name: 'Acabado' })).toBeNull();
    expect(screen.getByText('Selecciona una familia para elegir su acabado.')).toBeInTheDocument();
    expect(onSelectionChange).toHaveBeenLastCalledWith(null, { source: 'initial', family: null });

    clickGroupOption('Familia de acabado', 'Maderas naturales');
    expect(optionNames('Acabado').sort()).toEqual(['Olivo', 'Roble']);
    expect(screen.queryByRole('button', { name: 'Cemento 01' })).toBeNull();
    expect(onSelectionChange).toHaveBeenLastCalledWith(null, { source: 'user', family: 'maderas-naturales' });
  });

  it('emits the real variant id only after family and finish, and scopes finishes to the family', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={threeDProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    clickGroupOption('Familia de acabado', 'Cementos, metales y óxidos');
    expect(optionNames('Acabado')).toEqual(['Cemento 01']);
    clickGroupOption('Acabado', 'Cemento 01');

    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ variantId: 'duplach-stone-3d--v00003' }),
      { source: 'user', family: 'cementos-metales-oxidos' },
    );
  });

  it('no longer renders the separate family demo gallery block', () => {
    render(<DuplachVariantSelector product={threeDProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={vi.fn()} />);
    expect(screen.queryByText(/Imágenes de demostración/)).toBeNull();
    clickGroupOption('Familia de acabado', 'Maderas naturales');
    expect(screen.queryByText(/Imágenes de demostración/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Imagen de familia siguiente' })).toBeNull();
  });

  it('renders family-scoped finish swatches from finish_image_map with select-then-enlarge behavior', () => {
    const onSelectionChange = vi.fn();
    render(<DuplachVariantSelector product={threeDProduct()} assetBaseUrl={ASSET_BASE_URL} onSelectionChange={onSelectionChange} />);

    clickGroupOption('Familia de acabado', 'Maderas naturales');
    const roble = group('Acabado').getByRole('button', { name: 'Roble' });
    expect(roble.querySelector('img'))
      .toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/swatches/maderas-naturales/duplach-stone-3d-maderas-naturales-roble.webp`);

    fireEvent.click(roble);
    expect(roble).toHaveAttribute('aria-pressed', 'true');
    expect(userCalls(onSelectionChange).at(-1)?.[0]).toMatchObject({ variantId: 'duplach-stone-3d--v00001' });
    const callsAfterSelection = onSelectionChange.mock.calls.length;

    fireEvent.click(roble);
    expect(roble).toHaveAttribute('aria-expanded', 'true');
    expect(roble.className).toContain('scale-125');
    expect(onSelectionChange.mock.calls.length).toBe(callsAfterSelection);

    clickGroupOption('Familia de acabado', 'Cementos, metales y óxidos');
    expect(screen.queryByRole('button', { name: 'Roble' })).toBeNull();
    expect(group('Acabado').getByRole('button', { name: 'Cemento 01' }).querySelector('img'))
      .toHaveAttribute('src', `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/swatches/cementos-metales-oxidos/duplach-stone-3d-cementos-metales-oxidos-cemento-01.webp`);
  });
});
