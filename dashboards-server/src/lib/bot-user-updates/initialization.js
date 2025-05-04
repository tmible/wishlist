import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { cache } from './cache.js';
import { Cache, NetworkService, Store } from './injection-tokens.js';
import * as networkService from './network.service.js';
import { botUserUpdates } from './store.js';

/**
 * Обновление, полученное ботом
 * @typedef {object} BotUserUpdate
 * @property {number} time Отметка времени получения обновления
 * @property {number} chatId Идентификтатор чата
 * @property {number} userid Идентификатор пользователя
 * @property {string} updateType Тип обновления
 * @property {string} updatePayload Полезная нагрузка обновления
 */

/** @typedef {{ page: BotUserUpdate[], index: number, total: number }} BotUserUpdatesDTO */

/**
 * Значение простого фильтра обновлений
 * @typedef {undefined | string | number} BotUserUpdatesSimpleFilter
 */
/**
 * Значение фильтра обновлений — диапазона
 * @typedef {Record<'strat' | 'end', undefined | number>} BotUserUpdatesRangeFilter
 */
/**
 * Значение фильтров обновлений
 * @typedef {
 *   Record<string, BotUserUpdatesSimpleFilter | BotUserUpdatesRangeFilter>
 * } BotUserUpdatesFilters
 */

/**
 * Регистрация зависисмостей для работы с обновлениями, полученными ботом
 * @function initBotUserUpdatesFeature
 * @returns {() => void} Функция освбождения зависисмостей
 */
export const initBotUserUpdatesFeature = () => {
  provide(NetworkService, networkService);
  provide(Store, botUserUpdates);
  provide(Cache, cache);
  return () => {
    deprive(NetworkService);
    deprive(Store);
    provide(Cache);
  };
};
