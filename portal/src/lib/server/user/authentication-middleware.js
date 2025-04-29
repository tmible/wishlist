import { promisify } from 'node:util';
import { emit } from '@tmible/wishlist-common/event-bus';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const.js';
import {
  UNKNOWN_USER_UUID_COOKIE_NAME,
} from '$lib/constants/unknown-user-uuid-cookie-name.const.js';
import { GetRefreshToken } from './events.js';
import { generateAndStoreAuthTokens } from './generate-and-store-auth-tokens.js';

/** @typedef {import('@sveltejs/kit').RequestEvent} RequestEvent */
/** @typedef {import('@sveltejs/kit').ResolveOptions} ResolveOptions */
/**
 * @template T
 * @typedef {import('@sveltejs/kit').MaybePromise<T>} MaybePromise
 */
/**
 * @typedef {(
 *   event: RequestEvent,
 *   opts?: ResolveOptions,
 * ) => MaybePromise<Response>} ResponseResolver
 * @see {@link https://svelte.dev/docs/kit/@sveltejs-kit#Handle}
 */

/** @module Создание промежуточного обработчика, проверяющего аутентификацию пользователя */

/**
 * @typedef {Function} AuthenticationMiddleware
 * @param {RequestEvent} event Событие запроса
 * @param {() => MaybePromise<Response>} next Функция вызова следующих обработчиков
 * @returns {Promise<Response>} Ответ от следующих обработчиков
 * @async
 */

/**
 * Проверка принадлежности запрашиваемого пути к защищённым авторизацией
 * @function isPathProtected
 * @param {string} path Запрашиваемый путь
 * @returns {boolean} Признак защищённости пути
 */
const isPathProtected = (path) => path.startsWith('/api/wishlist') || path === '/api/user/hash';

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

  const { token: refreshTokenFromDB, userid, expires } = emit(
    GetRefreshToken,
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

/**
 * 1. Проверка наличия cookie с access токеном аутентификации;
 * 2.1. Если cookie есть, то расшифрока токена для получения идентификатора пользователя;
 * 2.2. Если cookie нет, проверка наличия refresh токена
 *      для [перевыпуска пары токенов]{@link reissueAuthTokens}
 * 3. Вызов следующего обработчика, если есть cookie с валидным access токеном или если есть cookie
 *    с refresh токеном и перевыпуск пары токенов удался, иначе возврат ошибки 401
 * @function authenticationMiddleware
 * @param {RequestEvent} event Событие запроса
 * @param {() => MaybePromise<Response>} next Функция вызова следующих обработчиков
 * @returns {Promise<Response>} Ответ от следующих обработчиков
 * @async
 */
export const authenticationMiddleware = async (event, next) => {
  if (event.cookies.get(ACCESS_TOKEN_COOKIE_NAME)) {
    try {
      await promisify(jwt.verify)(
        event.cookies.get(ACCESS_TOKEN_COOKIE_NAME),
        env.HMAC_SECRET,
      ).then(
        ({ userid }) => event.locals.userid = userid,
      );
    } catch {
      if (isPathProtected(event.url.pathname)) {
        return new Response(null, { status: 401 });
      }
    }
  } else if (event.cookies.get(REFRESH_TOKEN_COOKIE_NAME)) {
    try {
      await reissueAuthTokens(event.cookies);
    } catch {
      if (isPathProtected(event.url.pathname)) {
        return new Response(null, { status: 401 });
      }
    }
  } else if (isPathProtected(event.url.pathname)) {
    return new Response(null, { status: 401 });
  }

  return await next(event);
};
