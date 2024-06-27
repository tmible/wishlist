import { goto } from '$app/navigation';
import { isAuthenticated } from '$lib/store/is-authenticated.js';

/**
 * Получение данных для дашбордов с проверкой на ошибку авторизации от сервера
 * @function getData
 * @param {string} path Путь запроса
 * @param {(string) => Promise<unknown>} fetchFunction Функция для выполнения запроса
 * @returns {Promise<unknown>} Ответ сервера
 * @async
 * @throws {Error} Ошибка при получении ошибки авторизации от сервера
 */
export const getData = async (path, fetchFunction = fetch) => {
  const response = await fetchFunction(path);
  if (response.status === 401) {
    isAuthenticated.set(false);
    goto('/login');
    throw new Error('Got 401 response');
  }
  return await response.json();
};
