import { browser } from '$app/environment';
import {
  UNKNOWN_USER_UUID_COOKIE_NAME,
} from '$lib/constants/unknown-user-uuid-cookie-name.const.js';

/**
 * Сохранение unknownUserUuid в localStorage и cookies
 * @function storeUnknownUserUuid
 * @param {string} unknownUserUuid Идентификатор неаутентифицированного пользователя
 * @param {Event} [event] Событие
 * @returns {void}
 */
const storeUnknownUserUuid = (unknownUserUuid, event) => {
  localStorage.setItem(UNKNOWN_USER_UUID_COOKIE_NAME, unknownUserUuid);
  document.cookie =
    `${UNKNOWN_USER_UUID_COOKIE_NAME}=${unknownUserUuid}; path=/; max-age=525600; secure; samesite`;
  if (event) {
    event.returnValue = '';
  }
};

/**
 * Инициализация идентификатора неаутентифицированного пользователя. Чтение из localStorage
 * и cookies или генерация и запись туда же. Сохранение перед закрытием страницы.
 * unknownUserUuid используется для идентификации пользователей при сборе метрик
 * @function initUnknownUserUuid
 * @returns {void}
 */
export const initUnknownUserUuid = () => {
  if (browser) {
    const unknownUserUuid = localStorage.getItem(UNKNOWN_USER_UUID_COOKIE_NAME) ??
      document.cookie.match(/unknownUserUuid=([^;]+)/)?.[1] ??
      crypto.randomUUID();
    storeUnknownUserUuid(unknownUserUuid);
    window.addEventListener(
      'beforeunload',
      (event) => storeUnknownUserUuid(unknownUserUuid, event),
    );
  }
};
