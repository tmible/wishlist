import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { DeleteCategory } from '../events.js';

/**
 * Создание SQL выражения для удаления категории.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initDeleteCategoryStatement
 * @returns {void}
 */
export const initDeleteCategoryStatement = () => {
  const statement = inject(Database).prepare('DELETE FROM categories WHERE id = ? AND userid = ?');
  subscribe(DeleteCategory, (userid, id) => statement.run(id, userid));
};
