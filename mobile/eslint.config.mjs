/**
 * Mobile-side ESLint flat config (ESLint 9+).
 *
 * Scoped to the new `src/lib/**` tree only:
 *   - Already type-passed under strict mode via `npm run typecheck:lib`.
 *   - Legacy screens/components are out of scope: they live in
 *     `src/screens/**`, `src/components/**`, `src/types/**`, `App.tsx`.
 *
 * Why so narrow? Two reasons:
 *   1. The legacy mobile codebase uses UTF-8 Cyrillic + custom React Native
 *      patterns and we should NOT re-style them without proven need.
 *   2. The mobile parser setup is minimal — we deliberately avoid pulling
 *      in `@typescript-eslint/eslint-plugin` to keep install size small.
 */
export default [
  {
    ignores: [
      'node_modules/**',
      'expo-env.d.ts',
      '.expo/**',
      'ios/**',
      'android/**',
      'coverage/**',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
  },
  {
    files: ['src/lib/**/*.ts', 'src/lib/**/*.tsx'],
    ignores: ['src/lib/**/*.test.ts', 'src/lib/**/*.test.tsx'],
    languageOptions: {
      parser: undefined,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
    },
  },
];
