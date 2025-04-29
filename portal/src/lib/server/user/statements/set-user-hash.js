import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { SetUserHash } from '../events.js';

/**
 * Создание SQL выражения для установки хэша пользователя.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initSetUserHashStatement
 * @returns {void}
 */
export const initSetUserHashStatement = () => {
  const statement = inject(Database).prepare('UPDATE usernames SET hash = ? WHERE userid = ?');
  subscribe(SetUserHash, (hash, userid) => statement.run(hash, userid));
};
