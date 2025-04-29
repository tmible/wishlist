import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { logoutUser } from '../domain.js';
import { Navigate } from '../events.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий разлогинивания пользователя */

/**
 * Запрос разлогинивания, обновление хранилища и переход в неаутентифицированную зону приложения
 * @function logout
 * @returns {Promise<void>}
 * @async
 */
export const logout = async () => {
  const response = await inject(NetworkService).logout();
  if (!response.ok) {
    return;
  }
  const store = inject(Store);
  store.set(logoutUser(store.get()));
  emit(Navigate, UNAUTHENTICATED_ROUTE);
};
