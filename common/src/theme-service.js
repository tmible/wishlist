import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

/** @module Сервис управления темой */

/** @typedef {import('svelte/store').Writable} Writable */
/** @typedef {import('svelte/store').Unsubscriber} Unsubscriber */

/**
 * Хранилище активной темы
 * @constant {Writable<'light' | 'dark' | undefined>}
 */
const theme = writable(
  browser ?
    localStorage.getItem('theme') ?? (
      window.matchMedia('(prefers-color-scheme: dark)').matches ?
        'dark' :
        'light'
    ) :
    undefined,
);

/**
 * Определение тёмности активной темы
 * @function isDarkTheme
 * @returns {boolean} Признак тёмности темы
 */
export const isDarkTheme = () => get(theme) === 'dark';

/**
 * Обновление темы
 * @function updateTheme
 * @param {boolean} isDark Признак тёмности новой темы
 * @returns {void}
 */
export const updateTheme = (isDark) => {
  const themeName = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', themeName);
  document.documentElement.dataset.theme = themeName;
  theme.set(themeName);
};

/**
 * Подписка на обновление темы
 * @function subscribeToTheme
 * @param {(isDark: boolean) => void} handler Обработчик обновления темы
 * @returns {Unsubscriber} функция отписки
 */
export const subscribeToTheme = (handler) => theme.subscribe(
  (themeName) => handler(themeName === 'dark'),
);
