import ListItemState from '@tmible/wishlist-common/constants/list-item-state';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { AddItem } from '../events.js';

/**
 * Создание SQL выражения для добавления элемента к списку желаний.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initAddItemStatement
 * @returns {void}
 */
export const initAddItemStatement = () => {
  const statement = inject(Database).prepare(`
    INSERT INTO list (userid, name, description, state, "order", category_id, added_by)
    VALUES (?, ?, ?, ${ListItemState.FREE}, ?, ?, ?)
    RETURNING id
  `);
  subscribe(
    AddItem,
    (
      userid,
      {
        name,
        description,
        order,
        categoryId,
        addedBy = null,
      },
    ) => statement.get(userid, name, description, order, categoryId, addedBy),
  );
};
