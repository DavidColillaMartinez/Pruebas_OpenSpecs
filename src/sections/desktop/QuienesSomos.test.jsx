import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { QuienesSomos } from './QuienesSomos';
import { chapterSteps, chapterLabels, sectionIds } from '../../data/copy';

function parts(container) {
  const rows = [...container.querySelectorAll('div.space-y-7 > div.grid')];
  return rows.map((row) => ({ text: row.querySelector('div'), image: row.querySelector('img') }));
}

describe('desktop QuienesSomos chapter', () => {
  it('declares the chapter order and three choreographed cascade steps', () => {
    expect(sectionIds.indexOf('quienes-somos')).toBe(1);
    expect(chapterLabels[1]).toBe('Quiénes somos');
    expect(chapterSteps[1]).toBe(3);
  });

  it('reveals Estudio text and image together from above', () => {
    const { container } = render(<QuienesSomos step={0} isActive />);
    const [first] = parts(container);
    expect(first.text.className).toContain('-translate-y-8');
    expect(first.image.className).toContain('-translate-y-8');
    expect(first.text.className).toContain('opacity-0');

    const { container: c1 } = render(<QuienesSomos step={1} isActive />);
    const revealed = parts(c1);
    expect(revealed[0].text.className).toContain('opacity-100');
    expect(revealed[0].image.className).toContain('opacity-100');
    expect(revealed[1].text.className).toContain('opacity-0');
    expect(revealed[1].image.className).toContain('opacity-0');
  });

  it('keeps Oficio text left and image right, sliding in from both sides together', () => {
    const { container: c1 } = render(<QuienesSomos step={1} isActive />);
    const [, second] = parts(c1);
    expect(second.text.className).toContain('translate-x-8');
    expect(second.image.className).toContain('-translate-x-8');
    expect(second.text.className).toContain('lg:order-1');
    expect(second.image.className).toContain('lg:order-2');

    const { container: c2 } = render(<QuienesSomos step={2} isActive />);
    const row = parts(c2)[1];
    expect(row.text.className).toContain('opacity-100');
    expect(row.image.className).toContain('opacity-100');
  });

  it('shows Método image left and text right, rising from below together', () => {
    const { container: c2 } = render(<QuienesSomos step={2} isActive />);
    const last = parts(c2)[2];
    expect(last.text.className).toContain('translate-y-8');
    expect(last.image.className).toContain('translate-y-8');
    expect(last.image.className).toContain('lg:order-1');
    expect(last.text.className).toContain('lg:order-2');

    const { container: c3 } = render(<QuienesSomos step={3} isActive />);
    const finalParts = parts(c3);
    expect(finalParts.every((part) => part.text.className.includes('opacity-100') && part.image.className.includes('opacity-100'))).toBe(true);
    expect(finalParts.every((part) => part.image.style.transitionDelay === '')).toBe(true);
  });
});
