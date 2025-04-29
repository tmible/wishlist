import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetItem } from '../events.js';

/**
 * Создание SQL выражения для получения элемента списка желаний.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initGetItemStatement
 * @returns {void}
 */
export const initGetItemStatement = () => {
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
      additional
    FROM (
      SELECT id, name, description, state, "order", category_id FROM list WHERE id = ?
    ) AS list
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
    LEFT JOIN categories ON list.category_id = categories.id
  `);

  subscribe(
    GetItem,
    (id) => statement
      .all(id)
      /* eslint-disable-next-line unicorn/no-array-callback-reference --
        descriptionEntitiesReducer -- специально написанная для использования в reduce() функция */
      .reduce(descriptionEntitiesReducer, [])
      .map(({ categoryId, categoryName, ...listItem }) => ({
        category: {
          id: categoryId,
          name: categoryName,
        },
        ...listItem,
      }))[0],
  );
};
