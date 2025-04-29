import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { StoreRefreshToken } from '../events.js';

/**
 * Создание SQL выражения для сохранения refresh токена аутентификации.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initStoreRefreshTokenStatement
 * @returns {void}
 */
export const initStoreRefreshTokenStatement = () => {
  const statement = inject(Database).prepare(`
    INSERT INTO refresh_tokens VALUES($token, $userid, $unknownUserUuid, $expires)
    ON CONFLICT DO UPDATE SET
      (token, userid, unknownUserUuid, expires) = ($token, $userid, $unknownUserUuid, $expires)
  `);
  subscribe(
    StoreRefreshToken,
    (token, expires, userid, unknownUserUuid) => statement.run({
      token,
      expires,
      userid,
      unknownUserUuid,
    }),
  );
};
