import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const';
import { UNKNOWN_USER_UUID_COOKIE_NAME } from '$lib/constants/unknown-user-uuid-cookie-name.const';
import { generateAndStoreAuthTokens } from '$lib/server/generate-and-store-auth-tokens';

/**
 * Проверка refresh токена аутентификации
 * и [перевыпуск access и refresh токенов аутентификации]{@link generateAndStoreAuthTokens}
 * @function reissueAuthTokens
 * @param {import('./$types').Cookies} cookies Cookie файлы запроса и ответа
 * @returns {Promise<void>}
 * @async
 * @throws {Error} Ошибка несоответствия refresh токенов из cookie файлов и из БД
 *   (в т. ч. в случае отсутствия одного из них или обоих)
 * @throws {Error} Ошибка в случае если refresh токен в БД протух
 */
export const reissueAuthTokens = async (cookies) => {
  const refreshTokenFromCookie = cookies.get(REFRESH_TOKEN_COOKIE_NAME);

  const { token: refreshTokenFromDB, userid, expires } = inject(
    InjectionToken.GetRefreshTokenStatement,
  ).get(
    cookies.get(UNKNOWN_USER_UUID_COOKIE_NAME),
  ) ?? {};

  if (
    !refreshTokenFromCookie ||
    !refreshTokenFromDB ||
    refreshTokenFromCookie !== refreshTokenFromDB
  ) {
    cookies.delete(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
    throw new Error('Token is invalid');
  }

  if ((expires ?? 0) < Date.now() / 1000) {
    cookies.delete(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
    throw new Error('Token expired');
  }

  await generateAndStoreAuthTokens(cookies, userid);
};
