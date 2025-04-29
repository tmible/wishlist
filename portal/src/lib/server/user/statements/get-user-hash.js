import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetUserHash } from '../events.js';

/**
 * Создание SQL выражения для получения хэша пользователя.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initGetUserHashStatement
 * @returns {void}
 */
export const initGetUserHashStatement = () => {
  const statement = inject(Database).prepare('SELECT hash FROM usernames WHERE userid = ?');
  subscribe(GetUserHash, (userid) => statement.get(userid).hash);
};
