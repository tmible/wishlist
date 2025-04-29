import { initCategories } from '$lib/categories/use-cases/init-categories.js';

/** @typedef {import('./domain.js').Category} Category */

/** @module Адаптер хранилища категорий */

/** @typedef {(value: any) => void} Subscriber */
/** @typedef {() => void} Unsubscriber */

/**
 * Значение хранилица
 * @type {Category[]}
 */
let value = [];

/**
 * Подписчики хранилища
 * @type {Map<Subscriber, Subscriber>}
 */
const subscriptions = new Map();

/**
 * [Svelte-совместимое хранилище]{@link https://svelte.dev/docs/svelte/stores#Store-contract}
 * категорий
 * @type {object} Store
 * @property {(subscriber: Subscriber) => Unsubscriber} subscribe Подписка на значение хранилища
 * @property {() => Category[]} get Получение значения хранилища
 * @property {(newValue: Category[]) => void} set Установка значения хранилища
 * @property {(category: Category) => void} add Добавление категории в хранилище
 * @property {(category: Category) => void} update Обновление категории в хранилище
 * @property {(category: Category) => void} delete Удаление категории из хранилища
 */
export const categories = {
  subscribe: (subscriber) => {
    subscriber(value);
    subscriptions.set(subscriber, subscriber);

    if (subscriptions.size === 1) {
      initCategories();
    }

    return () => subscriptions.delete(subscriber);
  },

  get: () => value,

  set: (newValue) => {
    value = newValue;
    for (const subscriber of subscriptions.values()) {
      subscriber(value);
    }
  },

  add: (category) => {
    value.push(category);
    for (const subscriber of subscriptions.values()) {
      subscriber(value);
    }
  },

  update: (category) => {
    const categoryIndex = value.findIndex(({ id }) => id === category.id);
    if (categoryIndex === -1) {
      return;
    }
    value[categoryIndex] = category;
    for (const subscriber of subscriptions.values()) {
      subscriber(value);
    }
  },

  delete: (category) => {
    const categoryIndex = value.findIndex(({ id }) => id === category.id);
    if (categoryIndex === -1) {
      return;
    }
    value.splice(categoryIndex, 1);
    for (const subscriber of subscriptions.values()) {
      subscriber(value);
    }
  },
};
