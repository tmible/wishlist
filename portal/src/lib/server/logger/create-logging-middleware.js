import { inject } from '@tmible/wishlist-common/dependency-injector';
import {
  UNKNOWN_USER_UUID_COOKIE_NAME,
} from '$lib/constants/unknown-user-uuid-cookie-name.const.js';
import { Logger } from './injection-tokens.js';

/** @typedef {import('@sveltejs/kit').RequestEvent} RequestEvent */
/**
 * @template T
 * @typedef {import('@sveltejs/kit').MaybePromise<T>} MaybePromise
 * @see {@link https://svelte.dev/docs/kit/@sveltejs-kit#MaybePromise}
 */

/** @module Создание промежуточного обработчика, логирующего запросы и ответы на них */

/**
 * @typedef {Function} LoggingMiddleware
 * @param {RequestEvent} event Событие запроса
 * @param {() => MaybePromise<Response>} next Функция вызова следующих обработчиков
 * @returns {Promise<Response>} Ответ от следующих обработчиков
 * @async
 */

/**
 * Создание промежуточного обработчика
 * @function createLoggingMiddleware
 * @returns {LoggingMiddleware} Промежуточный обработчик
 */
export const createLoggingMiddleware = () => {
  const logger = inject(Logger);
  return async (event, next) => {
    const requestUuid = crypto.randomUUID();
    event.locals.requestUuid = requestUuid;

    logger.info(
      { requestUuid, unknownUserUuid: event.cookies.get(UNKNOWN_USER_UUID_COOKIE_NAME) ?? null },
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

    const response = await next(event);

    let responseBody = null;
    if (response.body !== null) {
      responseBody =
        response.body instanceof ReadableStream ?
          'event-stream' :
          (await response.clone().text());
    }

    logger.info(
      {
        requestUuid,
        unknownUserUuid: event.cookies.get(UNKNOWN_USER_UUID_COOKIE_NAME) ?? null,
        userid: event.locals.userid ?? null,
      },
      `response ${response.status}; body: ${responseBody}`,
    );

    return response;
  };
};
