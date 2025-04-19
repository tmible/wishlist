/** @module Сервис управления темой */

/**
 * @template T
 * @typedef {(value: T) => void} Subscriber
 */
/** @typedef {() => void} Unsubscriber */
/** @typedef {'light' | 'dark' | null} Theme */

/**
 * Значение хранилица
 * @type {Theme}
 */
let theme = null;

/**
 * Подписчики хранилища
 * @type {Map<Subscriber<Theme>, Subscriber<Theme>>}
 */
const subscriptions = new Map();

/**
 * Определение тёмности активной темы
 * @function isDarkTheme
 * @returns {boolean} Признак тёмности темы
 */
export const isDarkTheme = () => theme === 'dark';

/**
 * Подписка на обновление темы
 * @function subscribeToTheme
 * @param {(isDark: boolean) => void} subscriber Обработчик обновления темы
 * @returns {Unsubscriber} Функция отписки
 */
export const subscribeToTheme = (subscriber) => {
  subscriptions.set(subscriber, subscriber);
  return () => subscriptions.delete(subscriber);
};

/* eslint-disable no-secrets/no-secrets -- Просто длинное название */

/**
 * Обновление значения хранилища и оповещение подписчиков
 * @function updateValueAndNotifySubscribers
 * @param {Theme} newValue Новое значение
 * @returns {void}
 */
/* eslint-enable no-secrets/no-secrets */
const updateValueAndNotifySubscribers = (newValue) => {
  if (theme === newValue) {
    return;
  }
  theme = newValue;
  for (const subscriber of subscriptions.values()) {
    subscriber(theme === 'dark');
  }
};

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
  updateValueAndNotifySubscribers(themeName);
};

/**
 * Обновление темы в соответствии с контекстом.
 * Если тема в localStorage была установлена при том же значении темы устройства, она сохраняется.
 * Иначе устанавливается тема, соответствующая теме устройства
 * @function adjustTheme
 * @returns {void}
 */
const adjustTheme = () => {
  const fromLocalStorage = JSON.parse(localStorage.getItem('theme'));
  const fromWindow = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (fromLocalStorage?.windowPrefersDark === fromWindow && fromLocalStorage?.themeName) {
    updateValueAndNotifySubscribers(fromLocalStorage.themeName);
  } else {
    updateTheme(fromWindow);
  }
};

/**
 * [Обновление темы в соответствии с контекстом]{@link adjustTheme}
 * только при условии видимости документа
 * @function adjustTheme
 * @returns {void}
 */
const adjustThemeIfDocumentisVisible = () => {
  if (document.hidden) {
    return;
  }
  adjustTheme();
};

/**
 * [Обновление темы в соответствии с контекстом]{@link adjustTheme},
 * добавление прослушивателей событий фокуса и изменения видимости документа
 * @function initTheme
 * @returns {Unsubscriber} Функция удаления прослушивателей событий
 */
export const initTheme = () => {
  adjustTheme();
  window.addEventListener('focus', adjustTheme);
  document.addEventListener('visibilitychange', adjustThemeIfDocumentisVisible);
  return () => {
    theme = null;
    window.removeEventListener('focus', adjustTheme);
    document.removeEventListener('visibilitychange', adjustThemeIfDocumentisVisible);
  };
};
