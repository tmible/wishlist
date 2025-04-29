import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий переупорядочивания списка желаний */

/**
 * Отображение идентификаторов элементов списка в порядковый номер
 * @typedef {{ id: number, order: number }[]} ReorderPatch
 */

/**
 * Запрос на переупорядочивания списка, обновление хранилища
 * @function reorderList
 * @param {ReorderPatch} patch Отображение идентификаторов элементов списка в порядковый номер
 * @returns {Promise<void>}
 * @async
 */
export const reorderList = async (patch) => {
  if (patch.length === 0) {
    return;
  }

  const [ , ok ] = await inject(NetworkService).reorderList(patch);

  if (!ok) {
    return;
  }

  inject(Store).reorder(patch);
};
