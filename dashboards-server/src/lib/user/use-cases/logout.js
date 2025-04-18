import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { Navigate } from '../events.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий разлогинивания пользователя */

/**
 * Запрос разлогинивания, обновление хранилища и переход в неаутентифицированную зону приложения
 * @function logout
 * @param {boolean} shouldSendRequest Признак необходимости отправки на сервер
 *   запроса разлогинивания
 * @returns {Promise<void>}
 * @async
 */
export const logout = async (shouldSendRequest = false) => {
  let response;
  if (shouldSendRequest) {
    response = await inject(NetworkService).logout();
  }
  if (!shouldSendRequest || response.ok) {
    inject(Store).patch({ isAuthenticated: false });
    emit(Navigate, UNAUTHENTICATED_ROUTE);
  }
};
