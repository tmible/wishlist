/** @typedef {import('./domain.js').Gradient} Gradient */

/** @module Сервис применения градиентов в CSS документа */

/**
 * Генерация стиля для применения градиента
 * @function constructStyle
 * @param {Gradient} gradient Градиент
 * @param {number} gradient.hue1 Тон первого цвета в градиенте
 * @param {number} gradient.hue2 Тон второго цвета в градиенте
 * @param {number} gradient.saturation Насыщенность цветов в градиенте
 * @param {number} gradient.lightness Светлота цветов в градиенте
 * @returns {string} Строка со стилем градиента
 */
export const constructStyle = ({ hue1, hue2, saturation, lightness }) => {
  const color1 = `hsl(${hue1} ${saturation} ${lightness})`;
  const color2 = `hsl(${hue2} ${saturation} ${lightness})`;
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

/**
 * Применение градиента к документу
 * @function applyGradient
 * @param {Gradient} gradient Градиент
 * @returns {void}
 */
export const applyGradient = (gradient) => {
  document.documentElement.style.setProperty('--gradient', constructStyle(gradient));
};

/**
 * Отключение градиента от документа
 * @function removeGradient
 * @returns {void}
 */
export const removeGradient = () => {
  document.documentElement.style.setProperty('--gradient', undefined);
};
