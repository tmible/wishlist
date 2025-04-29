import { emit } from '@tmible/wishlist-common/event-bus';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { ACCESS_TOKEN_COOKIE_OPTIONS } from '$lib/constants/access-token-cookie-options.const.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const.js';
import { DeleteRefreshToken } from '../events.js';

/** @module Сценарий разлогинивания пользователя */

/**
 * Разлогинивание пользователя: удаление токенов аутентификации
 * @function logout
 * @param {import('./$types').Cookies} cookies Cookie файлы запроса и ответа
 * @returns {void}
 */
export const logout = (cookies) => {
  cookies.delete(ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_COOKIE_OPTIONS);
  emit(DeleteRefreshToken, cookies.get(REFRESH_TOKEN_COOKIE_NAME));
  cookies.delete(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
};
