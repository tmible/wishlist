import { redirect } from '@sveltejs/kit';
import sha256 from '@tmible/wishlist-common/sha-256';
import { env } from '$env/dynamic/private';
import { chainHandlers } from '$lib/chain-handlers.js';
import { addAction } from '$lib/server/actions/use-cases/add-action.js';
import { generateAndStoreAuthTokens } from '$lib/server/user/generate-and-store-auth-tokens.js';
import { addUser } from '$lib/server/user/use-cases/add-user.js';

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
    // https://caniuse.com/?search=fromHex
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
 * Проверка подлинности данных в запросе аутентификации. Проверяет целостность данных,
 * подписывая их по алгоритму HMAC-SHA256 с SHA-256 хэшем токена бота в качестве секретного ключа
 * @function checkDataIntegrity
 * @param {URLSearchParams} searchParams Параметры запроса
 * @returns {Promise<void>}
 * @async
 * @throws {Error} Ошибка при провале проверки целостности данных в запросе
 * @see {@link https://core.telegram.org/widgets/login#checking-authorization}
 */
const checkDataIntegrity = async (searchParams) => {
  const hash = searchParams.get('hash');

  const dataCheckString = Array.from(searchParams.keys())
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${searchParams.get(key)}`)
    .join('\n');

  const secretKey = await sha256(env.BOT_TOKEN);

  if (await hmacSha256(dataCheckString, secretKey) !== hash.slice(0, 64)) {
    throw new Error('data integrity is compromised');
  }
};

/**
 * Проверка наличия параметра hash
 * @type {import('./$types').RequestHandler}
 */
/* eslint-disable-next-line consistent-return --
  Механизм цепочки основан на разных возвращаемых значениях */
const checkHashParameter = ({ url }) => {
  if (!url.searchParams.get('hash')) {
    return new Response('missing hash parameter', { status: 400 });
  }
};

/**
 * Проверка длины параметра hash
 * @type {import('./$types').RequestHandler}
 */
/* eslint-disable-next-line consistent-return --
  Механизм цепочки основан на разных возвращаемых значениях */
const checkHashParameterLength = ({ url }) => {
  if (url.searchParams.get('hash').length !== 64) {
    return new Response('hash parameter is invalid', { status: 400 });
  }
};

/**
 * Проверка целостности данных в запросе
 * @type {import('./$types').RequestHandler}
 */
/* eslint-disable-next-line consistent-return --
  Механизм цепочки основан на разных возвращаемых значениях */
const checkAuthorization = async ({ url }) => {
  try {
    const autorizationSerchParams = new URLSearchParams(url.searchParams);
    autorizationSerchParams.delete('continue');
    await checkDataIntegrity(autorizationSerchParams);
  } catch (e) {
    return new Response(e.message, { status: 403 });
  }
};

/**
 * Проверка наличия параметра id
 * @type {import('./$types').RequestHandler}
 */
/* eslint-disable-next-line consistent-return --
  Механизм цепочки основан на разных возвращаемых значениях */
const checkIdParameter = ({ url }) => {
  if (!url.searchParams.get('id')) {
    return new Response('missing id parameter', { status: 400 });
  }
};

/**
 * Сохранение аутентифицированного пользователя
 * @type {import('./$types').RequestHandler}
 */
const addAuthenticatedUser = ({ url }) => {
  addUser(url.searchParams.get('id'), url.searchParams.get('username') ?? null);
};

/**
 * Сохранение события аутентификации
 * @type {import('./$types').RequestHandler}
 */
const addAuthenticationAction = ({ cookies }) => {
  addAction(Date.now(), 'authentication', cookies);
};

/**
 * Выпуск и запись в cookie файлы access и refresh токенов аутентификации
 * @type {import('./$types').RequestHandler}
 */
const authenticateUser = async ({ cookies, url }) => {
  await generateAndStoreAuthTokens(cookies, url.searchParams.get('id'));
};

/**
 * Перенаправление аутентифицированного пользователя
 * @type {import('./$types').RequestHandler}
 */
const navigateFurther = ({ url }) => redirect(302, url.searchParams.get('continue') ?? '/list');

/**
 * Проверка подлинности запроса, аутентификация пользователя, выпуск и запись
 * в cookie файлы access и refresh токенов аутентификации
 * @type {import('./$types').RequestHandler}
 */
export const GET = chainHandlers(
  checkHashParameter,
  checkHashParameterLength,
  checkAuthorization,
  checkIdParameter,
  addAuthenticatedUser,
  addAuthenticationAction,
  authenticateUser,
  navigateFurther,
);
