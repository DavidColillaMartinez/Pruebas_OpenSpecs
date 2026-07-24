import { useTheme } from '../theme/ThemeContext';

export function ThemeToggle({ isInicio = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`theme-toggle min-h-[44px] min-w-[44px] rounded-full border p-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${isInicio ? 'border-white/50 text-white/80 hover:border-white/80 hover:text-white focus-visible:ring-offset-ink' : 'border-ink/15 text-graphite/70 hover:border-ink/30 hover:text-ink focus-visible:ring-offset-porcelain'}`}
    >
      <span className="relative block h-5 w-5" aria-hidden="true">
        <svg className={`theme-toggle-icon absolute inset-0 h-5 w-5 transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <svg className={`theme-toggle-icon absolute inset-0 h-5 w-5 transition-all duration-500 ${isDark ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.7 15.2A8.8 8.8 0 0 1 8.8 3.3 8.8 8.8 0 1 0 20.7 15.2Z" />
        </svg>
      </span>
    </button>
  );
}
