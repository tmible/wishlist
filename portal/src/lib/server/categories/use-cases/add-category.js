import { emit } from '@tmible/wishlist-common/event-bus';
import { AddCategory } from '../events.js';

/** @typedef {import('../initialization.js').Category} Category */

/** @module Сценарий добавления категории */

/**
 * Добавление категории
 * @function addCategory
 * @param {number} userid Идентифкатор пользователя — владельца категории
 * @param {Category['name']} name Название категории
 * @returns {Category['id']} Идентифкатор добавленной категории
 */
export const addCategory = (userid, name) => emit(AddCategory, userid, name);
