import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения получения количества изменений
 * @function initChangesStatement
 * @returns {void}
 */
export const initChangesStatement = () => provide(
  InjectionToken.ChangesStatement,
  inject(InjectionToken.Database).prepare('SELECT changes() AS changes'),
);
