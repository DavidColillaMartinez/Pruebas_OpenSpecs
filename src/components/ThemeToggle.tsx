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

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const VARIANTS = {
  // Over photography (Inicio): translucent glass, same family as the hero CTA.
  floating: `border border-white/25 bg-white/15 text-white backdrop-blur-md shadow-lift hover:bg-white/25 ${FOCUS_RING}`,
  // Over surfaces (catalog, quotes, 404): solid token pill.
  solid: `border border-hairline/15 bg-surface-elevated/90 text-primary backdrop-blur-md hover:bg-elevated-hover ${FOCUS_RING}`,
} as const;

export type ThemeToggleVariant = keyof typeof VARIANTS;

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.2A8.5 8.5 0 1 1 11 3.3a7 7 0 0 0 9.5 10.9Z" />
    </svg>
  );
}

export function ThemeToggle({
  className = '',
  variant = 'solid',
}: {
  className?: string;
  variant?: ThemeToggleVariant;
}) {
  const { theme, toggleTheme } = useThemePreference();
  const handleClick = useCallback(() => toggleTheme(), [toggleTheme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ARIA_LABELS[theme]}
      aria-pressed={theme === 'dark'}
      title={TITLE_LABELS[theme]}
      className={`grid h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 place-items-center rounded-full transition-colors duration-200 ${VARIANTS[variant]} ${className}`}
    >
      <span aria-hidden="true" className="leading-none">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </span>
      <span className="sr-only">{TITLE_LABELS[theme]}</span>
    </button>
  );
}

export { nextTheme };
