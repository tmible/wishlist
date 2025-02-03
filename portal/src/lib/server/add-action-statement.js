import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для сохранения действий
 * @function initAddActionStatement
 * @returns {void}
 */
export const initAddActionStatement = () => provide(
  InjectionToken.AddActionStatement,
  inject(
    InjectionToken.LogsDatabase,
  ).prepare(
    'INSERT INTO "portal.actions" (timestamp, action, unknownUserUuid) VALUES (?, ?, ?)',
  ),
);
