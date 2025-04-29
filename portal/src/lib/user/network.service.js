import { post } from '@tmible/wishlist-common/post';

/** @typedef {import('./domain.js').User} User */

/** @module Сетевой сервис пользователя */

/**
 * Запрос данных пользователя
 * @function getUser
 * @returns {Promise<Partial<User>>} Пользователь
 * @async
 */
export const getUser = async () => await fetch('/api/user').then((response) => response.json());

/**
 * Запрос хэша пользователя
 * @function getHash
 * @returns {Promise<User['hash']>} Хэш пользователя
 * @async
 */
export const getHash =
  async () => await fetch('/api/user/hash').then((response) => response.text());

/**
 * Запрос разлогинивания пользователя
 * @function logout
 * @returns {Promise<Response<void>>} Ответ на запрос
 * @async
 */
export const logout = async () => await post('/api/logout');
