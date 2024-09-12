import { get, writable } from 'svelte/store';

/** @module Сервис управления темой */

/** @typedef {import('svelte/store').Writable} Writable */
/** @typedef {import('svelte/store').Unsubscriber} Unsubscriber */

/**
 * Хранилище активной темы
 * @constant {Writable<'light' | 'dark' | null>}
 */
const theme = writable(null);

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
  localStorage.setItem(
    'theme',
    JSON.stringify({
      windowPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      themeName,
    }),
  );
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

/**
 * Инициализация Svelte хранилища темы
 * Если тема в localStorage была установлена при томже значении темы устройства, она сохраняется.
 * Иначе устанавливается тема, соответствующая теме устройства
 * @function initTheme
 * @returns {void}
 */
export const initTheme = () => {
  const fromLocalStorage = JSON.parse(localStorage.getItem('theme'));
  const fromWindow = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (fromLocalStorage?.windowPrefersDark === fromWindow && fromLocalStorage?.themeName) {
    theme.set(fromLocalStorage.themeName);
  } else {
    updateTheme(fromWindow);
  }
};
