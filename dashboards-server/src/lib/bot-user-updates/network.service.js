import { authInterceptor } from '$lib/auth-interceptor.js';

/** @typedef {import('./initialization.js').BotUserUpdatesDTO} BotUserUpdatesDTO */

/** @module Сетевой сервис обновлений, полученных ботом */

/**
 * Запрос части обновлений
 * @function getPage
 * @param {object} params Параметры запроса
 * @param {(string) => Promise<unknown>} fetchFunction Функция для выполнения запроса
 * @returns {Promise<[ BotUserUpdatesDTO, boolean ]>} Обновления и успешность запорса
 * @async
 */
export const getPage = async (params, fetchFunction = fetch) => {
  const paramsString = Object.entries(params)
    .filter(([ , param ]) => param !== undefined)
    .map(([ key, param ]) => `${key}=${JSON.stringify(param)}`)
    .join('&');
  const response = await fetchFunction(
    `/api/data/bot/userUpdates${paramsString.length > 0 ? '?' : ''}${paramsString}`,
  ).then(
    authInterceptor,
  );
  return [ await response.json(), response.ok ];
};
