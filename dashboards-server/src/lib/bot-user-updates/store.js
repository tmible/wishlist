/** @typedef {import('./initialization.js').BotUserUpdatesDTO} BotUserUpdatesDTO */

/** @module Адаптер хранилища обновлений, полученных ботом */

/** @typedef {(value: any) => void} Subscription */

/**
 * Значение хранилица
 * @type {BotUserUpdatesDTO}
 */
const value = {
  page: [],
  total: 0,
  index: 0,
};

/**
 * Подписчики хранилища
 * @type {Map<Subscription, Subscription>}
 */
const subscriptions = new Map();

/**
 * [Svelte-совместимое хранилище]{@link https://svelte.dev/docs/svelte/stores#Store-contract}
 * обновлений, полученных ботом
 * @type {object}
 * @property {(subscription: Subscription) => () => void} subscribe Подписка на значение хранилища
 * @property {(BotUserUpdatesDTO) => void} set Установка значение хранилища
 */
export const botUserUpdates = {
  subscribe: (subsriber) => {
    subsriber(value);
    subscriptions.set(subsriber, subsriber);
    return () => subscriptions.delete(subsriber);
  },
  set: ({ page = [], total = 0, index = 0 }) => {
    value.page = page;
    value.total = total;
    value.index = index;
    for (const subsriber of subscriptions.values()) {
      subsriber(value);
    }
  },
};
