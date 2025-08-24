import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  plugins: [ sveltekit() ],
  resolve: {
    conditions: mode === 'test' ? ['browser'] : [],
  },
  test: {
    include: [ 'src/**/*.{test,spec}.{js,ts}' ],
    exclude: [
      ...configDefaults.exclude,
      'src/theme/__tests__/accent-picker.test.js',
    ],
    coverage: {
      include: [ 'src' ],
    },
  },
}));
