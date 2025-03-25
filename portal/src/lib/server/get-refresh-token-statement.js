import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения refresh токена аутентификации
 * @function initGetRefreshTokenStatement
 * @returns {void}
 */
export const initGetRefreshTokenStatement = () => provide(
  InjectionToken.GetRefreshTokenStatement,
  inject(
    InjectionToken.Database,
  ).prepare(
    'DELETE FROM refresh_tokens WHERE unknownUserUuid = ? RETURNING token, userid, expires',
  ),
);
