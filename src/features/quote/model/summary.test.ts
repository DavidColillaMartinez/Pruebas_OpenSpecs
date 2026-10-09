import { describe, expect, it } from 'vitest';
import { formatQuoteLineReference, formatQuoteLineSummary, getQuoteSummaryAttributes } from './summary';

describe('quote summary formatter', () => {
  it('formats the commercial IO example without metadata or URLs', () => {
    const summary = formatQuoteLineSummary({
      productName: 'Rhio',
      reference: '3166OR',
      variantSnapshot: {
        supplier: 'GME',
        supplier_id: 'gme',
        category: 'Grifería',
        category_id: 'griferia',
        catalog_section: 'griferia',
        reference_status: 'exact',
        tap_type: 'lavabo_alto',
        finish: 'Oro',
        image: 'https://assets.colilladavid.es/proyectos/lrmq/catalogo/images/gme_griferia/io-2026/covers/rhio/cover-candidate.webp',
      },
    });
    expect(summary).toBe('Caño alto · Oro · Ref. 3166OR');
    expect(summary).not.toMatch(/gme|griferia|image|reference_status|assets\./);
  });

  it('shows the fixed configuration translated for single-variant showers', () => {
    const attributes = getQuoteSummaryAttributes({
      productName: 'Niagara · Ducha vista monomando',
      reference: 'NI223CL',
      variantSnapshot: {
        supplier_id: 'gme',
        category_id: 'griferia',
        tap_type: 'vista',
        installation: 'empotrable',
        mechanism: 'monomando',
        finish: 'Cromo',
        model: 'Niagara',
      },
    });
    expect(attributes).toEqual([
      expect.objectContaining({ label: 'Tipo de grifo', value: 'Vista' }),
      expect.objectContaining({ label: 'Instalación', value: 'Empotrable' }),
      expect.objectContaining({ label: 'Mecanismo', value: 'Monomando' }),
      expect.objectContaining({ label: 'Acabado', value: 'Cromo' }),
    ]);
  });

  it('keeps the series/model out of the attributes under the title', () => {
    const attributes = getQuoteSummaryAttributes({
      productName: 'Rhio',
      variantSnapshot: { supplier_id: 'gme', category_id: 'griferia', tap_type: 'lavabo_bajo', model: 'Rhio', collection: 'Rhio' },
    });
    expect(attributes).toHaveLength(1);
    expect(attributes[0]).toEqual({ label: 'Tipo de grifo', value: 'Caño bajo' });
  });

  it('keeps distinct measures and merges only equivalent spellings', () => {
    const attributes = getQuoteSummaryAttributes({
      selectedAttributes: { dimension: 'Ø 60 cm', measure: 'Ø60' },
    });
    expect(attributes).toHaveLength(1);
    expect(attributes[0]).toEqual({ label: 'Medida', value: 'Ø 60 cm' });

    const distinct = getQuoteSummaryAttributes({ selectedAttributes: { dimension: 'Ø 60', measure: 'Ø 70' } });
    expect(distinct).toHaveLength(2);
  });

  it('formats other families with explicit labels and hides forbidden keys', () => {
    const attributes = getQuoteSummaryAttributes({
      productName: 'Logika',
      reference: 'R-1',
      selectedAttributes: { finish: 'Nogal', presentation_type: 'Suspendido', whatever_internal: 'x' },
    });
    expect(attributes).toEqual([
      expect.objectContaining({ label: 'Acabado', value: 'Nogal' }),
      expect.objectContaining({ label: 'Tipo de presentación', value: 'Suspendido' }),
    ]);
    expect(attributes.some((attribute) => attribute.label === 'whatever internal')).toBe(false);
  });

  it('falls back honestly when a reference is not published', () => {
    expect(formatQuoteLineReference(undefined)).toBe('Referencia no publicada');
    expect(formatQuoteLineReference('')).toBe('Referencia no publicada');
    expect(formatQuoteLineReference('7195')).toBe('Referencia 7195');
  });
});
