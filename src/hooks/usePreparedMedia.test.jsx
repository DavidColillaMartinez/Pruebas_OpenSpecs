import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reformas } from '../sections/desktop/Reformas';
import { Vision } from '../sections/desktop/Vision';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('section media delivery', () => {
  it('keeps initial text and stable geometry without distant URLs in SSR', () => {
    const html = renderToString(<><Reformas isActive={false} smoothProgress={0} /><Vision isActive={false} step={0} /></>);
    expect(html).toContain('Tu proyecto, paso a paso.');
    expect(html).toContain('Del boceto a tu nuevo baño.');
    expect(html).toContain('width="768" height="432"');
    expect(html).not.toContain('.mp4');
    expect(html).not.toContain('poster=');
  });

  it('prepares the upcoming narrative chapter and retains its source on backwards navigation', () => {
    const { rerender } = render(<Reformas narrative isActive={false} prepareMedia={false} smoothProgress={0} />);
    const video = screen.getByLabelText('Video stopmotion de reforma de baño completo');
    expect(video).not.toHaveAttribute('src');
    rerender(<Reformas narrative isActive={false} prepareMedia smoothProgress={0} />);
    expect(video.getAttribute('src')).toMatch(/reforma-proceso.mp4$/);
    rerender(<Reformas narrative isActive={false} prepareMedia={false} smoothProgress={0} />);
    expect(video.getAttribute('src')).toMatch(/reforma-proceso.mp4$/);
  });

  it('does not observe overlapping scenes during the desktop hydration snapshot', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);
    const observer = vi.fn();
    vi.stubGlobal('IntersectionObserver', observer);
    render(<Reformas narrative={false} isActive={false} smoothProgress={0} />);
    expect(observer).not.toHaveBeenCalled();
  });

  it('prepares natural-scroll media at proximity, not on mount', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
    let notify, options;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback, init) { notify = callback; options = init; }
      observe() {}
      disconnect() {}
    });
    render(<main style={{ overflowY: 'auto' }}><Reformas narrative={false} isActive={false} smoothProgress={0} /></main>);
    const video = screen.getByLabelText('Video stopmotion de reforma de baño completo');
    expect(options.root).toBe(video.closest('main'));
    expect(options.rootMargin).toBe('800px 0px');
    expect(video).not.toHaveAttribute('src');
    act(() => notify([{ isIntersecting: true }]));
    expect(video.getAttribute('src')).toMatch(/reforma-proceso.mp4$/);
  });

  it('ignores ended/error while Vision has no source and does not expose comparison', () => {
    const onHold = vi.fn();
    render(<Vision narrative isActive={false} prepareMedia={false} step={0} onHold={onHold} />);
    const video = screen.getByLabelText('Video de boceto dibujándose');
    expect(video).not.toHaveAttribute('src');
    expect(video).not.toHaveAttribute('poster');
    fireEvent.ended(video);
    fireEvent.error(video);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(onHold).not.toHaveBeenCalled();
  });

  it('does not finish an unbuffered source and releases navigation if loading stalls', () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const onHold = vi.fn();
    render(<Vision narrative isActive prepareMedia step={0} onHold={onHold} />);
    const video = screen.getByLabelText('Video de boceto dibujándose');
    expect(video).toHaveAttribute('src');
    fireEvent.ended(video);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(8000));
    expect(onHold).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir video de nuevo' }));
    expect(onHold).toHaveBeenLastCalledWith(false);
  });
});
