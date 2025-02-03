import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики MAU портала для каждого дня указанного периода
 * @function initPortalMAUStatement
 * @returns {void}
 */
export const initPortalMAUStatement = () => provide(
  InjectionToken.PortalMAUStatement,
  inject(InjectionToken.Database).prepare(`
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
      COUNT(DISTINCT unknownUserUuid) as mau,
      CASE n WHEN 0 THEN $periodEnd ELSE unixepoch(month_end - 1, 'unixepoch') * 1000 END AS date
    FROM months
    LEFT JOIN (SELECT timestamp, unknownUserUuid FROM 'portal.actions') AS logs
    ON (logs.timestamp / 1000 >= months.month_start AND logs.timestamp / 1000 < months.month_end)
    GROUP BY month_end
  `),
);
