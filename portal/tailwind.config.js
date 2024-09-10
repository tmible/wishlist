import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';
import { dark, light } from 'daisyui/src/theming/themes';
import openColor from 'open-color/open-color.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [ openColor ],
  darkMode: [ 'selector', '[data-theme="dark"]' ],
  content: [ './src/**/*.{html,js,svelte,ts}' ],
  theme: {
    extend: {
      fontFamily: {
        'soyuz-grotesk': '"Soyuz Grotesk"',
        involve: '"Involve"',
      },
      typography: {
        DEFAULT: {
          css: {
            blockquote: {
              p: {
                '&::before': {
                  content: 'none',
                },
                '&::after': {
                  content: 'none',
                },
              },
            },
          },
        },
      },
    },
  },
  plugins: [ typography, daisyui ],
  daisyui: {
    themes: [{
      light: {
        ...light,
        primary: '#ff7514',
        secondary: '#92d2ff',
      },
      dark: {
        ...dark,
        primary: '#ff7514',
        secondary: '#92d2ff',
      },
    }],
    styled: true,
  },
};
