import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetRPS } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами
 * метрики RPS портала для каждой секунды указанного периода.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initRPSStatement
 * @returns {void}
 */
export const initRPSStatement = () => {
  const statement = inject(Database).prepare(`
    WITH aggregated AS (
      WITH by_seconds AS (
        WITH RECURSIVE seconds(second_end, second_start, period_end, n, period_start) AS (
          SELECT
            unixepoch($periodEnd / 1000, 'unixepoch', '+1 seconds'),
            unixepoch($periodEnd / 1000, 'unixepoch'),
            $periodEnd / 1000,
            0,
            $periodStart / 1000
          UNION ALL
          SELECT
            unixepoch(period_end, 'unixepoch', '-' || n || ' seconds'),
            unixepoch(period_end, 'unixepoch', '-' || n || ' seconds', '-1 seconds'),
            period_end,
            n + 1,
            period_start
          FROM seconds
          WHERE second_end > period_start
        )
        SELECT
          COUNT(DISTINCT requestUuid) as value,
          floor((second_end - period_start) / 3660) AS window,
          CASE n
          WHEN 0
          THEN $periodEnd
          ELSE unixepoch(second_end - 1, 'unixepoch') * 1000
          END AS timestamp
        FROM seconds
        LEFT JOIN (SELECT time AS timestamp, requestUuid FROM 'portal.logs') AS logs
        ON (
          logs.timestamp >= seconds.second_start * 1000 AND
          logs.timestamp < seconds.second_end * 1000
        )
        GROUP BY second_end
      )
      SELECT
        MAX(value) as value,
        timestamp,
        abs(value - LAG(value) OVER ()) + abs(value - LEAD(value) OVER ()) AS diff
      FROM by_seconds
      GROUP BY window
    )
    SELECT value, timestamp FROM aggregated WHERE diff ISNULL OR diff > 0
  `);
  subscribe(GetRPS, (periodStart, periodEnd) => statement.all({ periodStart, periodEnd }));
};
