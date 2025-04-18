/** @module Шина событий */

/**
 * Шина событий
 * @typedef {object} EventBus
 * @property {(event: unknown, handler: Function) => void} subscribe Подписка на событие
 * @property {(event: unknown) => void} unsubscribe Отписка от события
 * @property {(event: unknown, ...args: unknown[]) => unknown} emit Выпуск события
 */

/**
 * Отображение событий в их обработчики
 * @type {Map<unknown, Function>}
 */
const subscribers = new Map();

/**
 * Подписка обработчика на выпуск события
 * @function subscribe
 * @param {unknown} event Событие
 * @param {Function} handler Обработчик
 * @returns {void}
 */
export const subscribe = (event, handler) => subscribers.set(event, handler);

/**
 * Отписка обработчика от выпуска события
 * @function unsubscribe
 * @param {unknown} event Событие
 * @returns {void}
 */
export const unsubscribe = (event) => subscribers.delete(event);

/**
 * Выпуск события (вызов обработчика события)
 * @function emit
 * @param {unknown} event Событие
 * @param {unknown[]} args Аргументы для обработчика
 * @returns {unknown} Результат вызова обработчика
 */
export const emit = (event, ...args) => subscribers.get(event)?.(...args);
