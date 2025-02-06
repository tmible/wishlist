import { getRandomArbitrary } from '$lib/get-random-arbitrary';

/** @module Генератор градиентов */

/**
 * Градиент
 * @typedef {object} Gradient
 * @property {number} hue1 Тон первого цвета в градиенте
 * @property {number} hue2 Тон второго цвета в градиенте
 * @property {number} saturation Насыщенность цветов в градиенте
 * @property {number} lightness Светлота цветов в градиенте
 * @property {boolean} isDarkTheme Признак соответствия градиента тёмной теме
 * @property {string} style CSS стиль для применения градиента
 */

/**
 * Минимальный и максимальный тон цвета в градиенте
 * @type {[ number, number ]}
 */
const HUE_MIN_MAX = [ 0, 360 ];

/**
 * Минимальная и максимальная разница в тонах цветов в градиенте
 * @type {[ number, number ]}
 */
const HUE_DIFF_MIN_MAX = [ 30, 60 ];

/**
 * Минимальная и максимальная насыщенность цветов в градиенте
 * @type {[ number, number ]}
 */
const SATURATION_MIN_MAX = [ 50, 100 ];

/**
 * Минимальная и максимальная светлота цветов в градиенте для тёмной темы
 * @type {[ number, number ]}
 */
const LIGHTNESS_DARK_MIN_MAX = [ 10, 33 ];

/**
 * Минимальная и максимальная светлота цветов в градиенте для светлой темы
 * @type {[ number, number ]}
 */
const LIGHTNESS_LIGHT_MIN_MAX = [ 67, 90 ];

/**
 * Генерация CSS стиля для применения акивного градиента
 * @function constructStyle
 * @param {number} hue1 Тон первого цвета в градиенте
 * @param {number} hue2 Тон второго цвета в градиенте
 * @param {number} saturation Насыщенность цветов в градиенте
 * @param {number} lightness Светлота цветов в градиенте
 * @returns {string} Строка с CSS стилем активного градиента
 */
const constructStyle = (hue1, hue2, saturation, lightness) => {
  const color1 = `hsl(${hue1} ${saturation} ${lightness})`;
  const color2 = `hsl(${hue2} ${saturation} ${lightness})`;
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

/**
 * Генерация градиента, соответствующего теме
 * @function generateGradient
 * @param {boolean} isDark Признак необходимости генерации градиента для тёмной темы
 * @returns {Gradient} Сгенерированный градиент
 */
export const generateGradient = (isDark) => {
  const hue1 = getRandomArbitrary(...HUE_MIN_MAX);
  const hue2 = (
    // eslint-disable-next-line sonarjs/pseudo-random -- Просто генерация градиента
    hue1 + ([ -1, 1 ][Math.round(Math.random())] * getRandomArbitrary(...HUE_DIFF_MIN_MAX))
  ) % 360;
  const saturation = getRandomArbitrary(...SATURATION_MIN_MAX);
  const lightness = getRandomArbitrary(
    ...(isDark ? LIGHTNESS_DARK_MIN_MAX : LIGHTNESS_LIGHT_MIN_MAX),
  );

  return {
    hue1,
    hue2,
    saturation,
    lightness,
    isDarkTheme: isDark,
    style: constructStyle(hue1, hue2, saturation, lightness),
  };
};

/**
 * Затемнение или осветление градиента с генерацией нового при необходимости
 * @function adjustGradient
 * @param {Gradient} currentGradient Активный градиент
 * @param {boolean} isDark Признак необходимости затемнения градиента
 * @returns {Gradient} Адаптированный градиент
 */
export const adjustGradient = (currentGradient, isDark) => {
  const gradient = currentGradient ?? generateGradient(isDark);

  if (gradient.isDarkTheme !== isDark) {
    gradient.lightness = getRandomArbitrary(
      ...(isDark ? LIGHTNESS_DARK_MIN_MAX : LIGHTNESS_LIGHT_MIN_MAX),
    );
    gradient.isDarkTheme = isDark;
    gradient.style = constructStyle(
      gradient.hue1,
      gradient.hue2,
      gradient.saturation,
      gradient.lightness,
    );
  }

  return gradient;
};
