/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--theme-ink) / <alpha-value>)',
        graphite: 'rgb(var(--theme-graphite) / <alpha-value>)',
        stonewash: 'rgb(var(--theme-stonewash) / <alpha-value>)',
        pearl: 'rgb(var(--theme-pearl) / <alpha-value>)',
        porcelain: 'rgb(var(--theme-porcelain) / <alpha-value>)',
        page: 'rgb(var(--theme-page) / <alpha-value>)',
        surface: 'rgb(var(--theme-surface) / <alpha-value>)',
        'surface-strong': 'rgb(var(--theme-surface-strong) / <alpha-value>)',
        action: 'rgb(var(--theme-action) / <alpha-value>)',
        'action-foreground': 'rgb(var(--theme-action-foreground) / <alpha-value>)',
        clay: '#c1aa67',
        mist: '#d9e4e2',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(35, 31, 27, 0.12)',
        lift: '0 18px 50px rgba(47, 45, 41, 0.16)',
        glass: '0 1px 0 rgba(255,255,255,0.7) inset, 0 30px 70px rgba(30,30,30,0.12)',
      },
      fontFamily: {
        display: ['Marcellus', 'Georgia', 'serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
