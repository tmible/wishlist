import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей SQL выражения для добавления пользователя
 * @function initAddUserStatement
 * @returns {void}
 */
export const initAddUserStatement = () => provide(
  InjectionToken.AddUserStatement,
  inject(
    InjectionToken.Database,
  ).prepare(`
    INSERT INTO usernames (userid, username) VALUES ($userid, $username)
    ON CONFLICT DO UPDATE SET (userid, username) = ($userid, $username)
  `),
);
