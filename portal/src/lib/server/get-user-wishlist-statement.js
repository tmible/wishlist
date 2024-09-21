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
    SELECT
      list.id,
      list.name,
      description,
      state,
      "order",
      categories.id AS categoryId,
      categories.name AS categoryName,
      type,
      offset,
      length,
      additional
    FROM (
      SELECT id, name, description, state, "order", category_id FROM list WHERE userid = ?
    ) AS list
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
    LEFT JOIN categories ON list.category_id = categories.id
  `),
);
