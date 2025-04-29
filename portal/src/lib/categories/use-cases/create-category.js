import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('../domain.js').Category} Category */

/** @module Сценарий создания категории */

/**
 * Запрос на создание категории, обновление хранилища
 * @function createCategory
 * @param {Omit<Category, 'id'>} category Создаваемая категория
 * @returns {Promise<void>}
 * @async
 */
export const createCategory = async (category) => {
  const [ id, ok ] = await inject(NetworkService).createCategory(category);

  if (!ok) {
    return;
  }

  inject(Store).add({ id, ...category });
};
