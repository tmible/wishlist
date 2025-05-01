import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetResponseTime } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами метрики времени,
 * потраченного серверной частью портала с получения запроса
 * до отправки ответа на него, для каждого запроса в пределах указанного периода.
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
        time - LAG(time, 1) OVER (PARTITION BY requestUuid ORDER BY time) AS responseTime
      FROM 'portal.logs'
      WHERE (msg LIKE 'request%' OR msg LIKE 'response%') AND time > ?
    )
    WHERE responseTime IS NOT NULL
    ORDER BY time
  `);
  subscribe(GetResponseTime, (periodStart) => statement.all(periodStart));
};
