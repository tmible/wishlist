import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
import { Navigate } from '../events.js';
import { Store } from '../injection-tokens.js';

/** @module Сценарий аутентификации пользователя */

/**
 * Обновление хранилища и переход в аутентифицированную зону приложения
 * @function login
 * @returns {void}
 */
export const login = () => {
  inject(Store).patch({ isAuthenticated: true });
  emit(Navigate, AUTHENTICATED_ROUTE);
};
