import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  plugins: [ sveltekit() ],
  resolve: {
    conditions: mode === 'test' ? [ 'browser' ] : [],
  },
  test: {
    include: [ 'src/**/*.{test,spec}.{js,ts}' ],
    coverage: {
      include: [ 'src' ],
      exclude: [
        ...configDefaults.coverage.exclude,
        'src/**/*.const.{js,ts}',
      ],
    },
  },
}));
