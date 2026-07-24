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

  it('reveals all method articles from one step with one-second delays', () => {
    const { container } = render(<MemoryRouter><Inicio step={1} isActive /></MemoryRouter>);
    const articles = [...container.querySelectorAll('article')];

    expect(chapterSteps[0]).toBe(1);
    expect(articles).toHaveLength(3);
    expect(articles.map((article) => article.style.transitionDelay)).toEqual(['0ms', '800ms', '1600ms']);
    expect(articles.every((article) => article.className.includes('opacity-100'))).toBe(true);
  });
});
