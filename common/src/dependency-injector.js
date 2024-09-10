/** @module Модуль внедрения зависимостей */

/** @typedef {string} InjectionToken */

/**
 * Отображение токенов внедрения в предоставляемые значения
 * @type {Map<InjectionToken, unknown>}
 */
const providers = new Map();

/**
 * Ассоциация значения с токеном внедрения
 * @function provide
 * @param {InjectionToken} token Токен внедрения
 * @param {unknown} value Предоставляемое значение
 */
export const provide = (token, value) => {
  providers.set(token, value);
};

/**
 * Предоставление значения по токену внедрения
 * @function inject
 * @param {InjectionToken} token Токен внедрения
 * @returns {unknown} Предоставляемое значение, ассоциированное с токеном
 */
export const inject = (token) => providers.get(token);
