/** @module Сервис управления цветовой темой */

/**
 * @template T
 * @typedef {(value: T) => void} Subscriber
 */
/** @typedef {() => void} Unsubscriber */
/** @typedef {{ accent?: string; mode: 'light' | 'dark' } | null} Theme */
/** @typedef {{ isDark: boolean; accent: string | undefined }} ThemeSubscription */

/**
 * Преобразование темы к строке
 * @function themeToString
 * @param {Theme} theme Тема
 * @returns {string} Тема в виде строки
 */
const themeToString = (theme) => [ ...(theme.accent ? [theme.accent] : []), theme.mode ].join('-');

/**
 * Получение темы из строки
 * @function parseTheme
 * @param {string} themeName Тема в виде строки
 * @returns {Theme} Тема
 */
const parseTheme = (themeName) => {
  const themeBits = themeName.split('-');
  const accent = themeBits.length > 1 ? themeBits[0] : undefined;
  const mode = themeBits.length > 1 ? themeBits[1] : themeBits[0];
  return { accent, mode };
};

/**
 * Значение хранилица
 * @type {Theme}
 */
let theme = null;

/**
 * Подписчики хранилища
 * @type {Map<Subscriber<ThemeSubscription>, Subscriber<ThemeSubscription>>}
 */
const subscriptions = new Map();

/**
 * Определение тёмности активной темы
 * @function isDarkTheme
 * @returns {boolean} Признак тёмности темы
 */
export const isDarkTheme = () => theme?.mode === 'dark';

/**
 * Подписка на обновление темы
 * @function subscribeToTheme
 * @param {Subscriber<ThemeSubscription>} subscriber Обработчик обновления темы
 * @returns {Unsubscriber} Функция отписки
 */
export const subscribeToTheme = (subscriber) => {
  subscriber({ isDark: isDarkTheme(), accent: theme?.accent });
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
  if (theme !== null && theme.accent === newValue.accent && theme.mode === newValue.mode) {
    return;
  }
  theme = newValue;
  for (const subscriber of subscriptions.values()) {
    subscriber({ isDark: isDarkTheme(), accent: theme?.accent });
  }
};

/**
 * Обновление темы
 * @function updateTheme
 * @param {{accent?: string; isDark?: boolean}} params Настройки новой темы
 * @param {string} params.accent Цветовой акцент новой темы
 * @param {boolean} params.isDark Признак тёмности новой темы
 * @returns {void}
 */
export const updateTheme = ({ accent, isDark }) => {
  const newTheme = Object.assign({}, theme);
  if (isDark !== undefined) {
    newTheme.mode = isDark ? 'dark' : 'light';
  }
  newTheme.accent = accent ?? theme?.accent;

  if (!newTheme.mode) {
    return;
  }

  const themeName = themeToString(newTheme);

  localStorage.setItem(
    'theme',
    JSON.stringify({
      windowPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      themeName,
    }),
  );
  document.documentElement.dataset.theme = themeName;

  updateValueAndNotifySubscribers(newTheme);
};

/**
 * Обновление темы в соответствии с контекстом.
 * Если режим темы в localStorage совпадает с режимом темы устройства, она сохраняется.
 * Иначе устанавливается тема, с таким же акцентом, но соответствующим теме устройства режимом
 * @function adjustTheme
 * @returns {void}
 */
const adjustTheme = () => {
  const fromLocalStorage = JSON.parse(localStorage.getItem('theme'));
  const fromWindow = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (fromLocalStorage?.windowPrefersDark === fromWindow && fromLocalStorage?.themeName) {
    updateValueAndNotifySubscribers(parseTheme(fromLocalStorage.themeName));
  } else {
    const accent = fromLocalStorage?.themeName ?
      parseTheme(fromLocalStorage.themeName).accent :
      undefined;
    updateTheme({ isDark: fromWindow, accent });
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
