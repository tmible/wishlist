import { DEFAULT_USER } from './default-user.const.js';

/** @typedef {import('./domain.js').User} User */

/** @module Адаптер хранилища пользователя */

/** @typedef {(value: any) => void} Subscriber */
/** @typedef {() => void} Unsubscriber */

/**
 * Значение хранилица
 * @type {User}
 */
let value = DEFAULT_USER;

/**
 * Подписчики хранилища
 * @type {Map<Subscriber, Subscriber>}
 */
const subscriptions = new Map();

/**
 * [Svelte-совместимое хранилище]{@link https://svelte.dev/docs/svelte/stores#Store-contract}
 * пользователя
 * @type {object} Store
 * @property {(subscriber: Subscriber) => Unsubscriber} subscribe Подписка на значение хранилища
 * @property {() => User} get Получение значения хранилища
 * @property {(newValue: User) => void} set Установка значения хранилища
 */
export const user = {
  subscribe: (subscriber) => {
    subscriber(value);
    subscriptions.set(subscriber, subscriber);
    return () => subscriptions.delete(subscriber);
  },
  get: () => value,
  set: (newValue) => {
    value = newValue;
    for (const subscriber of subscriptions.values()) {
      subscriber(value);
    }
  },
};
