/** @module Шина событий */

/**
 * Отображение событий в их обработчики
 * @type {Map<Event, Function>}
 * @see {@link Events}
 */
const subscribers = new Map();

/**
 * Подписка обработчика на выпуск события
 * @function subscribe
 * @param {Event} event событие
 * @param {Function} handler обработчик
 * @see {@link Events}
 */
export const subscribe = (event, handler) => {
  subscribers.set(event, handler);
};

/**
 * Выпуск события (вызов обработчика события)
 * @function emit
 * @param {Event} event событие
 * @param {unknown[]} args аргументы для обработчика
 * @returns {unknown} результат вызова обработчика
 * @see {@link Events}
 */
export const emit = (event, ...args) => {
  return subscribers.get(event)?.(...args);
};
