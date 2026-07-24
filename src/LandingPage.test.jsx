import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
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
  document.body.style.background = '';
});

describe('LandingPage background lifecycle', () => {
  it('uses white while mounted and cleans up on unmount', () => {
    const { unmount } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(document.body.style.background).toBe('rgb(255, 255, 255)');
    unmount();
    expect(document.body.style.background).toBe('');
  });
});
