import { authInterceptor } from './auth-interceptor.js';

/**
 * Получение данных для дашбордов с проверкой на ошибку авторизации от сервера
 * @function getData
 * @param {string} path Путь запроса
 * @param {(string) => Promise<unknown>} fetchFunction Функция для выполнения запроса
 * @returns {Promise<unknown>} Ответ сервера
 * @async
 */
export const getData = async (path, fetchFunction = fetch) => {
  const response = await fetchFunction(path).then(authInterceptor);
  return await response.json();
};
