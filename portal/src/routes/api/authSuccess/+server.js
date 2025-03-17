import { promisify } from 'node:util';
import { redirect } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import sha256 from '@tmible/wishlist-common/sha-256';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const';
import { AUTH_TOKEN_EXPIRATION } from '$lib/constants/auth-token-expiration.const';

/**
 * Вычисление HMAC-SHA256 подписи
 * @function hmacSha256
 * @param {string} value Подписываемая строка
 * @param {string} secretKey Секретный ключ для подписи
 * @returns {Promise<string>} Вычисленная подпись
 * @async
 */
const hmacSha256 = async (value, secretKey) => {
  const key = await crypto.subtle.importKey(
    'raw',

    // В будущем можно заменить на Uint8Array.fromHex(secretKey)
    // TextEncoder.encode() не подходит, так как нужно читать по 2 символа в каждый байт
    Uint8Array.from(secretKey.matchAll(/(.{2})/g), ([ byte ]) => Number.parseInt(byte, 16)),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    [ 'sign' ],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(
    new Uint8Array(signature),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('');
};

/**
 * Проверка подлинности запроса аутентификации. Проверяет целостность данных в запросе,
 * подписывая их по алгоритму HMAC-SHA256 с SHA-256 хэшем токена бота в качестве секретного ключа
 * @function checkAuthorization
 * @param {URLSearchParams} searchParams Параметры запроса
 * @returns {Promise<void>}
 * @async
 * @throws {Error} Ошибки при отсутствии параметра hash, при невалидном формате параметра hash
 * или при провале проверки целостности данных в запросе
 * @see {@link https://core.telegram.org/widgets/login#checking-authorization}
 */
const checkAuthorization = async (searchParams) => {
  const hash = searchParams.get('hash');

  if (!hash) {
    throw new Error('["missing hash parameter", {"status":400}]');
  }

  if (hash.length !== 64) {
    throw new Error('["hash parameter is invalid", {"status":400}]');
  }

  const dataCheckString = Array.from(searchParams.keys())
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${searchParams.get(key)}`)
    .join('\n');

  const secretKey = await sha256(env.BOT_TOKEN);

  if (await hmacSha256(dataCheckString, secretKey) !== hash.slice(0, 64)) {
    throw new Error('["data integrity is compromised", {"status":403}]');
  }
};

/**
 * Сохранение в БД с логами события успешной аутентификации
 * @function saveAuthenticationAction
 * @param {string} unknownUserUuid Идентификатор неаутентифицированного пользователя
 * @returns {void}
 */
const saveAuthenticationAction = (unknownUserUuid) => {
  if (unknownUserUuid) {
    inject(InjectionToken.AddActionStatement).run(Date.now(), 'authentication', unknownUserUuid);
  }
};

/**
 * Проверка подлинности запроса, аутентификация пользователя
 * и создание cookie-файла с jwt-токеном аутентификации
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ cookies, url }) => {
  try {
    await checkAuthorization(url.searchParams);
  } catch (e) {
    return new Response(...JSON.parse(e.message));
  }

  const userid = url.searchParams.get('id');

  if (!userid) {
    return new Response('missing id parameter', { status: 400 });
  }

  inject(InjectionToken.AddUserStatement).run(userid, url.searchParams.get('username') ?? null);

  const token = await promisify(jwt.sign)(
    { userid },
    env.HMAC_SECRET,
    { expiresIn: `${AUTH_TOKEN_EXPIRATION / 60}min` },
  );
  cookies.set(AUTH_TOKEN_COOKIE_NAME, token, AUTH_TOKEN_COOKIE_OPTIONS);

  saveAuthenticationAction(cookies.get('unknownUserUuid'));

  return redirect(302, '/list');
};
