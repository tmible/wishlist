import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для добавления хэша пользователя
 * @function initSetUserHashStatement
 * @returns {void}
 */
export const initSetUserHashStatement = () => provide(
  InjectionToken.SetUserHashStatement,
  inject(InjectionToken.Database).prepare('UPDATE usernames SET hash = ? WHERE userid = ?'),
);
