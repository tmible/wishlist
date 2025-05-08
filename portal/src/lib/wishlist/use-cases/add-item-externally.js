import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService } from '../injection-tokens.js';

/** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

/** @module Сценарий добавления сюрприза к списку желаний */

/**
 * Запрос на добавление сюрприза
 * @function addItemExternally
 * @param {Partial<OwnWishlistItem>} formData Добавляемый сюрприз
 * @param {string} targetUserHash Хэш пользователя, к списку которого добавляется сюрприз
 * @returns {Promise<void>}
 * @async
 */
export const addItemExternally = async (formData, targetUserHash) => {
  await inject(NetworkService).addItem(formData, targetUserHash);
};
