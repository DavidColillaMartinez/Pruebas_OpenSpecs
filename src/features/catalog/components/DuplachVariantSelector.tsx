import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProductDetail } from '../model/types';
import { getSelectableUnits, selectInitialUnit } from '../model/selection';
import type { SelectableUnit } from '../model/selection';
import type { SelectionChangeMeta } from './ProductVariantSelector';
import {
  DUPLACH_FILTER_LABELS,
  findCompleteDuplachUnit,
  getDuplachDependentOptions,
  getDuplachFamilyImages,
  getDuplachSelectorModel,
  getDuplachSwatchImage,
} from '../model/duplach';

type DuplachVariantSelectorProps = {
  product: ProductDetail;
  assetBaseUrl?: string | null;
  onSelectionChange: (unit: SelectableUnit | null, metadata: SelectionChangeMeta) => void;
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
  const initialUnit = useMemo(() => selectInitialUnit(units), [units]);
  const initialSelection = useMemo<Record<string, string>>(() => {
    if (!initialUnit) return {};
    if (familyFirst) return initialUnit.attributes.measure ? { measure: initialUnit.attributes.measure } : {};
    return Object.fromEntries(configurationKeys
      .map((key) => [key, initialUnit.attributes[key]] as const)
      .filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== ''));
  }, [configurationKeys, familyFirst, initialUnit]);
  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const [familyImageIndex, setFamilyImageIndex] = useState(0);
  const productIdRef = useRef(product.id);
  const userSelectionRef = useRef(false);
  const currentUnit = findCompleteDuplachUnit(units, selection, configurationKeys);

  useEffect(() => {
    if (productIdRef.current === product.id) {
      onSelectionChange(currentUnit, { source: userSelectionRef.current ? 'user' : 'initial' });
      userSelectionRef.current = false;
      return;
    }
    productIdRef.current = product.id;
    userSelectionRef.current = false;
    setFamilyImageIndex(0);
    setSelection(initialSelection);
  }, [currentUnit, initialSelection, onSelectionChange, product.id, selection]);

  const activeFamily = selection.finish_family;
  const groups = configurationKeys
    .filter((key) => key === 'finish' ? familyFirst : true)
    .map((key) => ({
      key,
      options: key === 'finish' && familyFirst && !activeFamily
        ? []
        : getDuplachDependentOptions(units, configurationKeys, selection, key),
    }))
    .filter((group) => group.options.length > 0);

  if (units.length <= 1) return null;

  const selectValue = (key: string, value: string) => {
    userSelectionRef.current = true;
    const keyIndex = configurationKeys.indexOf(key);
    const next: Record<string, string> = { ...selection, [key]: value };
    configurationKeys.slice(keyIndex + 1).forEach((dependentKey) => {
      if (next[dependentKey] === undefined) return;
      const upTo = configurationKeys.slice(0, configurationKeys.indexOf(dependentKey) + 1);
      const compatible = units.some((unit) => upTo.every((attribute) => unit.attributes[attribute] === next[attribute]));
      if (!compatible) delete next[dependentKey];
    });
    if (key === 'finish_family') setFamilyImageIndex(0);
    setSelection(next);
  };

  const familyImages = familyFirst && activeFamily ? getDuplachFamilyImages(product, model, activeFamily, assetBaseUrl) : [];
  const activeFamilyImage = familyImages[Math.min(familyImageIndex, Math.max(0, familyImages.length - 1))];

  return (
    <section aria-labelledby="duplach-selector-heading">
      <h2 id="duplach-selector-heading" className="text-lg font-semibold text-ink">Configura tu plato de ducha</h2>
      <div className="mt-4 space-y-4">
        {groups.map(({ key, options }) => {
          const label = DUPLACH_FILTER_LABELS[key] || key;
          const displayOption = (value: string) => key === 'finish_family' ? model.familyNames[value] || value : value;
          const isSelected = (value: string) => (key === 'finish_family' ? activeFamily : selection[key]) === value;
          const swatch = (value: string) => key === 'color' || key === 'finish'
            ? getDuplachSwatchImage(model, key === 'finish' && activeFamily ? `${activeFamily}:${value}` : value, assetBaseUrl)
            : undefined;
          return (
            <fieldset key={key} disabled={key === 'finish' && !activeFamily}>
              <legend className="text-sm font-semibold text-graphite">{label}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.map((value) => {
                  const image = swatch(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected(value)}
                      onClick={() => selectValue(key, value)}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay ${isSelected(value) ? 'border-ink bg-ink text-white' : 'border-ink/20 text-graphite hover:border-ink/50'}`}
                    >
                      {image && <img src={image.url} alt="" aria-hidden="true" className="h-6 w-6 rounded object-cover" loading="lazy" decoding="async" />}
                      {displayOption(value)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
      {familyFirst && activeFamily && familyImages.length > 0 && (
        <div className="mt-5 rounded-xl border border-ink/10 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">
            Imágenes de demostración · {model.familyNames[activeFamily] || activeFamily}
          </p>
          <div className="relative mt-2 flex items-center justify-center overflow-hidden rounded-lg bg-stonewash">
            {activeFamilyImage ? (
              <img key={activeFamilyImage.url} src={activeFamilyImage.url} alt={`${product.name}, familia ${model.familyNames[activeFamily] || activeFamily}, imagen ${Math.min(familyImageIndex, familyImages.length - 1) + 1} de ${familyImages.length}`} className="max-h-72 w-full object-contain" loading="lazy" decoding="async" />
            ) : (
              <p className="text-sm text-graphite" role="status">Sin imágenes para esta familia</p>
            )}
            {familyImages.length > 1 && (
              <>
                <button type="button" aria-label="Imagen de familia anterior" disabled={familyImageIndex <= 0} onClick={() => setFamilyImageIndex((index) => Math.max(0, index - 1))} className="absolute left-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/88 text-lg text-ink shadow-soft disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"><span aria-hidden="true">←</span></button>
                <button type="button" aria-label="Imagen de familia siguiente" disabled={familyImageIndex >= familyImages.length - 1} onClick={() => setFamilyImageIndex((index) => Math.min(familyImages.length - 1, index + 1))} className="absolute right-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/88 text-lg text-ink shadow-soft disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"><span aria-hidden="true">→</span></button>
              </>
            )}
          </div>
        </div>
      )}
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
