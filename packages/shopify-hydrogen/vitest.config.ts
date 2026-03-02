import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve @echosdk/react from source during tests (dist may not be built yet).
      // The entire module is mocked in tests anyway, so this just satisfies Vite's resolver.
      '@echosdk/react': resolve(__dirname, '../react/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '*.config.ts',
        // Pure re-export barrels — all individual modules are tested directly
        'src/index.ts',
        'src/nextjs.ts',
        // Type-only file — no runtime statements to cover
        'src/types.ts',
      ],
      thresholds: {
        lines: 98,
        functions: 100,
        branches: 95,
        statements: 98,
      },
    },
  },
});
