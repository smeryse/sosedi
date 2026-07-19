import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config for `/mobile`.
 *
 * Scope: only code under `src/lib/**` is exercised here.
 *  - Pure data / domain logic → `node` env (fast, stable).
 *  - Anything that touches the React Native renderer would need
 *    `jsdom`; for now we keep it `node` because the compatibility
 *    module is side-effect free.
 *
 * Excludes:
 *  - `/mobile/node_modules`
 *  - Tests outside the new `src/lib/` tree (legacy mobile code is not
 *    brought under Vitest by this commit — that's a separate effort).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/lib/**/*.test.ts', 'src/lib/**/*.test.tsx'],
    exclude: ['node_modules/**', 'src/**/__tests__/**/*-legacy.*'],
    globals: false,
    reporters: ['default'],
    coverage: {
      enabled: false,
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts', 'src/lib/**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
