import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для сохранения refresh токена аутентификации
 * @function initStoreRefreshTokenStatement
 * @returns {void}
 */
export const initStoreRefreshTokenStatement = () => provide(
  InjectionToken.StoreRefreshTokenStatement,
  inject(InjectionToken.Database).prepare(`
    INSERT INTO refresh_tokens VALUES($token, $userid, $unknownUserUuid, $expires)
    ON CONFLICT DO UPDATE SET
      (token, userid, unknownUserUuid, expires) = ($token, $userid, $unknownUserUuid, $expires)
  `),
);
