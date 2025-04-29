import { inject } from '@tmible/wishlist-common/dependency-injector';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { JWTService } from '../injection-tokens.js';

/** @module Сценарий получения пользователя */

/**
 * Проверка аутентифицированности пользователя: проверка
 * наличия токена доступа в cookie файлах и его чтение
 * @function getUser
 * @param {import('./$types').Cookies} cookies Cookie файлы запроса и ответа
 * @returns {Promise<{ id: number | null, isAuthenticated: boolean }>} идентификатор
 *   и статус аутентификации пользователя
 * @async
 */
export const getUser = async (cookies) => {
  const accessToken = cookies.get(ACCESS_TOKEN_COOKIE_NAME);

  if (!accessToken) {
    return { id: null, isAuthenticated: false };
  }

  let decoded;
  try {
    decoded = await inject(JWTService).decode(accessToken);
  } catch {
    return { id: null, isAuthenticated: false };
  }

  return { id: decoded.userid, isAuthenticated: true };
};
