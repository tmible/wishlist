import { writable } from 'svelte/store';

/**
 * @template T
 * @typedef {import('svelte/store').Writable<T>} Writable
 */

/**
 * Svelte хранилище идентификатора и состояния аутентифицированности пользователя
 * @type {Writable<{ id: string | null; isAuthenticated: boolean | null }>}
 */
export const user = writable({ id: null, isAuthenticated: null });
