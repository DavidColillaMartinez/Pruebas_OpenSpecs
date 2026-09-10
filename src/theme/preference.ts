export type ThemeValue = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'lrmq:theme:v1';

function parse(value: unknown): ThemeValue | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'> = window.localStorage): ThemeValue {
  try {
    return parse(storage.getItem(THEME_STORAGE_KEY)) ?? 'light';
  } catch {
    return 'light';
  }
}

export function persistTheme(theme: ThemeValue, storage: Pick<Storage, 'setItem'> = window.localStorage): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The in-memory theme still applies even if persistence is unavailable.
  }
}

export function applyTheme(theme: ThemeValue, root: HTMLElement = document.documentElement): void {
  root.setAttribute('data-theme', theme);
}

export function nextTheme(theme: ThemeValue): ThemeValue {
  return theme === 'dark' ? 'light' : 'dark';
}
