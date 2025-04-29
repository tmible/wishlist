import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetRefreshToken } from '../events.js';

/**
 * Создание SQL выражения для получения refresh токена аутентификации.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initGetRefreshTokenStatement
 * @returns {void}
 */
export const initGetRefreshTokenStatement = () => {
  const statement = inject(
    Database,
  ).prepare(
    'DELETE FROM refresh_tokens WHERE unknownUserUuid = ? RETURNING token, userid, expires',
  );
  subscribe(GetRefreshToken, (unknownUserUuid) => statement.get(unknownUserUuid));
};
