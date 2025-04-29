import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

/** @module Сценарий удаления нескольких элементов списка желаний */

/**
 * Запрос на удаление нескольких элементов списка, обновление хранилища
 * @function deleteItems
 * @param {OwnWishlistItem['id'][]} itemIds Удаляемые элементы
 * @returns {Promise<void>}
 * @async
 */
export const deleteItems = async (itemIds) => {
  if (itemIds.length === 0) {
    return;
  }

  const [ , ok ] = await inject(NetworkService).deleteItems(itemIds);

  if (!ok) {
    return;
  }

  inject(Store).delete(itemIds);
};
