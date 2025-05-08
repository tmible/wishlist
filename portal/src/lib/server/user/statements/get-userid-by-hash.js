import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetUseridByHash } from '../events.js';

/**
 * Создание SQL выражения для получения идентификатора пользователя по хэшу.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initGetUseridByHashStatement
 * @returns {void}
 */
export const initGetUseridByHashStatement = () => {
  const statement = inject(Database).prepare('SELECT userid FROM usernames WHERE hash = ?');
  subscribe(GetUseridByHash, (hash) => statement.get(hash).userid);
};
