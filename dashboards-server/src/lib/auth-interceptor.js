import { goto } from '$app/navigation';
import { isAuthenticated } from '$lib/store/is-authenticated.js';

/**
 * Проверка авторизации при получении ответа от сервера
 * @function authInterceptor
 * @param {Response} response Ответ от сервера
 * @returns {Response} Ответ от сервера
 * @throws {Error} Ошибка при получении ошибки авторизации от сервера
 */
export const authInterceptor = (response) => {
  if (response.status === 401) {
    isAuthenticated.set(false);
    goto('/login');
    throw new Error('Got 401 response');
  }
  return response;
};
