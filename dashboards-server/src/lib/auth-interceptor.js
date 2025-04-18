import { logout } from '$lib/user/use-cases/logout.js';

/**
 * Текст исключения при получении ошибки аутентификации от сервера
 * @constant {string}
 */
const AUTH_ERROR_MESSAGE = 'Got 401 response';

/** Добавление глобального обработчика ошибок для перехвата исключений от {@link authInterceptor} */
globalThis.addEventListener?.(
  'unhandledrejection',
  (event) => {
    if (event.reason.message === AUTH_ERROR_MESSAGE) {
      event.preventDefault();
    }
  },
);

/**
 * Проверка аутентификации пользователя при получении ответа от сервера
 * @function authInterceptor
 * @param {Response} response Ответ от сервера
 * @returns {Response} Ответ от сервера
 * @throws {Error} Ошибка при получении ошибки авторизации от сервера
 */
export const authInterceptor = (response) => {
  if (response.status === 401) {
    logout();
    throw new Error(AUTH_ERROR_MESSAGE);
  }
  return response;
};
