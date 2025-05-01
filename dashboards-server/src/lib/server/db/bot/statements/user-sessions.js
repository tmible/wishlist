import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetUserSessions } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами всех полученных ботом обновлений.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initUserSessionsStatement
 * @returns {void}
 */
export const initUserSessionsStatement = () => {
  const statement = inject(Database).prepare(`
    SELECT time, chatId, userid, updateType, updatePayload
    FROM 'bot.logs'
    WHERE level = 30 AND msg = 'start processing update'
    ORDER BY time DESC
  `);
  subscribe(GetUserSessions, () => statement.all());
};
