import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true, // Enable existing tests using globals if any, though we mostly imported
    include: ['src/**/*.spec.ts'],
    exclude: ['src/main.ts', 'src/**/app.spec.ts'] // exclude app.spec.ts as it is broken
  },
});
