import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  plugins: [ sveltekit() ],
  resolve: {
    conditions: mode === 'test' ? [ 'browser' ] : [],
  },
  test: {
    include: [ 'src/**/*.{test,spec}(.svelte)?.{js,ts}' ],
    coverage: {
      include: [ 'src' ],
      exclude: [
        ...configDefaults.coverage.exclude,
        'src/**/*.const.{js,ts}',
        'src/**/index.{js,ts}',
        'src/lib/card-swiper/**',
        'src/lib/components/text-editor/mark-input-rule.js',
        'src/lib/components/text-editor/mark-paste-rule.js',
      ],
    },
  },
}));
