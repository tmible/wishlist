import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetProcessTime } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами метрики времени,
 * потраченного ботом с получения обновления до завершения его обработки,
 * для каждого обновления в пределах указанного периода.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initProcessTimeStatement
 * @returns {void}
 */
export const initProcessTimeStatement = () => {
  const statement = inject(Database).prepare(`
    SELECT time AS timestamp, processTime AS value
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS processTime
      FROM 'bot.logs'
      WHERE (msg = 'starting up' OR msg = 'finished clean up') AND time > ?
    )
    WHERE processTime IS NOT NULL
  `);
  subscribe(GetProcessTime, (...args) => statement.all(...args));
};
