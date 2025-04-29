import { inject } from '@tmible/wishlist-common/dependency-injector';
import { isCategoryEdited } from '../domain.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @typedef {import('../domain.js').Category} Category */

/** @module Сценарий редактирования категории */

/**
 * Проверка наличия изменений в категории, запрос на обновление категории, обновление хранилища
 * @function editCategory
 * @param {Category} category Редактируемая категория
 * @param {Category} editedCategory Отредактированная категория
 * @returns {Promise<void>}
 * @async
 */
export const editCategory = async (category, editedCategory) => {
  if (!isCategoryEdited(category, editedCategory)) {
    return;
  }

  const [ , ok ] = await inject(NetworkService).updateCategory(editedCategory);

  if (!ok) {
    return;
  }

  inject(Store).update(editedCategory);
};
