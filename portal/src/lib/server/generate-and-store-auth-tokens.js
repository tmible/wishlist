import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const';
import { ACCESS_TOKEN_COOKIE_OPTIONS } from '$lib/constants/access-token-cookie-options.const';
import { ACCESS_TOKEN_EXPIRATION } from '$lib/constants/access-token-expiration.const';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const';
import { REFRESH_TOKEN_EXPIRATION } from '$lib/constants/refresh-token-expiration.const';
import { UNKNOWN_USER_UUID_COOKIE_NAME } from '$lib/constants/unknown-user-uuid-cookie-name.const';

/**
 * Создание и сохранение токенов аутентификации (access и refresh)
 * @function generateAndStoreTokens
 * @param {import('./$types').Cookies} cookies Куки файлы запроса и ответа
 * @param {number} userid Идентификатор пользователя
 * @returns {Promise<void>}
 * @async
 */
export const generateAndStoreAuthTokens = async (cookies, userid) => {
  const accessToken = await promisify(jwt.sign)(
    { userid },
    env.HMAC_SECRET,
    { expiresIn: `${ACCESS_TOKEN_EXPIRATION / 60}min` },
  );

  const refreshToken = randomUUID();

  cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

  inject(InjectionToken.StoreRefreshTokenStatement).run({
    token: refreshToken,
    userid,
    unknownUserUuid: cookies.get(UNKNOWN_USER_UUID_COOKIE_NAME),
    expires: Date.now() + (REFRESH_TOKEN_EXPIRATION * 1000),
  });
  cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
};
