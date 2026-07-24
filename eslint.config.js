import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/**', 'assets/**', 'openspec/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/features/**/*.{js,jsx,ts,tsx}', 'src/routes/**/*.{js,jsx,ts,tsx}', 'api/**/*.js', 'vite.config.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/routes/**/*.{ts,tsx}'],
    rules: { 'no-unused-vars': 'off' },
  },
];
