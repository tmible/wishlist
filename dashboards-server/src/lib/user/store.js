/** @module Адаптер хранилища пользователя */

/** @typedef {(value: any) => void} Subscription */
/** @typedef {{ isAuthenticated: boolean | null }} User */

/**
 * Значение хранилица
 * @type {User}
 */
let value = { isAuthenticated: null };

/**
 * Подписчики хранилища
 * @type {Map<Subscription, Subscription>}
 */
const subscriptions = new Map();

/**
 * [Svelte-совместимое хранилище]{@link https://svelte.dev/docs/svelte/stores#Store-contract}
 * пользователя
 * @type {object} Store
 * @property {(subscription: Subscription) => () => void} subscribe Подписка на значение хранилища
 * @property {(patchValue: Partial<User>) => void} patch Обновление значения хранилища
 */
export const user = {
  subscribe: (subscription) => {
    subscription(value);
    subscriptions.set(subscription, subscription);
    return () => subscriptions.delete(subscription);
  },
  patch: (patchValue) => {
    value = { ...value, ...patchValue };
    for (const subscription of subscriptions.values()) {
      subscription(value);
    }
  },
};
