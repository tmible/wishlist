import { writable } from 'svelte/store';

/**
 * @template T
 * @typedef {import('svelte/store').Writable<T>} Writable
 */
/**
 * Категория элементов списка желаний пользователя
 * @typedef {object} Category
 * @property {number} id Идентификатор категории
 * @property {string} name Название категории
 */

/**
 * Svelte хранилище категорий элементов списка желаний пользователя
 * @type {Writable<Category[] | null>}
 */
export const categories = writable(null, (set, update) => {
  let timeout;

  update((value) => {
    if (value === null) {
      timeout = setTimeout(async () => set(await fetch(
        '/api/wishlist/categories',
      ).then(
        (response) => response.json(),
      )));
    }
    return value;
  });

  return () => timeout && clearTimeout(timeout);
});
