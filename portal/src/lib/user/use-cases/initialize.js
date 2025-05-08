import { inject } from '@tmible/wishlist-common/dependency-injector';
import { createUser } from '../domain.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий инициализации пользователя */

/**
 * Запрос данных пользователя, обновление хранилища
 * @function initialize
 * @returns {Promise<void>}
 * @async
 */
export const initialize = async () => {
  const user = createUser(await inject(NetworkService).getUser());
  inject(Store).set(user);
};
