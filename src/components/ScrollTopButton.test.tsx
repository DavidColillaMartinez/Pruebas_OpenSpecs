import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScrollTopButton, scrollWindowToTop, useScrollTopVisibility } from './ScrollTopButton';

function Probe() {
  const show = useScrollTopVisibility(true);
  return <ScrollTopButton show={show} onClick={scrollWindowToTop} />;
}

describe('ScrollTopButton', () => {
  it('stays hidden and out of the tab order until the threshold is passed', () => {
    render(<ScrollTopButton show={false} onClick={scrollWindowToTop} />);

    const button = screen.getByRole('button', { name: 'Volver arriba' });
    expect(button.className).toContain('opacity-0');
    expect(button).toHaveAttribute('tabindex', '-1');
  });

  it('appears after the scroll threshold and returns the window to the top', () => {
    const scrollTo = vi.fn();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo);

    try {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 700 });
      render(<Probe />);
      let button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button.className).not.toContain('opacity-0');

      Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
      fireEvent.scroll(window);
      button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button.className).toContain('opacity-0');
      expect(button).toHaveAttribute('tabindex', '-1');

      Object.defineProperty(window, 'scrollY', { configurable: true, value: 700 });
      fireEvent.scroll(window);
      button = screen.getByRole('button', { name: 'Volver arriba' });
      fireEvent.click(button);

      expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    } finally {
      scrollToSpy.mockRestore();
      delete (window as unknown as Record<string, unknown>).scrollY;
    }
  });
});
