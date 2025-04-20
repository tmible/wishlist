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
 * Подписчики хранилища следующего градиента
 * @type {Map<(value: Gradient) => void, (value: Gradient) => void>}
 */
const nextGradientSubscriptions = new Map();

/**
 * Svelte совместимое хранилище следующего градиента
 * @type {Store<Gradient>}
 * @implements {import('svelte').Readable}
 */
export const nextStore = {
  subscribe: (subscriber) => {
    subscriber(nextGradient);
    nextGradientSubscriptions.set(subscriber, subscriber);
    return () => nextGradientSubscriptions.delete(subscriber, subscriber);
  },
  get: () => nextGradient,
  set: (gradient) => {
    nextGradient = gradient;
    for (const subscriber of nextGradientSubscriptions.values()) {
      subscriber(nextGradient);
    }
  },
  delete: () => {
    nextGradient = undefined;
    for (const subscriber of nextGradientSubscriptions.values()) {
      subscriber(nextGradient);
    }
  },
};
