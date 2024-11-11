import { writable } from 'svelte/store';

/**
 * @template T
 * @typedef {import('svelte/store').Writable<T>} Writable
 */

/**
 * Svelte хранилище идентификатора, хэша и состояния аутентифицированности пользователя
 * @type {Writable<{ id: string | null; hash: string | null; isAuthenticated: boolean | null }>}
 */
export const user = writable({ id: null, hash: null, isAuthenticated: null });
