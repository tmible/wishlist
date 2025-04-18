import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetResponseTime } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами метрики времени,
 * потраченного ботом с получения обновления до отправки ответа пользователю,
 * для каждого обновления в пределах указанного периода.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initResponseTimeStatement
 * @returns {void}
 */
export const initResponseTimeStatement = () => {
  const statement = inject(Database).prepare(`
    SELECT time AS timestamp, responseTime AS value
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS responseTime
      FROM 'bot.logs'
      WHERE (msg = 'starting up' OR msg = 'update processed') AND time > ?
    )
    WHERE responseTime IS NOT NULL
  `);
  subscribe(GetResponseTime, (...args) => statement.all(...args));
};
