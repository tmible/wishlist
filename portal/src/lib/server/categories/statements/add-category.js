import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { AddCategory } from '../events.js';

/**
 * Создание SQL выражения для добавления категории.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initAddCategoryStatement
 * @returns {void}
 */
export const initAddCategoryStatement = () => {
  const statement = inject(Database).prepare(
    'INSERT INTO categories (userid, name) VALUES (?, ?) RETURNING id',
  );
  subscribe(AddCategory, (userid, name) => statement.get(userid, name));
};
