import { useEffect, useMemo, useState } from 'react';
import type { ProductDetail } from '../model/types';
import { findEnclosureUnit, findMatchingUnit, getAttributeOptions, getEnclosureAttributeOptions, getSelectableUnits, isGmeEnclosureProduct, selectEnclosureFinish, selectInitialEnclosureUnit, selectInitialUnit } from '../model/selection';
import type { SelectableUnit } from '../model/selection';

type ProductVariantSelectorProps = {
  product: ProductDetail;
  onSelectionChange: (unit: SelectableUnit | null) => void;
};

const labels: Record<string, string> = {
  dimension: 'Medida',
  finish: 'Acabado',
  distribution: 'Distribución',
  finishCode: 'Código de acabado',
  offer: 'Oferta',
};

export function ProductVariantSelector({ product, onSelectionChange }: ProductVariantSelectorProps) {
  const units = useMemo(() => getSelectableUnits(product), [product]);
  const isGmeEnclosure = isGmeEnclosureProduct(product);
  const initialUnit = useMemo(() => isGmeEnclosure ? selectInitialEnclosureUnit(units) : selectInitialUnit(units), [isGmeEnclosure, units]);
  const [selection, setSelection] = useState<Record<string, string>>(initialUnit?.attributes || {});
  const currentUnit = isGmeEnclosure
    ? findEnclosureUnit(units, selection.finish, selection.distribution) || initialUnit
    : findMatchingUnit(units, selection) || initialUnit;
  const options = isGmeEnclosure ? getEnclosureAttributeOptions(units, currentUnit?.attributes || selection) : getAttributeOptions(units, selection);

  useEffect(() => {
    setSelection(initialUnit?.attributes || {});
  }, [initialUnit]);

  useEffect(() => {
    onSelectionChange(currentUnit);
  }, [currentUnit, onSelectionChange]);

  if (units.length <= 1) return null;

  return (
    <section aria-labelledby="variant-selector-heading">
      <h2 id="variant-selector-heading" className="text-lg font-semibold text-ink">Configura tu producto</h2>
      <div className="mt-4 space-y-4">
        {Object.entries(options).map(([key, values]) => (
          <fieldset key={key}>
            <legend className="text-sm font-semibold text-graphite">{labels[key] || key}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = currentUnit?.attributes[key] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay ${isSelected ? 'border-ink bg-ink text-white' : 'border-ink/20 text-graphite hover:border-ink/50'}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (isGmeEnclosure) {
                        const nextUnit = key === 'finish'
                          ? selectEnclosureFinish(units, currentUnit?.attributes || selection, value)
                          : findEnclosureUnit(units, currentUnit?.attributes.finish, value);
                        if (nextUnit) setSelection(nextUnit.attributes);
                        return;
                      }
                      const nextSelection = { ...selection, [key]: value };
                      if (key === 'finish') delete nextSelection.finishCode;
                      const nextUnit = findMatchingUnit(units, nextSelection);
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
        <p className="mt-4 text-sm text-graphite" aria-live="polite">
          {currentUnit.variantSnapshot.reference ? `Referencia: ${currentUnit.variantSnapshot.reference}` : 'Configuración seleccionada'}
        </p>
      )}
    </section>
  );
}
