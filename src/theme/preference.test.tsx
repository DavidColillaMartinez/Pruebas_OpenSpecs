import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, persistTheme, readStoredTheme, THEME_STORAGE_KEY } from './preference';
import { useThemePreference } from './useThemePreference';

function ThemeProbe() {
  const { theme, toggleTheme } = useThemePreference();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
    </button>
  );
}

describe('theme preference', () => {
  beforeEach(() => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light without a stored preference', () => {
    expect(readStoredTheme()).toBe('light');
  });

  it('accepts only valid stored values', () => {
    persistTheme('dark');
    expect(readStoredTheme()).toBe('dark');
    const original = window.localStorage;
    Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'auto', setItem: original.setItem.bind(original) }, configurable: true });
    try {
      expect(readStoredTheme()).toBe('light');
    } finally {
      Object.defineProperty(window, 'localStorage', { value: original, configurable: true });
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    }
  });

  it('falls back to light when storage is blocked and saving failures do not throw', () => {
    const original = window.localStorage;
    Object.defineProperty(window, 'localStorage', { value: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }, configurable: true });
    try {
      expect(readStoredTheme()).toBe('light');
      expect(() => persistTheme('dark')).not.toThrow();
    } finally {
      Object.defineProperty(window, 'localStorage', { value: original, configurable: true });
    }
  });

  it('sets the root attribute for an explicit theme', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles the theme, applies the attribute first and persists', () => {
    render(<ThemeProbe />);
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema claro' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('never resolves a sync from another tab with an invalid value', () => {
    window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'auto' }));
    expect(document.documentElement.getAttribute('data-theme')).not.toBe('auto');
  });
});
