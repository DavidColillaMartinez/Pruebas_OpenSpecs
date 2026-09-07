import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNarrativeScroll } from './useNarrativeScroll';
import { chapterSteps, sectionIds } from '../data/copy';

const COLECCION = sectionIds.indexOf('coleccion');
const REFORMAS = sectionIds.indexOf('reformas');
const VISION = sectionIds.indexOf('vision');

function wheel(deltaY) {
  const event = new Event('wheel', { bubbles: true, cancelable: true });
  event.deltaY = deltaY;
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

function pressKey(key) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
}

describe('useNarrativeScroll chapter cascade', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('holds the initial chapter cascade until the logo ready signal releases it', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    expect(result.current.activeChapter).toBe(0);
    expect(result.current.step).toBe(0);

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.step).toBe(0);

    act(() => { result.current.setChapterHold(0, false); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.step).toBe(1);
  });

  it('cascades non-held chapters automatically after entering them', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    expect(result.current.activeChapter).toBe(COLECCION);
    expect(result.current.step).toBe(0);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.step).toBe(1);
    act(() => { vi.advanceTimersByTime(800); });
    expect(result.current.step).toBe(2);
    act(() => { vi.advanceTimersByTime(2400); });
    expect(result.current.step).toBe(chapterSteps[COLECCION]);
  });

  it('blocks wheel chapter changes while the cascade is running and allows them once complete', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { vi.advanceTimersByTime(1500); });
    wheel(120);
    expect(result.current.activeChapter).toBe(COLECCION);

    act(() => { vi.advanceTimersByTime(6000); });
    wheel(120);
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.activeChapter).toBe(REFORMAS);
  });

  it('returns completed chapters instantly without replaying the cascade', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { vi.advanceTimersByTime(8000); });
    expect(result.current.step).toBe(chapterSteps[COLECCION]);

    act(() => { result.current.navigateTo(0); });
    expect(result.current.activeChapter).toBe(0);
    act(() => { result.current.navigateTo(COLECCION); });
    expect(result.current.step).toBe(chapterSteps[COLECCION]);
  });

  it('replays the Visión cascade on every re-entry after its first release', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(VISION); });
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.step).toBe(0);

    act(() => { result.current.setChapterHold(VISION, false); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.step).toBe(1);

    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { result.current.navigateTo(VISION); });
    expect(result.current.step).toBe(0);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.step).toBe(1);
  });

  it('keeps the continuous reforms scrub behaviour and exits by accumulated wheel', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { vi.advanceTimersByTime(8000); });
    wheel(120);
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.activeChapter).toBe(REFORMAS);
    act(() => { vi.advanceTimersByTime(500); });

    for (let i = 0; i < 4; i += 1) {
      wheel(900);
      act(() => { vi.advanceTimersByTime(0); });
    }
    expect(result.current.activeChapter).toBe(VISION);
  });

  it('treats arrow keys like chapter navigation, respecting cascade completion', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { vi.advanceTimersByTime(1500); });
    pressKey('ArrowDown');
    expect(result.current.activeChapter).toBe(COLECCION);

    act(() => { vi.advanceTimersByTime(6000); });
    pressKey('ArrowDown');
    expect(result.current.activeChapter).toBe(REFORMAS);
  });

  it('ignores ready signals for chapters other than the active one', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { result.current.setChapterHold(0, false); });
    act(() => { vi.advanceTimersByTime(1800); });
    expect(result.current.step).toBe(2);
  });

  it('jumps via navigateTo at any moment as the escape hatch', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { vi.advanceTimersByTime(1500); });
    act(() => { result.current.navigateTo(VISION); });
    expect(result.current.activeChapter).toBe(VISION);
    expect(result.current.step).toBe(0);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.step).toBe(0);
    act(() => { result.current.setChapterHold(VISION, false); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.step).toBe(1);
  });
});

describe('useNarrativeScroll reduced motion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reveals chapters instantly without cascade timers or wheel blocking', () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    });
    try {
      vi.useFakeTimers();
      const { result } = renderHook(() => useNarrativeScroll());
      expect(result.current.reducedMotion).toBe(true);
      act(() => { result.current.navigateTo(COLECCION); });
      expect(result.current.step).toBe(chapterSteps[COLECCION]);
      wheel(120);
      act(() => { vi.advanceTimersByTime(0); });
      expect(result.current.activeChapter).toBe(REFORMAS);
    } finally {
      window.matchMedia = original;
      vi.useRealTimers();
    }
  });
});
