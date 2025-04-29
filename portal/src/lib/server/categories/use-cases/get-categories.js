import { emit } from '@tmible/wishlist-common/event-bus';
import { GetCategories } from '../events.js';

/** @typedef {import('../initialization.js').Category} Category */

/** @module Сценарий получения категорий */

/**
 * Получение категорий
 * @function getCategories
 * @param {number} userid Идентифкатор пользователя — владельца категорий
 * @returns {Category[]} Категории
 */
export const getCategories = (userid) => emit(GetCategories, userid);
