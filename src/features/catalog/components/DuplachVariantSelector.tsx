import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProductDetail } from '../model/types';
import { getSelectableUnits, selectInitialUnit } from '../model/selection';
import type { SelectableUnit } from '../model/selection';
import type { SelectionChangeMeta } from './ProductVariantSelector';
import {
  DUPLACH_FILTER_LABELS,
  findCompleteDuplachUnit,
  getCompactDuplachOptions,
  getDuplachColorSwatchImage,
  getDuplachDependentOptions,
  getDuplachFinishSwatchImage,
  getDuplachSelectorModel,
} from '../model/duplach';

export type DuplachSelectionMeta = SelectionChangeMeta & { family: string | null };

type DuplachVariantSelectorProps = {
  product: ProductDetail;
  assetBaseUrl?: string | null;
  onSelectionChange: (unit: SelectableUnit | null, metadata: DuplachSelectionMeta) => void;
};

const OPTION_ORDER = ['measure', 'texture', 'color', 'grille', 'valve', 'orientation', 'finish_family', 'finish'];

export function DuplachVariantSelector({ product, assetBaseUrl, onSelectionChange }: DuplachVariantSelectorProps) {
  const units = useMemo(() => getSelectableUnits(product), [product]);
  const model = useMemo(() => getDuplachSelectorModel(product), [product]);
  const configurationKeys = useMemo(
    () => model.configurationKeys.filter((key) => OPTION_ORDER.includes(key)),
    [model.configurationKeys],
  );
  const familyFirst = model.familyFirst;
  const usesCompactOptions = units.length === 0 && configurationKeys.some((key) => model.compactOptions[key]?.length);
  const initialUnit = useMemo(() => selectInitialUnit(units), [units]);
  const initialSelection = useMemo<Record<string, string>>(() => {
    if (usesCompactOptions) {
      const measure = model.compactOptions.measure?.[0];
      if (familyFirst) return measure ? { measure } : {};
      return Object.fromEntries(configurationKeys
        .map((key) => [key, getCompactDuplachOptions(model, {}, key)[0]] as const)
        .filter((entry): entry is [string, string] => Boolean(entry[1])));
    }
    if (!initialUnit) return {};
    if (familyFirst) return initialUnit.attributes.measure ? { measure: initialUnit.attributes.measure } : {};
    return Object.fromEntries(configurationKeys
      .map((key) => [key, initialUnit.attributes[key]] as const)
      .filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== ''));
  }, [configurationKeys, familyFirst, initialUnit, model, usesCompactOptions]);
  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const [enlarged, setEnlarged] = useState<{ group: string; value: string } | null>(null);
  const productIdRef = useRef(product.id);
  const userSelectionRef = useRef(false);
  const currentUnit = useMemo<SelectableUnit | null>(() => {
    if (!usesCompactOptions) return findCompleteDuplachUnit(units, selection, configurationKeys);
    if (configurationKeys.some((key) => !selection[key])) return null;
    return {
      productId: product.id,
      quantity: 1,
      productName: product.name,
      variantSnapshot: { ...selection },
      attributes: { ...selection },
      sourceOrder: 0,
    };
  }, [configurationKeys, product.id, product.name, selection, units, usesCompactOptions]);

  useEffect(() => {
    if (productIdRef.current === product.id) {
      onSelectionChange(currentUnit, { source: userSelectionRef.current ? 'user' : 'initial', family: selection.finish_family ?? null });
      userSelectionRef.current = false;
      return;
    }
    productIdRef.current = product.id;
    userSelectionRef.current = false;
    setEnlarged(null);
    setSelection(initialSelection);
  }, [currentUnit, initialSelection, onSelectionChange, product.id, selection]);

  const activeFamily = selection.finish_family;
  const groups = configurationKeys
    .filter((key) => key === 'finish' ? familyFirst : true)
    .map((key) => ({
      key,
      options: key === 'finish' && familyFirst && !activeFamily
        ? []
        : usesCompactOptions
          ? getCompactDuplachOptions(model, selection, key)
          : getDuplachDependentOptions(units, configurationKeys, selection, key),
    }))
    .filter((group) => group.options.length > 0);

  if (!usesCompactOptions && units.length <= 1) return null;

  const selectValue = (key: string, value: string) => {
    userSelectionRef.current = true;
    const keyIndex = configurationKeys.indexOf(key);
    const next: Record<string, string> = { ...selection, [key]: value };
    if (usesCompactOptions) {
      configurationKeys.slice(keyIndex + 1).forEach((dependentKey) => {
        if (next[dependentKey] && !getCompactDuplachOptions(model, next, dependentKey).includes(next[dependentKey])) {
          delete next[dependentKey];
        }
      });
    } else {
      configurationKeys.slice(keyIndex + 1).forEach((dependentKey) => {
        if (next[dependentKey] === undefined) return;
        const upTo = configurationKeys.slice(0, configurationKeys.indexOf(dependentKey) + 1);
        const compatible = units.some((unit) => upTo.every((attribute) => unit.attributes[attribute] === next[attribute]));
        if (!compatible) delete next[dependentKey];
      });
    }
    if (key === 'measure' || key === 'finish_family') setEnlarged(null);
    setSelection(next);
  };

  const isSelected = (key: string, value: string) => (key === 'finish_family' ? activeFamily : selection[key]) === value;

  const activateOption = (key: string, value: string) => {
    if (key !== 'finish_family' && isSelected(key, value)) {
      setEnlarged((current) => current && current.group === key && current.value === value ? null : { group: key, value });
      return;
    }
    setEnlarged(null);
    selectValue(key, value);
  };

  const swatchImage = (key: string, value: string) => {
    if (key === 'color') return getDuplachColorSwatchImage(model, value, assetBaseUrl);
    if (key === 'finish' && activeFamily) return getDuplachFinishSwatchImage(model, activeFamily, value, assetBaseUrl);
    return undefined;
  };

  return (
    <section aria-labelledby="duplach-selector-heading">
      <h2 id="duplach-selector-heading" className="text-lg font-semibold text-ink">Configura tu plato de ducha</h2>
      <div className="mt-4 space-y-4">
        {groups.map(({ key, options }) => {
          const label = DUPLACH_FILTER_LABELS[key] || key;
          const displayOption = (value: string) => key === 'finish_family' ? model.familyNames[value] || value : value;
          if (key === 'measure') {
            return (
              <div key={key}>
                <label htmlFor="duplach-measure-select" className="text-sm font-semibold text-graphite">{label}</label>
                <select
                  id="duplach-measure-select"
                  value={selection.measure ?? ''}
                  onChange={(event) => { if (event.target.value) selectValue('measure', event.target.value); }}
                  className="mt-2 block min-h-11 w-full max-w-xs rounded-lg border border-ink/20 bg-white px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                >
                  {options.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            );
          }
          if (key === 'color' || key === 'finish') {
            return (
              <fieldset key={key} disabled={key === 'finish' && !activeFamily}>
                <legend className="text-sm font-semibold text-graphite">{label}</legend>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {options.map((value) => {
                    const image = swatchImage(key, value);
                    const selected = isSelected(key, value);
                    const enlargedActive = enlarged?.group === key && enlarged?.value === value;
                    const showLabel = !image || selected || enlargedActive;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        aria-expanded={enlargedActive}
                        onClick={() => activateOption(key, value)}
                        className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-white text-center transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay ${selected ? 'border-ink ring-2 ring-ink' : 'border-ink/20 hover:border-ink/50'} ${enlargedActive ? 'z-10 scale-125 shadow-lift' : ''}`}
                      >
                        {image && <img src={image.url} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
                        <span className={`relative z-[1] mx-1 max-h-full overflow-hidden break-words rounded-full bg-white/92 px-1.5 py-1 text-xs font-semibold text-ink shadow-soft transition-opacity duration-150 ${showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>{displayOption(value)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          }
          return (
            <fieldset key={key}>
              <legend className="text-sm font-semibold text-graphite">{label}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected(key, value)}
                    onClick={() => selectValue(key, value)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay ${isSelected(key, value) ? 'border-ink bg-ink text-white' : 'border-ink/20 text-graphite hover:border-ink/50'}`}
                  >
                    {displayOption(value)}
                  </button>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
      {familyFirst && !activeFamily && (
        <p className="mt-4 text-sm text-graphite" role="status">Selecciona una familia para elegir su acabado.</p>
      )}
      {currentUnit && (
        <p className="mt-4 text-sm text-graphite" aria-live="polite">
          {currentUnit.variantSnapshot?.reference ? `Referencia: ${String(currentUnit.variantSnapshot.reference)}` : 'Configuración seleccionada'}
        </p>
      )}
    </section>
  );
}
