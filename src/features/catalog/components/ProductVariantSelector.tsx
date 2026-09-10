import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProductDetail } from '../model/types';
import { findMatchingUnit, getAttributeOptions, getSelectableUnits, isAttributeValueCompatible, selectCompatibleUnit, selectInitialUnit } from '../model/selection';
import type { SelectableUnit } from '../model/selection';
import { isRoyoFurnitureScope } from '../model/royo';

export type SelectionChangeMeta = {
  source: 'initial' | 'user';
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
};

export function ProductVariantSelector({ product, onSelectionChange }: ProductVariantSelectorProps) {
  const units = useMemo(() => getSelectableUnits(product), [product]);
  const initialUnit = useMemo(() => selectInitialUnit(units), [units]);
  const [selection, setSelection] = useState<Record<string, string>>(initialUnit?.attributes || {});
  const productIdRef = useRef(product.id);
  const userSelectionRef = useRef(false);
  const currentUnit = findMatchingUnit(units, selection) || selectCompatibleUnit(units, selection, undefined, product.configurationFields) || initialUnit;
  const options = getAttributeOptions(units, currentUnit?.attributes || selection, product.configurationFields);
  const enforceCompatibility = isRoyoFurnitureScope(product);

  useEffect(() => {
    if (productIdRef.current === product.id) {
      onSelectionChange(currentUnit, { source: userSelectionRef.current ? 'user' : 'initial' });
      userSelectionRef.current = false;
      return;
    }
    productIdRef.current = product.id;
    userSelectionRef.current = false;
    setSelection(initialUnit?.attributes || {});
  }, [currentUnit, initialUnit, onSelectionChange, product.id, selection]);

  if (units.length <= 1 || Object.keys(options).length === 0) return null;

  return (
    <section aria-labelledby="variant-selector-heading">
      <h2 id="variant-selector-heading" className="text-lg font-semibold text-primary">Configura tu producto</h2>
      <div className="mt-4 space-y-4">
        {Object.entries(options).map(([key, values]) => (
          <fieldset key={key}>
            <legend className="text-sm font-semibold text-secondary">{labels[key] || key}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = currentUnit?.attributes[key] === value;
                const isCompatible = isAttributeValueCompatible(units, currentUnit?.attributes || selection, key, value, product.configurationFields);
                return (
                  <button
                  key={value}
                    disabled={enforceCompatibility && !isCompatible}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? 'border-ink bg-ink text-white' : 'border-border-hairline/20 text-secondary hover:border-border-hairline/50'}`}
                    aria-pressed={isSelected}
                    aria-disabled={enforceCompatibility && !isCompatible}
                    onClick={() => {
                      userSelectionRef.current = true;
                      const nextSelection = { ...selection, [key]: value };
                      if (key === 'finish') delete nextSelection.finishCode;
                      const nextUnit = selectCompatibleUnit(units, nextSelection, key, product.configurationFields);
                      setSelection(nextUnit?.attributes || nextSelection);
                    }}
                  >
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
