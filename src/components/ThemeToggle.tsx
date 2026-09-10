import { useCallback } from 'react';
import { nextTheme, type ThemeValue } from '../theme/preference';
import { useThemePreference } from '../theme/useThemePreference';

const ARIA_LABELS: Record<ThemeValue, string> = {
  light: 'Cambiar a tema oscuro',
  dark: 'Cambiar a tema claro',
};

const TITLE_LABELS: Record<ThemeValue, string> = {
  light: 'Tema claro activo. Cambiar a tema oscuro.',
  dark: 'Tema oscuro activo. Cambiar a tema claro.',
};

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemePreference();
  const handleClick = useCallback(() => toggleTheme(), [toggleTheme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ARIA_LABELS[theme]}
      aria-pressed={theme === 'dark'}
      title={TITLE_LABELS[theme]}
      className={`grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full border border-current/15 bg-surface-elevated/70 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-elevated-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${className}`}
    >
      <span aria-hidden="true" className="text-base leading-none">{theme === 'dark' ? '☀' : '☾'}</span>
      <span className="sr-only">{TITLE_LABELS[theme]}</span>
    </button>
  );
}

export { nextTheme };
