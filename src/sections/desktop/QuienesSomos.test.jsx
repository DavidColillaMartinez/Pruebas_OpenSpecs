import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuienesSomos } from './QuienesSomos';
import { chapterSteps, chapterLabels, sectionIds } from '../../data/copy';

function parts(container) {
  const rows = [...container.querySelectorAll('div.space-y-7 > div.grid')];
  return rows.map((row) => ({ text: row.querySelector('div'), image: row.querySelector('img') }));
}

describe('desktop QuienesSomos chapter', () => {
  it('declares the chapter order and five choreographed cascade steps', () => {
    expect(sectionIds.indexOf('quienes-somos')).toBe(1);
    expect(chapterLabels[1]).toBe('Quiénes somos');
    expect(chapterSteps[1]).toBe(5);
  });

  it('reveals block one text from above and its image right after', () => {
    const { container } = render(<QuienesSomos step={1} isActive />);
    const [first, second] = parts(container);
    expect(first.text.className).toContain('opacity-100');
    expect(first.image.className).toContain('opacity-0');
    expect(first.image.className).toContain('-translate-y-8');
    expect(second.text.className).toContain('opacity-0');

    const { container: c2 } = render(<QuienesSomos step={2} isActive />);
    expect(parts(c2)[0].image.className).toContain('opacity-100');
  });

  it('slides the second image from the left and its text from the right together', () => {
    const { container } = render(<QuienesSomos step={2} isActive />);
    const [first, second] = parts(container);
    expect(second.text.className).toContain('translate-x-8');
    expect(second.image.className).toContain('-translate-x-8');
    expect(second.image.className).toContain('lg:order-1');

    const { container: c3 } = render(<QuienesSomos step={3} isActive />);
    expect(parts(c3)[1].text.className).toContain('opacity-100');
    expect(parts(c3)[1].image.className).toContain('opacity-100');
  });

  it('raises the last text from below and staggers its image after', () => {
    const { container } = render(<QuienesSomos step={4} isActive />);
    const last = parts(container)[2];
    expect(last.text.className).toContain('opacity-100');
    expect(last.image.className).toContain('translate-y-8');

    const { container: c5 } = render(<QuienesSomos step={5} isActive />);
    const finalParts = parts(c5);
    expect(finalParts.every((part) => part.text.className.includes('opacity-100') && part.image.className.includes('opacity-100'))).toBe(true);
    expect(finalParts[2].image.style.transitionDelay).toBe('180ms');
  });
});
