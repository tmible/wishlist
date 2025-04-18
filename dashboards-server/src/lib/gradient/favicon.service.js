import { FAVICON } from './favicon.const.js';

/** @typedef {import('./domain.js').Gradient} Gradient */

/** @module Сервис применения градиентов к favicon документа */

/**
 * Применение градиента к favicon
 * @function applyGradient
 * @param {Gradient} gradient Градиент
 * @returns {void}
 */
export const applyGradient = (gradient) => {
  const faviconColor = `hsl(${(gradient.hue1 + gradient.hue2) / 2}, ${gradient.saturation}%, 77%)`;
  const favicon = FAVICON.replace(/stroke=".*"/, `stroke="${faviconColor}"`);
  document.querySelector('link[rel~=\'icon\']').href = `data:image/svg+xml,${favicon}`;
};

/**
 * Отключение градиента от favicon (восстановление значения по умолчанию)
 * @function removeGradient
 * @returns {void}
 */
export const removeGradient = () => {
  const favicon = FAVICON.replace(/stroke=".*"/, 'stroke="black"');
  document.querySelector('link[rel~=\'icon\']').href = `data:image/svg+xml,${favicon}`;
};
