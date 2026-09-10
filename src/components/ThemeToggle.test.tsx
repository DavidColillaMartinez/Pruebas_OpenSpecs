import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY } from '../theme/preference';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  it('is a 44x44 target with an accessible name and visible pressed state', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Cambiar a tema oscuro' });
    expect(button.className).toContain('min-w-[44px]');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps Enter/Space as activation paths and restores focus visibility classes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Cambiar a tema oscuro' });
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter' });
    fireEvent.keyPress(button, { key: ' ' });
    fireEvent.click(button);
    expect(button.className).toContain('focus-visible:ring-2');
  });

  it('renders an SVG icon and switches it with the theme', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }).querySelector('svg')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }));
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' }).querySelector('svg')).toBeTruthy();
  });

  it('uses the translucent glass variant over photography and the solid token pill elsewhere', () => {
    const { rerender } = render(<ThemeToggle variant="floating" />);
    const floating = screen.getByRole('button', { name: 'Cambiar a tema oscuro' });
    expect(floating.className).toContain('bg-white/15');
    expect(floating.className).toContain('backdrop-blur-md');
    rerender(<ThemeToggle variant="solid" />);
    const solid = screen.getByRole('button', { name: 'Cambiar a tema oscuro' });
    expect(solid.className).toContain('bg-surface-elevated/90');
    expect(solid.className).not.toContain('bg-white/15');
  });
});
