import {
  AUTHORIZATION_ERROR_MESSAGE,
} from '$lib/server/constants/authorization-error-message.const.js';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';

/**
 * Шаблонный обработчик запроса с проверками внутри пользовательского сценария:
 * 1) на авторизацию,
 * 2) на наличие данных в запросе
 * @function protectedEndpoint
 * @param {() => void} useCase Пользовательский сценарий
 * @returns {Response} Ответ на запрос
 */
export const protectedEndpoint = (useCase) => {
  try {
    useCase();
  } catch (e) {
    if (e.message === AUTHORIZATION_ERROR_MESSAGE) {
      return new Response(null, { status: 403 });
    }
    if (e.message === LACK_OF_DATA_ERROR_MESSAGE) {
      return new Response(null, { status: 400 });
    }
    throw e;
  }

  return new Response(null, { status: 200 });
};
