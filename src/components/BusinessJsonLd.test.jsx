import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BusinessJsonLd } from './BusinessJsonLd';

describe('BusinessJsonLd', () => {
  it('emits only confirmed business data', () => {
    const { container } = render(<BusinessJsonLd />);
    const data = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent ?? 'null');

    expect(data['@type']).toBe('LocalBusiness');
    expect(data).not.toHaveProperty('priceRange');
    expect(data).not.toHaveProperty('openingHours');
    expect(data.name).toBe('AREA LRMQ');
    expect(data.legalName).toBe('ÁREA LRMQ DESING S.L');
    expect(data.address.streetAddress).toBe('C/ Aquitania, 69, local 1');
    expect(data.sameAs).toEqual(['https://www.instagram.com/arealrmqtienda/', 'https://maps.google.com/?cid=8560142667066455201']);
  });
});
