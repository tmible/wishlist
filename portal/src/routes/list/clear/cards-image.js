import { subscribeToTheme } from '@tmible/wishlist-ui/theme/service';
import { readable } from 'svelte/store';

/** @typedef {import('svelte/store').Readable} Readable */

/**
 * Отображение акцента темы в изображение
 * @constant {Map<string, string>}
 */
const ACCENT_TO_IMAGE = new Map([
  [ 'blossom', '/188f61ec-d510-4aed-b132-3dfb7718b7e4.webp' ],
  [ 'elegant', '/signature.svg' ],
]);

/**
 * Изображение по умолчанию
 * @constant {string}
 */
const DEFAULT_VALUE = '';

/**
 * Хранилище изображения фона карточек в быстрой очистке
 * @type {Readable<string>}
 */
export const cardsImage = readable(
  DEFAULT_VALUE,
  (set) => subscribeToTheme(({ accent }) => set(ACCENT_TO_IMAGE.get(accent) ?? DEFAULT_VALUE)),
);
