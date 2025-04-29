/** @typedef {import('./domain.js').OwnWishlistItem} OwnWishlistItem */
/** @typedef {import('./use-cases/reorder-list.js').ReorderPatch} ReorderPatch */

/** @module Адаптер хранилища списка желаний */

/** @typedef {(value: any) => void} Subscriber */
/** @typedef {() => void} Unsubscriber */

/**
 * Значение хранилица
 * @type {OwnWishlistItem[] | null}
 */
let value = null;

/**
 * Подписчики хранилища
 * @type {Map<Subscriber, Subscriber>}
 */
const subscriptions = new Map();

/**
 * Уведомление подписчиков об изменении значения хранилища
 * @function notifySubscribers
 * @returns {void}
 */
const notifySubscribers = () => {
  for (const subscriber of subscriptions.values()) {
    subscriber(value);
  }
};

/**
 * [Svelte-совместимое хранилище]{@link https://svelte.dev/docs/svelte/stores#Store-contract}
 * списка желаний
 * @type {object} Store
 * @property {(subscriber: Subscriber) => Unsubscriber} subscribe Подписка на значение хранилища
 * @property {() => OwnWishlistItem[]} get Получение значения хранилища
 * @property {(newValue: OwnWishlistItem[]) => void} set Установка значения хранилища
 * @property {(item: OwnWishlistItem) => void} add Добавление элемента списка в хранилище
 * @property {(item: OwnWishlistItem) => void} update Обновление элемента списка в хранилище
 * @property {(itemIds: OwnWishlistItem['id'][]) => void} delete
 *   Удаление элементов списка из хранилища
 * @property {(patch: ReorderPatch) => void} reorder Переупорядочивание списка в хранилище
 */
export const wishlist = {
  subscribe: (subscriber) => {
    subscriber(value);
    subscriptions.set(subscriber, subscriber);
    return () => subscriptions.delete(subscriber);
  },

  get: () => value,

  set: (newValue) => {
    value = newValue;
    notifySubscribers();
  },

  add: (item) => {
    if (!value) {
      value = [];
    }
    value.push(item);
    notifySubscribers();
  },

  update: (item) => {
    const itemIndex = value?.findIndex(({ id }) => id === item.id);
    if (itemIndex === -1) {
      return;
    }
    value[itemIndex] = item;
    notifySubscribers();
  },

  delete: (itemIds) => {
    let isAnyDeleted = false;

    for (const id of itemIds) {
      const itemIndex = value?.findIndex((item) => id === item.id);
      if (itemIndex === -1) {
        continue;
      }
      value.splice(itemIndex, 1);
      isAnyDeleted = true;
    }

    if (!isAnyDeleted) {
      return;
    }

    notifySubscribers();
  },

  reorder: (patch) => {
    if (!value) {
      return;
    }
    for (const item of value) {
      const reorder = patch.find(({ id }) => id === item.id);
      item.order = reorder?.order ?? item.order;
    }
    value.sort((a, b) => a.order - b.order);
    notifySubscribers();
  },
};
