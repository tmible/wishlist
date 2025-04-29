import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetCategories } from '../events.js';

/**
 * Создание SQL выражения для получения категорий пользователя.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initGetCategoriesStatement
 * @returns {void}
 */
export const initGetCategoriesStatement = () => {
  const statement = inject(Database).prepare('SELECT id, name FROM categories WHERE userid = ?');
  subscribe(GetCategories, (userid) => statement.all(userid));
};
