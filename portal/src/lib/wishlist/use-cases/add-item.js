import { inject } from '@tmible/wishlist-common/dependency-injector';
import { assignOrderToNewItem } from '../domain.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

/** @module Сценарий добавления элемента к списку желаний */

/**
 * Запрос на добавление элемента, обновление хранилища
 * @function addItem
 * @param {Partial<OwnWishlistItem>} formData Добавляемый элемент
 * @returns {Promise<void>}
 * @async
 */
export const addItem = async (formData) => {
  const store = inject(Store);
  assignOrderToNewItem(store.get(), formData);
  const [ item, ok ] = await inject(NetworkService).addItem(formData);

  if (!ok) {
    return;
  }

  store.add(item);
};
