import numericEnum from '@tmible/wishlist-common/numeric-enum';
import { getRandomArbitrary } from '$lib/get-random-arbitrary.js';

/** @module Домен градиента */

/**
 * Градиент
 * @typedef {object} Gradient
 * @property {number} hue1 Тон первого цвета в градиенте
 * @property {number} hue2 Тон второго цвета в градиенте
 * @property {number} saturation Насыщенность цветов в градиенте
 * @property {number} lightness Светлота цветов в градиенте
 * @property {GradientVariant} variant Вариант градиента
 */

/**
 * Минимальный и максимальный тон цвета в градиенте
 * @constant {[ number, number ]}
 */
const HUE_MIN_MAX = [ 0, 360 ];

/**
 * Минимальная и максимальная разница в тонах цветов в градиенте
 * @constant {[ number, number ]}
 */
const HUE_DIFF_MIN_MAX = [ 30, 60 ];

/**
 * Минимальная и максимальная насыщенность цветов в градиенте
 * @constant {[ number, number ]}
 */
const SATURATION_MIN_MAX = [ 50, 100 ];

/**
 * Минимальная и максимальная светлота цветов в градиенте в тёмном варианте
 * @constant {[ number, number ]}
 */
const LIGHTNESS_DARK_MIN_MAX = [ 10, 33 ];

/**
 * Минимальная и максимальная светлота цветов в градиенте в светлом варианте
 * @constant {[ number, number ]}
 */
const LIGHTNESS_LIGHT_MIN_MAX = [ 67, 90 ];

/**
 * Перечисление вариантов градиента
 * @enum {number}
 */
export const GradientVariant = numericEnum([ 'LIGHT', 'DARK' ]);

/**
 * Генерация градиента
 * @function generateGradient
 * @param {GradientVariant} variant Вариант градиента
 * @returns {Gradient} Сгенерированный градиент
 */
export const generateGradient = (variant = GradientVariant.LIGHT) => {
  const hue1 = getRandomArbitrary(...HUE_MIN_MAX);
  const hue2 = (
    // eslint-disable-next-line sonarjs/pseudo-random -- Просто генерация градиента
    hue1 + ([ -1, 1 ][Math.round(Math.random())] * getRandomArbitrary(...HUE_DIFF_MIN_MAX))
  ) % 360;
  const saturation = getRandomArbitrary(...SATURATION_MIN_MAX);
  const lightness = getRandomArbitrary(
    ...(variant === GradientVariant.LIGHT ? LIGHTNESS_LIGHT_MIN_MAX : LIGHTNESS_DARK_MIN_MAX),
  );

  return { hue1, hue2, saturation, lightness, variant };
};

/**
 * Приведение градиента к нужному варианту или генерация нового при невозможности
 * @function changeGradientVariant
 * @param {Gradient} currentGradient Активный градиент
 * @param {GradientVariant} variant Целевой вариант градиента
 * @returns {Gradient} Адаптированный градиент
 */
export const changeGradientVariant = (currentGradient, variant) => {
  const gradient = currentGradient ?? generateGradient(variant);

  if (gradient.variant !== variant) {
    gradient.lightness = getRandomArbitrary(
      ...(variant === GradientVariant.LIGHT ? LIGHTNESS_LIGHT_MIN_MAX : LIGHTNESS_DARK_MIN_MAX),
    );
    gradient.variant = variant;
  }

  return gradient;
};
