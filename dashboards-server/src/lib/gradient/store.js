/** @typedef {import('./domain.js').Gradient} Gradient */

/** @module Адаптер хранилища градиентов */

/**
 * Хранилище градиента
 * @template T
 * @typedef {object} Store
 * @property {() => T} get Получение градиента
 * @property {(gradient: T) => void} set Сохранение градиента
 * @property {() => void} delete Удаление градиента
 */

/**
 * Хранилище основного градиента
 * @type {Store<Gradient>}
 */
export const store = {
  get: () => JSON.parse(localStorage.getItem('gradient')),
  set: (gradient) => localStorage.setItem('gradient', JSON.stringify(gradient)),
  delete: () => localStorage.removeItem('gradient'),
};

/**
 * Следующий градиент
 * @type {Gradient}
 */
let nextGradient;

/**
 * Хранилище следующего градиента
 * @type {Store<Gradient>}
 */
export const nextStore = {
  get: () => nextGradient,
  set: (gradient) => nextGradient = gradient,
  delete: () => nextGradient = undefined,
};
