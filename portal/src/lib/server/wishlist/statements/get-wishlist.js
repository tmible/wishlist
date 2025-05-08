import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetWishlist } from '../events.js';

/**
 * Создание SQL выражения для получения списка желаний пользователя.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initGetWishlistStatement
 * @returns {void}
 */
export const initGetWishlistStatement = () => {
  const statement = inject(Database).prepare(`
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
      additional,
      CASE WHEN added_by IS NULL THEN FALSE ELSE TRUE END AS isExternal
    FROM (
      SELECT id, name, description, state, "order", category_id, added_by
      FROM list
      WHERE userid = ?
    ) AS list
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
    LEFT JOIN categories ON list.category_id = categories.id
  `);

  subscribe(
    GetWishlist,
    (userid) => statement
      .all(userid)
      /* eslint-disable-next-line unicorn/no-array-callback-reference --
        descriptionEntitiesReducer -- специально написанная для использования в reduce() функция */
      .reduce(descriptionEntitiesReducer, [])
      .map(({ categoryId, categoryName, ...listItem }) => ({
        category: {
          id: categoryId,
          name: categoryName,
        },
        ...listItem,
      }))
      .sort((a, b) => a.order - b.order),
  );
};
