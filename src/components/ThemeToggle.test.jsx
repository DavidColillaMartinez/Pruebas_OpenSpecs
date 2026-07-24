import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

afterEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('ThemeToggle', () => {
  it('switches between light and dark themes with accessible labels', () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);

    const toggle = screen.getByRole('button', { name: 'Cambiar a modo oscuro' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('area-lrmq-theme')).toBe('dark');
  });
});
