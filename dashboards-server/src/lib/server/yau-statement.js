import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики YAU для каждого дня указанного периода
 * @function initYAUStatement
 * @returns {void}
 */
export const initYAUStatement = () => provide(
  InjectionToken.YAUStatement,
  inject(InjectionToken.Database).prepare(`
    WITH RECURSIVE years(year_end, year_start, period_end, n, period_start) AS (
      SELECT
        unixepoch($periodEnd / 1000, 'unixepoch', '+1 day', 'start of day', 'utc'),
        unixepoch($periodEnd / 1000, 'unixepoch', '+1 day', '-1 year', 'start of day', 'utc'),
        $periodEnd / 1000,
        0,
        $periodStart / 1000
      UNION ALL
      SELECT
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', 'start of day', 'utc'),
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', '-1 year', 'start of day', 'utc'),
        period_end,
        n + 1,
        period_start
      FROM years
      WHERE year_end > period_start
    )
    SELECT
      COUNT(DISTINCT userid) as yau,
      CASE n WHEN 0 THEN $periodEnd ELSE unixepoch(year_end - 1, 'unixepoch') * 1000 END AS date
    FROM years
    LEFT JOIN (SELECT time, userid FROM logs WHERE level = 30 AND msg = 'starting up') AS logs
    ON (logs.time / 1000 >= years.year_start AND logs.time / 1000 < years.year_end)
    GROUP BY year_end
  `),
);
