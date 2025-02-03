import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики доли успешно
 * обработанных серверной частью портала запросов в пределах указанного периода
 * @function initPortalSuccessRateStatement
 * @returns {void}
 */
export const initPortalSuccessRateStatement = () => provide(
  InjectionToken.PortalSuccessRateStatement,
  inject(InjectionToken.Database).prepare(`
    WITH
    starts AS (
      SELECT requestUuid
      FROM 'portal.logs'
      WHERE level = 30 AND msg LIKE 'request%' AND time > $periodStart
    ),
    errors AS (
      SELECT requestUuid FROM 'portal.logs' WHERE level = 50 AND time > $periodStart
    )
    SELECT
      SUM(CASE WHEN errors.requestUuid IS NULL THEN 1 ELSE 0 END) AS successful,
      COUNT (*) total
    FROM starts
    LEFT JOIN errors
    ON starts.requestUuid = errors.requestUuid
  `),
);
