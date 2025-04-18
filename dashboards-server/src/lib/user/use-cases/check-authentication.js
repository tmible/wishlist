import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { Navigate } from '../events.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий проверки аутентификации пользователя */

/**
 * Запрос статуса аутентификации пользователя, обновление хранилища
 * и переход в соответствующую статусу зону приложения
 * @function checkAuthentication
 * @returns {Promise<void>}
 * @async
 */
export const checkAuthentication = async () => {
  const isAuthenticated = await inject(NetworkService).checkAuthentication();
  inject(Store).patch({ isAuthenticated });
  emit(Navigate, isAuthenticated ? AUTHENTICATED_ROUTE : UNAUTHENTICATED_ROUTE);
};
