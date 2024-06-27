import { writable } from 'svelte/store';

/** @typedef {import('svelte/store').Writable} Writable */

/**
 * Svelte хранилище признака аутентифицированности пользователя
 * @type {Writable<boolean | null>}
 */
export const isAuthenticated = writable(null);
