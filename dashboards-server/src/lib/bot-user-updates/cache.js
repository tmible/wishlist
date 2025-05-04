/** @typedef {import('./initialization.js').BotUserUpdatesDTO} BotUserUpdatesDTO */

/** @module Адаптер кэша обновлений, полученных ботом */

/**
 * Хранилище закэшированных значений
 * @type {Map<string, Map<number, BotUserUpdatesDTO>>}
 */
const storage = new Map();

/**
 * Кэш обновлений
 * @type {object}
 * @property {(string, number) => BotUserUpdatesDTO} get Получение значения
 * @property {(string, number, BotUserUpdatesDTO) => void} set Сохранение значения
 */
export const cache = {
  get: (filters, index) => storage.get(JSON.stringify(filters))?.get(index),
  set: (filters, index, page) => {
    const key = JSON.stringify(filters);
    const cached = storage.get(key);
    if (cached === undefined) {
      storage.set(key, new Map([[ index, page ]]));
    } else {
      cached.set(index, page);
    }
  },
};
