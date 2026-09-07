import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './App';
import { chapterLabels, navItems, sectionIds } from './data/copy';

const navigateTo = vi.fn();
vi.mock('./hooks/useNarrativeScroll', () => ({
  useNarrativeScroll: () => ({
    activeChapter: 0,
    step: 0,
    smoothProgress: 0,
    setChapterHold: vi.fn(),
    isDesktop: true,
    reducedMotion: true,
    activeSectionId: 'inicio',
    navigateTo,
  }),
}));

beforeEach(() => {
  navigateTo.mockClear();
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  document.body.className = '';
  document.body.style.background = '';
});

describe('LandingPage narrative lifecycle', () => {
  it('owns the scroll lock class while mounted and cleans up on unmount', () => {
    const { unmount } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(document.body.classList.contains('landing-narrative')).toBe(true);
    expect(document.body.style.background).toBe('rgb(255, 255, 255)');
    expect(screen.getAllByRole('link', { name: 'Tienda' })[0]).toHaveAttribute('href', '/productos');
    expect(screen.queryByRole('link', { name: /Presupuesto/ })).not.toBeInTheDocument();

    unmount();

    expect(document.body.classList.contains('landing-narrative')).toBe(false);
    expect(document.body.style.background).toBe('');
  });

  it('exposes the seven chapters in dots and top navigation', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(sectionIds).toEqual(['inicio', 'quienes-somos', 'coleccion', 'reformas', 'vision', 'opiniones', 'contacto']);
    for (const label of chapterLabels) {
      expect(screen.getByRole('button', { name: `Ir a ${label}` })).toBeInTheDocument();
    }
    const navLabels = [...document.querySelectorAll('nav a')].map((link) => link.textContent);
    expect(navLabels).toEqual(navItems.map((item) => item.label));
    expect(navItems[0].label).toBe('Quiénes somos');
    expect(navItems[navItems.length - 2].label).toBe('Opiniones');
  });

  it('routes a deep link hash to its chapter on mount', () => {
    window.history.pushState({}, '', '/#contacto');
    render(<MemoryRouter><LandingPage /></MemoryRouter>);
    expect(navigateTo).toHaveBeenCalledWith(sectionIds.indexOf('contacto'));
  });

  it('ignores unknown hashes without navigating', () => {
    window.history.pushState({}, '', '/#fantasma');
    render(<MemoryRouter><LandingPage /></MemoryRouter>);
    expect(navigateTo).not.toHaveBeenCalled();
  });
});
