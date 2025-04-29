import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('../domain.js').Category} Category */

/** @module Сценарий удаления категории */

/**
 * Запрос на удаление категории, обновление хранилища
 * @function deleteCategory
 * @param {Category} category Удаляемая категория
 * @returns {Promise<void>}
 * @async
 */
export const deleteCategory = async (category) => {
  const [ , ok ] = await inject(NetworkService).deleteCategory(category);

  if (!ok) {
    return;
  }

  inject(Store).delete(category);
};
