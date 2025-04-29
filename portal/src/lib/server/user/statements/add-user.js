import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { AddUser } from '../events.js';

/**
 * Создание SQL выражения для добавления пользователя.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initAddUserStatement
 * @returns {void}
 */
export const initAddUserStatement = () => {
  const statement = inject(
    Database,
  ).prepare(`
    INSERT INTO usernames (userid, username) VALUES ($userid, $username)
    ON CONFLICT DO UPDATE SET (userid, username) = ($userid, $username)
  `);
  subscribe(AddUser, (userid, username) => statement.run({ userid, username }));
};
