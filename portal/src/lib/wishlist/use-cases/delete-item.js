import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

/** @module Сценарий удаления одного элемента списка желаний */

/**
 * Запрос на удаление одного элемента списка, обновление хранилища
 * @function deleteItem
 * @param {OwnWishlistItem} item Удаляемый элемент
 * @returns {Promise<void>}
 * @async
 */
export const deleteItem = async (item) => {
  const [ , ok ] = await inject(NetworkService).deleteItem(item);

  if (!ok) {
    return;
  }

  inject(Store).delete([ item.id ]);
};
