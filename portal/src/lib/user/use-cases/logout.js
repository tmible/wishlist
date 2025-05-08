import { inject } from '@tmible/wishlist-common/dependency-injector';
import { logoutUser } from '../domain.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий разлогинивания пользователя */

/**
 * Запрос разлогинивания, обновление хранилища
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
};
