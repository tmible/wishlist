import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения хэша пользователя
 * @function initGetUserHashStatement
 * @returns {void}
 */
export const initGetUserHashStatement = () => provide(
  InjectionToken.GetUserHashStatement,
  inject(InjectionToken.Database).prepare('SELECT hash FROM usernames WHERE userid = ?'),
);
