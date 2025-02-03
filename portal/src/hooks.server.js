import { promisify } from 'node:util';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const';
import { initDB } from '$lib/server/db';
import { connectToIPCHub } from '$lib/server/ipc-hub-connection';
import { initLogger } from '$lib/server/logger';
import { initLogsDB } from '$lib/server/logs-db';

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
 */

/**
 * Проверка принадлежности запрашиваемого пути к защищённым авторизацией
 * @function isPathProtected
 * @param {string} path Запрашиваемый путь
 * @returns {boolean} Признак защищённости пути
 */
const isPathProtected = (path) => path.startsWith('/api/wishlist') || path === '/api/user/hash';

/**
 * 1. Проверка наличия cookie с токеном аутентификации;
 * 2. Расшифрока токена для получения идентификатора пользователя;
 * 3. Вызов следующего обработчика, если cookie есть и содержит идентификатор пользователя,
 *    иначе возврат ошибки 401
 * @function handleApiRequest
 * @param {RequestEvent} event Событие запроса
 * @param {ResponseResolver} resolve Функция вызова следующих обработчиков
 * @returns {Promise<Response>} Ответ от следующих обработчиков
 * @async
 */
const handleApiRequest = async (event, resolve) => {
  if (event.cookies.get(AUTH_TOKEN_COOKIE_NAME)) {
    try {
      await promisify(jwt.verify)(
        event.cookies.get(AUTH_TOKEN_COOKIE_NAME),
        env.HMAC_SECRET,
      ).then(
        ({ userid }) => event.locals.userid = userid,
      );
    } catch {
      if (isPathProtected(event.url.pathname)) {
        return new Response(null, { status: 401 });
      }
    }
  } else if (isPathProtected(event.url.pathname)) {
    return new Response(null, { status: 401 });
  }

  return await resolve(event);
};

/**
 * Промежуточный обработчик, логирующий запросы и ответы на них
 * @function loggingMiddleware
 * @param {RequestEvent} event Событие запроса
 * @param {ResponseResolver} resolve Функция вызова следующих обработчиков
 * @returns {Promise<Response>} Ответ от следующих обработчиков
 * @async
 */
const loggingMiddleware = async (event, resolve) => {
  const requestUuid = crypto.randomUUID();
  event.locals.requestUuid = requestUuid;
  const logger = inject(InjectionToken.Logger);

  logger.info(
    { requestUuid, unknownUserUuid: event.cookies.get('unknownUserUuid') ?? null },
    `request ${
      event.request.method
    } ${
      event.url.pathname
    }; cookie: ${
      event.cookies.getAll().map(({ name, value }) => `${name}=${value}`).join(';')
    }; body: ${
      event.request.body === null ? null : await event.request.clone().text()
    }`,
  );

  const response = await handleApiRequest(event, resolve);

  logger.info(
    {
      requestUuid,
      unknownUserUuid: event.cookies.get('unknownUserUuid') ?? null,
      userid: event.locals.userid ?? null,
    },
    `response ${
      response.status
    }; body: ${
      response.body === null ? null : await response.clone().text()
    }`,
  );

  return response;
};

/**
 * Промежуточный обработчик, возвращающий ошибку, если в запросе нет
 * cookie-файла, содержащего jwt-токен аутентификации, или токен в файле
 * недействителен, и добавляющий userid из jwt-токена в запрос иначе
 * @type {import('@sveltejs/kit').Handle}
 */
export const handle = async ({ event, resolve }) => (
  event.url.pathname.startsWith('/api') ?
    await loggingMiddleware(event, resolve) :
    await resolve(event)
);

/**
 * Промежуточный обработчки, логирующий ошибки
 * @type {import('@sveltejs/kit').HandleServerError}
 */
export const handleError = ({ error, event }) => {
  inject(
    InjectionToken.Logger,
  ).error(
    {
      requestUuid: event.locals.requestUuid,
      unknownUserUuid: event.cookies.get('unknownUserUuid') ?? null,
      userid: event.locals.userid ?? null,
    },
    `error ${error.stack}`,
  );
};

// Открытие подключения к БД при старте приложения
await initDB();

// Открытие подключения к БД с логами при старте приложения
await initLogsDB();

// Создание логгера
initLogger();

// Подключение к IPC хабу при старте приложения
connectToIPCHub();
