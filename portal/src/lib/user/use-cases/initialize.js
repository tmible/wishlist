import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { createUser } from '../domain.js';
import { Navigate } from '../events.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий инициализации пользователя */

/**
 * Запрос данных пользователя, обновление хранилища и переход
 * в соответствующую статусу аутентификации зону приложения
 * @function initialize
 * @returns {Promise<void>}
 * @async
 */
export const initialize = async () => {
  const user = createUser(await inject(NetworkService).getUser());
  inject(Store).set(user);
  emit(Navigate, user.isAuthenticated ? AUTHENTICATED_ROUTE : UNAUTHENTICATED_ROUTE);
};
