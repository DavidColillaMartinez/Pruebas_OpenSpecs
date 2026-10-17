import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { applyTheme, nextTheme, persistTheme, readStoredTheme, THEME_STORAGE_KEY, type ThemeValue } from './preference';

const THEME_CHANGE_EVENT = 'lrmq:theme-change';

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY || (event.newValue !== 'light' && event.newValue !== 'dark')) return;
    applyTheme(event.newValue);
    onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function currentTheme(): ThemeValue {
  const applied = document.documentElement.getAttribute('data-theme');
  return applied === 'light' || applied === 'dark' ? applied : readStoredTheme();
}

const serverTheme = (): ThemeValue => 'light';

export function useThemePreference() {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme);
  useEffect(() => {
    if (document.documentElement.getAttribute('data-theme') === null) applyTheme(readStoredTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    const next = nextTheme(currentTheme());
    applyTheme(next);
    persistTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return { theme, toggleTheme };
}
