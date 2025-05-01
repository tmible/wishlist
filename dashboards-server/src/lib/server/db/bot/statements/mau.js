import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetMAU } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами
 * метрики MAU бота для каждого дня указанного периода.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initMAUStatement
 * @returns {void}
 */
export const initMAUStatement = () => {
  const statement = inject(Database).prepare(`
    WITH RECURSIVE months(month_end, month_start, period_end, n, period_start) AS (
      SELECT
        unixepoch($periodEnd / 1000, 'unixepoch', '+1 day', 'start of day', 'utc'),
        unixepoch($periodEnd / 1000, 'unixepoch', '+1 day', '-1 month', 'start of day', 'utc'),
        $periodEnd / 1000,
        0,
        $periodStart / 1000
      UNION ALL
      SELECT
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', 'start of day', 'utc'),
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', '-1 month', 'start of day', 'utc'),
        period_end,
        n + 1,
        period_start
      FROM months
      WHERE month_end > period_start
    )
    SELECT
      COUNT(DISTINCT userid) as value,
      CASE n
        WHEN 0
        THEN $periodEnd
        ELSE unixepoch(month_end - 1, 'unixepoch') * 1000
      END
      AS timestamp
    FROM months
    LEFT JOIN (SELECT time, userid FROM 'bot.logs' WHERE level = 30 AND msg = 'starting up') AS logs
    ON (logs.time / 1000 >= months.month_start AND logs.time / 1000 < months.month_end)
    GROUP BY month_end
  `);
  subscribe(GetMAU, (periodStart, periodEnd) => statement.all({ periodStart, periodEnd }));
};
