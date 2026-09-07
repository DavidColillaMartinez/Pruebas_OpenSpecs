import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuienesSomos } from './QuienesSomos';
import { chapterSteps, chapterLabels, sectionIds } from '../../data/copy';

describe('desktop QuienesSomos chapter', () => {
  it('declares one cascade step per block plus a leading pause state', () => {
    expect(sectionIds.indexOf('quienes-somos')).toBe(1);
    expect(chapterLabels[1]).toBe('Quiénes somos');
    expect(chapterSteps[1]).toBe(3);
  });

  it('renders the headline immediately and reveals the three blocks in order', () => {
    const { container } = render(<QuienesSomos step={2} isActive />);
    expect(screen.getByRole('heading', { name: 'Qué hay detrás de cada baño.' })).toBeInTheDocument();

    const rows = [...container.querySelectorAll('div.space-y-7 > div.grid')];
    expect(rows).toHaveLength(3);
    expect(rows[0].className).toContain('opacity-100');
    expect(rows[1].className).toContain('opacity-100');
    expect(rows[2].className).toContain('opacity-0');
  });

  it('alternates layout and completes all blocks at the last step', () => {
    const { container } = render(<QuienesSomos step={3} isActive />);
    const rows = [...container.querySelectorAll('div.space-y-7 > div.grid')];
    expect(rows.every((row) => row.className.includes('opacity-100'))).toBe(true);
    const image = rows[1].querySelector('img');
    const text = rows[1].querySelector('div');
    expect(image.className).toContain('lg:order-1');
    expect(text.className).toContain('lg:order-2');
  });
});
