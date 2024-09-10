import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения списка желаний пользователя
 * @function initGetUserWishlistStatement
 * @returns {void}
 */
export const initGetUserWishlistStatement = () => provide(
  InjectionToken.GetUserWishlistStatement,
  inject(InjectionToken.Database).prepare(`
    SELECT id, priority, name, description, state, type, offset, length, additional
    FROM list
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
    WHERE userid = ?
  `),
);
