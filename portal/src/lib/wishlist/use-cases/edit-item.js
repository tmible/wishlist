import { inject } from '@tmible/wishlist-common/dependency-injector';
import { patchItem } from '../domain.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

/** @module Сценарий изменения элемента списка желаний */

/**
 * Проверка наличия изменений в элементе списка, запрос на обновление, обновление хранилища
 * @function editItem
 * @param {OwnWishlistItem} item Изменяемый элемент списка
 * @param {Partial<OwnWishlistItem>} patch Объект с изменениями
 * @returns {Promise<void>}
 * @async
 */
export const editItem = async (item, patch) => {
  const [ isModified, itemPatched, patchFiltered ] = patchItem(item, patch);

  if (!isModified) {
    return;
  }

  const [ , ok ] = await inject(NetworkService).patchItem(item, patchFiltered);

  if (!ok) {
    return;
  }

  inject(Store).update(itemPatched);
};
