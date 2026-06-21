import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['../tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/dist/**'
      ],
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50
    },
    include: ['../tests/unit/**/*.test.js', '../tests/unit/**/*.spec.js'],
    exclude: ['../tests/e2e/**', 'node_modules/']
  }
});
