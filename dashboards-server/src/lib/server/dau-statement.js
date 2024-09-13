import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики DAU для каждого дня указанного периода
 * @function initDAUStatement
 * @returns {void}
 */
export const initDAUStatement = () => provide(
  InjectionToken.DAUStatement,
  inject(InjectionToken.Database).prepare(`
    WITH RECURSIVE days(day_end, day_start, period_end, n, period_start) AS (
      SELECT
        unixepoch($periodEnd / 1000, 'unixepoch', 'start of day', 'utc'),
        unixepoch(? / 1000, 'unixepoch', 'start of day', 'utc'),
        $periodEnd / 1000,
        1,
        $periodStart / 1000
      UNION ALL
      SELECT
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', 'start of day', 'utc'),
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', '-1 day', 'start of day', 'utc'),
        period_end,
        n + 1,
        period_start
      FROM days
      WHERE day_end > period_start
    )
    SELECT
      COUNT(DISTINCT userid) as dau,
      unixepoch(day_end, 'unixepoch') * 1000 AS date
    FROM days
    LEFT JOIN (SELECT time, userid FROM logs WHERE level = 30 AND msg = 'starting up') AS logs
    ON (logs.time / 1000 >= days.day_start AND logs.time / 1000 < days.day_end)
    GROUP BY day_end
  `),
);
