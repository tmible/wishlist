import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { DeleteRefreshToken } from '../events.js';

/**
 * Создание SQL выражения для удаления refresh токена аутентификации.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initDeleteRefreshTokenStatement
 * @returns {void}
 */
export const initDeleteRefreshTokenStatement = () => {
  const statement = inject(Database).prepare('DELETE FROM refresh_tokens WHERE token = ?');
  subscribe(DeleteRefreshToken, (token) => statement.run(token));
};
