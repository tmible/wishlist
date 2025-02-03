import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики DAU портала для каждого дня указанного периода
 * @function initPortalDAUStatement
 * @returns {void}
 */
export const initPortalDAUStatement = () => provide(
  InjectionToken.PortalDAUStatement,
  inject(InjectionToken.Database).prepare(`
    WITH RECURSIVE days(day_end, day_start, period_end, n, period_start) AS (
      SELECT
        unixepoch($periodEnd / 1000, 'unixepoch', '+1 day', 'start of day', 'utc'),
        unixepoch($periodEnd / 1000, 'unixepoch', 'start of day', 'utc'),
        $periodEnd / 1000,
        0,
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
      COUNT(DISTINCT unknownUserUuid) as dau,
      CASE n WHEN 0 THEN $periodEnd ELSE unixepoch(day_end - 1, 'unixepoch') * 1000 END AS date
    FROM days
    LEFT JOIN (SELECT timestamp, unknownUserUuid FROM 'portal.actions') AS logs
    ON (logs.timestamp / 1000 >= days.day_start AND logs.timestamp / 1000 < days.day_end)
    GROUP BY day_end
  `),
);
