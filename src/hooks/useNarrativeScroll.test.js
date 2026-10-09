import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNarrativeScroll } from './useNarrativeScroll';
import { chapterSteps, sectionIds } from '../data/copy';

const COLECCION = sectionIds.indexOf('coleccion');
const REFORMAS = sectionIds.indexOf('reformas');
const VISION = sectionIds.indexOf('vision');
const OPINIONES = sectionIds.indexOf('opiniones');

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
    vi.stubGlobal('innerHeight', 960);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('holds the initial chapter cascade until the logo ready signal releases it', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    expect(result.current.activeChapter).toBe(0);
    expect(result.current.step).toBe(0);

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.step).toBe(0);

    act(() => { result.current.setChapterHold(0, false); });
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

  it('keeps non-replay chapters complete when returning to them', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(OPINIONES); });
    act(() => { vi.advanceTimersByTime(6000); });
    expect(result.current.step).toBe(chapterSteps[OPINIONES]);

    act(() => { result.current.navigateTo(VISION); });
    act(() => { result.current.navigateTo(OPINIONES); });
    expect(result.current.step).toBe(chapterSteps[OPINIONES]);
  });

  it('replays the Colección cascade when returning to it', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(COLECCION); });
    act(() => { vi.advanceTimersByTime(8000); });
    expect(result.current.step).toBe(chapterSteps[COLECCION]);

    act(() => { result.current.navigateTo(REFORMAS); });
    act(() => { result.current.navigateTo(COLECCION); });
    expect(result.current.step).toBe(0);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.step).toBe(1);
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

  it.each(['input', 'textarea', 'select', 'editable', 'dialog'])(
    'leaves navigation keys in %s controls to the focused control', (kind) => {
      const { result } = renderHook(() => useNarrativeScroll());
      act(() => { result.current.navigateTo(OPINIONES); });
      act(() => { vi.advanceTimersByTime(8000); });
      const container = document.createElement('div');
      const control = document.createElement(['editable', 'dialog'].includes(kind) ? 'span' : kind);
      if (kind === 'editable') container.setAttribute('contenteditable', 'true');
      if (kind === 'dialog') container.setAttribute('role', 'dialog');
      container.append(control);
      document.body.append(container);
      try {
        for (const key of ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']) {
          const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
          act(() => { control.dispatchEvent(event); });
          expect(event.defaultPrevented).toBe(false);
          expect(result.current.activeChapter).toBe(OPINIONES);
        }
        pressKey('ArrowUp');
        expect(result.current.activeChapter).toBe(VISION);
      } finally {
        container.remove();
      }
    }
  );

  it('respects a navigation key already handled by a child', () => {
    const { result } = renderHook(() => useNarrativeScroll());
    act(() => { result.current.navigateTo(OPINIONES); });
    act(() => { vi.advanceTimersByTime(8000); });
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    event.preventDefault();
    act(() => { window.dispatchEvent(event); });
    expect(result.current.activeChapter).toBe(OPINIONES);
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
    vi.stubGlobal('innerHeight', 960);
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
      vi.unstubAllGlobals();
    }
  });
});
