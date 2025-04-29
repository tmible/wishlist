import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService } from '../injection-tokens.js';

/** @module Сценарий отправки действия на сервер */

/**
 * Отправка действия на сервер
 * @function sendAction
 * @param {string} action Название действия
 * @returns {Promise<void>}
 * @async
 */
export const sendAction = async (action) => {
  await inject(NetworkService).sendAction(action);
};
