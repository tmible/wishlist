import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Cache, NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('./initialization.js').BotUserUpdatesFilters} BotUserUpdatesFilters */

/** @module Сценарий получения части обновлений, полученных ботом */

/**
 * Проверка наличия запрашиваемой части обновлений к кэше, запись
 * в хранилище из кэша или сети, кэширование после успешного запроса
 * @function getPage
 * @param {number} timeLock Таймштамп, позже которого выбираются обновления
 * @param {number} index Индекс страницы
 * @param {BotUserUpdatesFilters} filters Фильтры обновлений
 * @returns {Promise<void>}
 * @async
 */
export const getPage = async (timeLock, index, filters) => {
  const cache = inject(Cache);
  const store = inject(Store);

  const cached = cache.get(filters, index);
  if (cached) {
    store.set(cached);
    return;
  }

  const [ page, ok ] = await inject(NetworkService).getPage({ timeLock, index, filters });

  if (!ok) {
    return;
  }

  cache.set(filters, page.index, page);
  store.set(page);
};
