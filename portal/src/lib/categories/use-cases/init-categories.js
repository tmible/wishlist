import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий инициализации категорий */

/**
 * Запрос категорий, если хранилище пусто, обновление хранилища
 * @function initCategories
 * @returns {Promise<void>}
 * @async
 */
export const initCategories = async () => {
  const store = inject(Store);

  if (store.get().length > 0) {
    return;
  }

  const [ categories, ok ] = await inject(NetworkService).getCategories();

  if (!ok) {
    return;
  }

  store.set(categories);
};
