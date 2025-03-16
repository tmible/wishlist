import { browser } from '$app/environment';

/**
 * Сохранение unknownUserUuid в localStorage и cookies
 * @function storeUnknownUserUuid
 * @param {string} unknownUserUuid Идентификатор неаутентифицированного пользователя
 * @param {Event} event Событие
 * @returns {void}
 */
const storeUnknownUserUuid = (unknownUserUuid, event) => {
  localStorage.setItem('unknownUserUuid', unknownUserUuid);
  document.cookie =
    `unknownUserUuid=${unknownUserUuid}; path=/; max-age=525600; secure; samesite`;
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
    const unknownUserUuid = localStorage.getItem('unknownUserUuid') ??
      document.cookie.match(/unknownUserUuid=([^;]+)/)?.[1] ??
      crypto.randomUUID();
    storeUnknownUserUuid(unknownUserUuid);
    window.addEventListener(
      'beforeunload',
      (event) => storeUnknownUserUuid(unknownUserUuid, event),
    );
  }
};
