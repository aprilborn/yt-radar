import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],
    ignores: ['node_modules', 'dist', 'coverage', '*.min.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        projectService: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },

  eslintConfigPrettier,
];
