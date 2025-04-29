import { emit } from '@tmible/wishlist-common/event-bus';
import { AddUser } from '../events.js';

/** @module Сценарий добавления пользователя */

/**
 * Добавление пользователя
 * @function addUser
 * @param {number} userid Идентификатор пользователя
 * @param {string} username Имя пользователя
 * @returns {void}
 */
export const addUser = (userid, username) => emit(AddUser, userid, username);
