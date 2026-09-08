import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Coleccion } from './Coleccion';
import { chapterSteps, sectionIds } from '../../data/copy';

function columns(container) {
  const [left, right] = [...container.querySelectorAll('div.grid > div')];
  return { left, right, leftCard: left.querySelector('div'), rightBlocks: [...right.children] };
}

describe('Coleccion minimal presentation', () => {
  it('renders the minimal branch without card articles', () => {
    const { container } = render(<Coleccion step={chapterSteps[sectionIds.indexOf('coleccion')]} isActive />);

    expect(screen.getByRole('heading', { name: 'Tres decisiones, una lectura.' })).toBeInTheDocument();
    expect(screen.queryByText('Accesorios de baño')).not.toBeInTheDocument();
    expect(container.querySelectorAll('article')).toHaveLength(0);
  });

  it('declares three cascade steps for the chapter', () => {
    expect(chapterSteps[sectionIds.indexOf('coleccion')]).toBe(3);
  });

  it('reveals the left image and card together with one fluid internal delay', () => {
    const { container } = render(<Coleccion step={1} isActive />);
    const { left, leftCard, rightBlocks } = columns(container);
    expect(left.className).toContain('opacity-0');
    expect(leftCard.className).toContain('opacity-0');
    expect(rightBlocks.every((block) => block.className.includes('opacity-0'))).toBe(true);

    const { container: c2 } = render(<Coleccion step={2} isActive />);
    const revealed = columns(c2);
    expect(revealed.left.className).toContain('opacity-100');
    expect(revealed.leftCard.className).toContain('opacity-100');
    expect(revealed.leftCard.style.transitionDelay).toBe('180ms');
    expect(revealed.rightBlocks.every((block) => block.className.includes('opacity-0'))).toBe(true);
  });

  it('shows the right column together after the long pause with short staggers', () => {
    const { container } = render(<Coleccion step={3} isActive />);
    const { rightBlocks } = columns(container);
    expect(rightBlocks.every((block) => block.className.includes('opacity-100'))).toBe(true);
    expect(rightBlocks.map((block) => block.style.transitionDelay)).toEqual(['', '160ms', '320ms']);
  });
});
