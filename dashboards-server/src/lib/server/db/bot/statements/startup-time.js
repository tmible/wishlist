import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetStartupTime } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами метрики времени,
 * потраченного ботом с получения обновления до начала его обработки,
 * для каждого обновления в пределах указанного периода.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initStartupTimeStatement
 * @returns {void}
 */
export const initStartupTimeStatement = () => {
  const statement = inject(Database).prepare(`
    SELECT time AS timestamp, startupTime AS value
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS startupTime
      FROM 'bot.logs'
      WHERE (msg = 'starting up' OR msg = 'start processing update') AND time > ?
    )
    WHERE startupTime IS NOT NULL
  `);
  subscribe(GetStartupTime, (periodStart) => statement.all(periodStart));
};
