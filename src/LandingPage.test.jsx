import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './App';

vi.mock('./hooks/useNarrativeScroll', () => ({
  useNarrativeScroll: () => ({
    activeChapter: 0,
    step: 0,
    smoothProgress: 0,
    setBlocked: vi.fn(),
    isDesktop: true,
    reducedMotion: true,
    activeSectionId: 'inicio',
    navigateTo: vi.fn(),
  }),
}));

afterEach(() => {
  document.body.className = '';
  document.body.style.background = '';
});

describe('LandingPage narrative lifecycle', () => {
  it('owns the scroll lock class while mounted and cleans up on unmount', () => {
    const { unmount } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(document.body.classList.contains('landing-narrative')).toBe(true);
    expect(document.body.style.background).toBe('rgb(255, 255, 255)');
    expect(screen.getByRole('link', { name: /Presupuesto, 0 selecciones/ })).toHaveAttribute('href', '/presupuesto');

    unmount();

    expect(document.body.classList.contains('landing-narrative')).toBe(false);
    expect(document.body.style.background).toBe('');
  });
});
