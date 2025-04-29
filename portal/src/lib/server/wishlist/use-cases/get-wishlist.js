import { emit } from '@tmible/wishlist-common/event-bus';
import { GetWishlist } from '../events.js';

/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItem} OwnWishlistItem */

/** @module Сценарий получения списка желаний */

/**
 * Получение списка
 * @function getWishlist
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @returns {OwnWishlistItem[]} Список желаний пользователя
 */
export const getWishlist = (userid) => emit(GetWishlist, userid);
