import { useCallback, useEffect, useState } from 'react';
import { applyTheme, nextTheme, persistTheme, readStoredTheme, THEME_STORAGE_KEY, type ThemeValue } from './preference';

function parseValidTheme(value: string | null): ThemeValue | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function useThemePreference() {
  const [theme, setTheme] = useState<ThemeValue>(() => readStoredTheme());

  useEffect(() => {
    if (document.documentElement.getAttribute('data-theme') === null) {
      applyTheme(theme);
    } else {
      const coherent = readStoredTheme();
      if (coherent !== theme) setTheme(coherent);
    }
    // Keep the JS decision aligned with the same-origin bootstrap script.
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = parseValidTheme(event.newValue);
      if (!next) return;
      setTheme(next);
      applyTheme(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = nextTheme(current);
      applyTheme(next); // attribute updates first: visible even if storage throws
      persistTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
