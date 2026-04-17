import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

// Shared rules for all JS/TS files
const sharedRules = {
  eqeqeq: 'error',
  'no-var': 'error',
  'no-duplicate-imports': 'error',
  curly: ['error', 'multi-line'],
  'prefer-const': 'warn',
  'no-console': 'warn',
};

export default [
  js.configs.recommended,
  { ignores: ['dist/', '!.storybook'] },

  // ── App (browser) ──────────────────────────────────────────────────
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}', 'scripts/**/*.ts'],
  })),
  {
    files: ['src/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...sharedRules,

      // React
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/self-closing-comp': 'warn',
      'react/jsx-boolean-value': ['warn', 'never'],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TypeScript
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-shadow': 'off',
      'no-unused-vars': 'off',
    },
  },

  // ── D3 (RadialChart) ──────────────────────────────────────────────
  // D3's transition types don't compose across selections — `as any` casts are
  // the standard approach in D3 + TypeScript projects (no typed alternative exists)
  {
    files: ['**/RadialChart.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'react-hooks/unsupported-syntax': 'off',
    },
  },

  // ── Scripts (Node.js) ─────────────────────────────────────────────
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...sharedRules,
      'no-console': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
    },
  },

  // ── E2E tests (Node.js + Playwright) ──────────────────────────────
  // Both node (process, __dirname) and browser (document in page.evaluate) globals
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      ...sharedRules,
      ...playwright.configs['flat/recommended'].rules,
    },
  },

  // ── Storybook ─────────────────────────────────────────────────────
  ...storybook.configs['flat/recommended'],

  // Must be last to override formatting rules
  prettier,
];
