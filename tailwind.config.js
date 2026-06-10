/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#151515',
        stonewash: '#f4f1ec',
        pearl: '#f7f3eb',
        porcelain: '#fbfaf7',
        clay: '#b98364',
        graphite: '#2e3134',
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
