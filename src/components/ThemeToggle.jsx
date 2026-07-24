import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export function ThemeToggle({ isInicio = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`theme-toggle grid min-h-[44px] min-w-[44px] place-items-center rounded-full border p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${isInicio ? 'border-white/50 text-white/80 hover:border-white/80 hover:text-white focus-visible:ring-offset-ink' : 'border-ink/15 text-graphite/70 hover:border-ink/30 hover:text-ink focus-visible:ring-offset-porcelain'}`}
    >
      <Icon key={theme} className="theme-toggle-icon h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
