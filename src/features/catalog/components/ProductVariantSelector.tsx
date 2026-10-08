import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProductDetail } from '../model/types';
import { findMatchingUnit, getAttributeOptions, getSelectableUnits, isAttributeValueCompatible, selectCompatibleUnit, selectInitialUnit } from '../model/selection';
import type { SelectableUnit } from '../model/selection';
import { isRoyoFurnitureScope } from '../model/royo';
import { getGmeIoFacts, getGmeIoSelectionKeys, getGmeIoSelectorImages, isGmeIoProduct, type GmeIoSelectorImages } from '../model/gmeIo';

export type SelectionChangeMeta = {
  source: 'initial' | 'user';
  // Axis changed by the user for this specific change; undefined on initial
  // selection. Consumers must only react to manual finish changes.
  changedKey?: string;
};

type ProductVariantSelectorProps = {
  product: ProductDetail;
  onSelectionChange: (unit: SelectableUnit | null, metadata: SelectionChangeMeta) => void;
};

const labels: Record<string, string> = {
  dimension: 'Medida',
  measure: 'Medida',
  finish: 'Acabado',
  version: 'Versión',
  distribution: 'Distribución',
  glass: 'Vidrio',
  opening: 'Apertura',
  orientation: 'Orientación',
  has_led: 'LED',
  lighting_type: 'Tipo de iluminación',
  lighting_technology: 'Tecnología LED',
  light_temp: 'Temperatura de luz',
  finishCode: 'Código de acabado',
  offer: 'Oferta',
  furniture_finish: 'Acabado del mueble',
  handle_finish: 'Acabado del tirador',
  countertop_finish: 'Acabado de encimera',
  presentation_type: 'Tipo de presentación',
  furniture_type: 'Tipo de mueble',
  module_type: 'Tipo de módulo',
  type: 'Tipo',
  tap_type: 'Tipo de grifo',
  installation: 'Instalación',
  mechanism: 'Mecanismo',
};

export function ProductVariantSelector({ product, onSelectionChange }: ProductVariantSelectorProps) {
  const units = useMemo(() => getSelectableUnits(product), [product]);
  const initialUnit = useMemo(() => selectInitialUnit(units), [units]);
  const [selection, setSelection] = useState<Record<string, string>>(initialUnit?.attributes || {});
  const productIdRef = useRef(product.id);
  const userSelectionRef = useRef(false);
  const changedKeyRef = useRef<string | undefined>(undefined);
  const currentUnit = findMatchingUnit(units, selection) || selectCompatibleUnit(units, selection, undefined, product.configurationFields) || initialUnit;
  const isIo = isGmeIoProduct(product);
  const selectorImages = useMemo(() => isIo ? getGmeIoSelectorImages(product) : {}, [isIo, product]);
  const ioOptions = useMemo(() => isIo ? getGmeIoSelectionKeys(product) : undefined, [isIo, product]);
  const ioFacts = useMemo(() => isIo ? getGmeIoFacts(product) : [], [isIo, product]);
  const options = getAttributeOptions(units, currentUnit?.attributes || selection, isIo ? ioOptions : product.configurationFields);
  const enforceCompatibility = isRoyoFurnitureScope(product) || isIo;

  useEffect(() => {
    if (productIdRef.current === product.id) {
      const changedKey = changedKeyRef.current;
      changedKeyRef.current = undefined;
      onSelectionChange(currentUnit, { source: userSelectionRef.current ? 'user' : 'initial', ...(changedKey ? { changedKey } : {}) });
      userSelectionRef.current = false;
      return;
    }
    productIdRef.current = product.id;
    userSelectionRef.current = false;
    changedKeyRef.current = undefined;
    setSelection(initialUnit?.attributes || {});
  }, [currentUnit, initialUnit, onSelectionChange, product.id, selection]);

  if (units.length <= 1 || Object.keys(options).length === 0) return null;

  return (
    <section aria-labelledby="variant-selector-heading">
      <h2 id="variant-selector-heading" className="text-lg font-semibold text-primary">Configura tu producto</h2>
      {ioFacts.length > 0 && (
        <p className="mt-2 text-sm text-secondary">{ioFacts.map((fact) => `${fact.label}: ${fact.value}`).join(' · ')}</p>
      )}
      <div className="mt-4 space-y-4">
        {Object.entries(options).map(([key, values]) => (
          <fieldset key={key}>
            <legend className="text-sm font-semibold text-secondary">{labels[key] || key}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = currentUnit?.attributes[key] === value;
                const isCompatible = isAttributeValueCompatible(units, currentUnit?.attributes || selection, key, value, isIo ? ioOptions : product.configurationFields);
                const swatch = (selectorImages as GmeIoSelectorImages)[key as keyof GmeIoSelectorImages]?.[value];
                return (
                  <button
                  key={value}
                    disabled={enforceCompatibility && !isCompatible}
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? 'border-ink bg-ink text-white' : 'border-border-hairline/20 text-secondary hover:border-border-hairline/50'}`}
                    aria-pressed={isSelected}
                    aria-disabled={enforceCompatibility && !isCompatible}
                    onClick={() => {
                      userSelectionRef.current = true;
                      changedKeyRef.current = key;
                      const nextSelection = { ...selection, [key]: value };
                      if (key === 'finish') delete nextSelection.finishCode;
                      const nextUnit = selectCompatibleUnit(units, nextSelection, key, isIo ? ioOptions : product.configurationFields);
                      if (isIo && !nextUnit) return;
                      setSelection(nextUnit?.attributes || nextSelection);
                    }}
                  >
                    {swatch && <img src={swatch.url} alt="" aria-hidden="true" className="h-6 w-6 rounded-full object-contain" loading="lazy" decoding="async" />}
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      {currentUnit?.variantSnapshot && (
        <p className="mt-4 text-sm text-secondary" aria-live="polite">
          {currentUnit.variantSnapshot.reference ? `Referencia: ${currentUnit.variantSnapshot.reference}` : 'Configuración seleccionada'}
        </p>
      )}
    </section>
  );
}
