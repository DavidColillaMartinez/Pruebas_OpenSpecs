import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatedLogoMark, logoWipeTimings, WIPE_STROKES, LOGO_DRAW_MS, LOGO_BASE_DELAY_MS, LOGO_LETTER_SPEED } from './AnimatedLogoMark';

describe('AnimatedLogoMark', () => {
  it('draws both letters simultaneously from opposite ends with a vertex-continuous front', () => {
    expect(WIPE_STROKES[0].from[0]).toBeLessThan(WIPE_STROKES[1].to[0]);
    expect(WIPE_STROKES[0].to).toEqual(WIPE_STROKES[1].from);
    expect(WIPE_STROKES[2].from[0]).toBeGreaterThan(WIPE_STROKES[3].to[0]);
    expect(WIPE_STROKES[2].to).toEqual(WIPE_STROKES[3].from);
    expect(WIPE_STROKES[4].from[0]).toBeLessThan(WIPE_STROKES[4].to[0]);

    const timings = logoWipeTimings();
    expect(timings[0].delay).toBe(LOGO_BASE_DELAY_MS);
    expect(timings[2].delay).toBe(LOGO_BASE_DELAY_MS);
  });

  it('draws each apex exactly at half of its letter phase with gapless chains', () => {
    const timings = logoWipeTimings();
    expect(timings[0].duration).toBe(timings[1].duration);
    expect(timings[2].duration).toBe(timings[3].duration);
    expect(timings[1].delay).toBe(timings[0].delay + timings[0].duration);
    expect(timings[3].delay).toBe(timings[2].delay + timings[2].duration);
  });

  it('draws the double A at 40% speed with a near-double letter phase, keeps the gold bar at baseline, and starts it after both letters', () => {
    const timings = logoWipeTimings();
    const letterRate = timings[0].duration / WIPE_STROKES[0].axisLength;
    const innerRate = timings[2].duration / WIPE_STROKES[2].axisLength;
    const goldRate = timings[4].duration / WIPE_STROKES[4].axisLength;
    const baseRate = LOGO_DRAW_MS / WIPE_STROKES.reduce((sum, stroke) => sum + stroke.axisLength, 0);
    expect(Math.abs(letterRate - innerRate)).toBeLessThan(0.02);
    expect(Math.abs(letterRate - baseRate / LOGO_LETTER_SPEED)).toBeLessThan(0.02);
    expect(Math.abs(goldRate - baseRate)).toBeLessThan(0.02);

    const outerPhase = timings[1].delay + timings[1].duration - timings[0].delay;
    expect(outerPhase).toBeGreaterThanOrEqual(2300);
    expect(outerPhase).toBeLessThanOrEqual(2700);

    expect(timings[4].delay).toBe(Math.max(timings[1].delay + timings[1].duration, timings[3].delay + timings[3].duration));
    const last = timings[timings.length - 1];
    expect(last.delay + last.duration).toBeGreaterThanOrEqual(2900);
    expect(last.delay + last.duration).toBeLessThanOrEqual(3800);
  });

  it('renders exact-shape fills revealed by chained per-axis wipes with timing vars', () => {
    const { container } = render(<AnimatedLogoMark />);
    expect(container.querySelectorAll('mask')).toHaveLength(2);
    expect(container.querySelectorAll('path[fill="#050505"][mask]')).toHaveLength(2);

    const timings = logoWipeTimings();
    const rects = [...container.querySelectorAll('.logo-wipe-rect')];
    expect(rects).toHaveLength(4);
    rects.forEach((rect, index) => {
      expect(rect.closest('g[transform]')).toBeInTheDocument();
      expect(rect.getAttribute('style')).toContain(`--logo-wipe-delay: ${timings[index].delay}ms`);
      expect(rect.getAttribute('style')).toContain(`--logo-wipe-duration: ${timings[index].duration}ms`);
    });

    const gold = container.querySelector('rect.logo-gold-bar');
    expect(gold).toBeInTheDocument();
    expect(gold.getAttribute('style')).toContain(`--logo-wipe-delay: ${timings[4].delay}ms`);
    expect(gold.getAttribute('style')).toContain(`--logo-wipe-duration: ${timings[4].duration}ms`);
  });

  it('no longer uses the dash-brush and center scale animation', () => {
    const { container } = render(<AnimatedLogoMark />);
    expect(container.querySelector('.logo-outer-draw')).toBeNull();
    expect(container.querySelector('.logo-inner-draw')).toBeNull();
    expect(container.querySelector('.logo-gold-line')).toBeNull();
  });
});
