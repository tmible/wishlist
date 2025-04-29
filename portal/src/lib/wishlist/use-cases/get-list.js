import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий получения списка желаний */

/**
 * Запрос списка желаний, обновление хранилища
 * @function getList
 * @returns {Promise<void>}
 * @async
 */
export const getList = async () => {
  const [ list, ok ] = await inject(NetworkService).getList();

  if (!ok) {
    return;
  }

  inject(Store).set(list);
};
