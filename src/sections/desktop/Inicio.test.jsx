import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Inicio } from './Inicio';
import { chapterSteps } from '../../data/copy';

describe('desktop landing catalog access', () => {
  it('makes the Tienda label open the product catalog', () => {
    render(<MemoryRouter><Inicio step={0} isActive /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'Abrir catálogo de productos' })).toHaveAttribute('href', '/productos');
  });

  it('reveals all method articles from one step with faster staggered delays', () => {
    const { container } = render(<MemoryRouter><Inicio step={1} isActive /></MemoryRouter>);
    const articles = [...container.querySelectorAll('article')];

    expect(chapterSteps[0]).toBe(1);
    expect(articles).toHaveLength(3);
    expect(articles.map((article) => article.style.transitionDelay)).toEqual(['0ms', '320ms', '640ms']);
    expect(articles.every((article) => article.className.includes('opacity-100'))).toBe(true);
  });

  it('hides method articles before the cascade step arrives', () => {
    const { container } = render(<MemoryRouter><Inicio step={0} isActive /></MemoryRouter>);
    const articles = [...container.querySelectorAll('article')];
    expect(articles.every((article) => article.className.includes('opacity-0'))).toBe(true);
  });

  it('anchors the method grid at an intermediate fluid distance below the headline', () => {
    const { container } = render(<MemoryRouter><Inicio step={1} isActive /></MemoryRouter>);
    const grid = container.querySelector('[class*="max-w-4xl"]');
    expect(grid.className).toContain('mt-[clamp(3.5rem,14vh,10rem)]');
    expect(grid.className).not.toContain('absolute');
  });
});
