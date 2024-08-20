/** @module Модуль внедрения зависимостей */

/** @typedef {import('./injection-token.js').InjectionToken} InjectionToken */

/**
 * Отображение токенов внедрения в предоставляемые значения
 * @type {Map<InjectionToken, unknown>}
 * @see {@link import('./injection-token.js')} InjectionToken
 */
const providers = new Map();

/**
 * Ассоциация значения с токеном внедрения
 * @function provide
 * @param {InjectionToken} token Токен внедрения
 * @param {unknown} value Предоставляемое значение
 * @see {@link import('./injection-token.js')} InjectionToken
 */
export const provide = (token, value) => {
  providers.set(token, value);
};

/**
 * Предоставление значения по токену внедрения
 * @function inject
 * @param {InjectionToken} token Токен внедрения
 * @returns {unknown} Предоставляемое значение, ассоциированное с токеном
 * @see {@link import('./injection-token.js')} InjectionToken
 */
export const inject = (token) => providers.get(token);
