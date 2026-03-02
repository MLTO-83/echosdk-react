import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', '@echosdk/react', '@shopify/hydrogen'],
  },
  {
    entry: { nextjs: 'src/nextjs.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', '@echosdk/react', '@shopify/hydrogen'],
  },
]);
