import { post } from '@tmible/wishlist-common/post';

/** @module Сетевой сервис пользователя */

/**
 * Запрос статуса аутентификации пользователя
 * @function checkAuthentication
 * @returns {Promise<boolean>} Статус аутентификации пользователя
 * @async
 */
export const checkAuthentication =
  async () => await fetch('/api/isAuthenticated').then((response) => response.json());

/**
 * Запрос разлогинивания пользователя
 * @function logout
 * @returns {Promise<Response>} Ответ на запрос
 * @async
 */
export const logout = async () => await post('/api/logout');
