import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для удаления refresh токена аутентификации
 * @function initDeleteRefreshTokenStatement
 * @returns {void}
 */
export const initDeleteRefreshTokenStatement = () => provide(
  InjectionToken.DeleteRefreshTokenStatement,
  inject(InjectionToken.Database).prepare('DELETE FROM refresh_tokens WHERE token = ?'),
);
