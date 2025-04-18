import { authInterceptor } from '$lib/auth-interceptor.js';

/** @module Сетевой сервис дашборда */

/**
 * Создание функции получения данных для дашборда с проверкой на ошибку аутентификации от сервера
 * @function createGetData
 * @param {'bot' | 'portal'} service Сервис, метрики которого отображает дашборд
 * @param {(string) => Promise<unknown>} fetchFunction Функция для выполнения запроса
 * @returns {(keys: string[], periodStart: number) => Promise<unknown>} Функция получения данных
 */
export const createGetData = (
  service,
  fetchFunction = fetch,
) => async (keys, periodStart) => await Promise.all(
  keys.map((key) => fetchFunction(
    `/api/data/${service}/${key}?periodStart=${periodStart}`,
  ).then(
    authInterceptor,
  ).then(
    (response) => response.json(),
  )),
);
