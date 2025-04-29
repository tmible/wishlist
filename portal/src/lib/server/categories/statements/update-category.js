import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { UpdateCategory } from '../events.js';

/**
 * Создание SQL выражения для изменения категории.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initUpdateCategoryStatement
 * @returns {void}
 */
export const initUpdateCategoryStatement = () => {
  const statement = inject(
    Database,
  ).prepare(
    'UPDATE categories SET name = ? WHERE id = ? AND userid = ?',
  );
  subscribe(UpdateCategory, (userid, { id, name }) => statement.run(name, id, userid));
};
