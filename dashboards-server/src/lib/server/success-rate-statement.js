import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики доли успешно
 * обработанных ботом обновлений в пределах указанного периода
 * @function initSuccessRateStatement
 * @returns {void}
 */
export const initSuccessRateStatement = () => provide(
  InjectionToken.SuccessRateStatement,
  inject(InjectionToken.Database).prepare(`
    WITH
    starts AS (
      SELECT updateId FROM logs WHERE level = 30 AND msg = 'starting up' AND time > $periodStart
    ),
    errors AS (
      SELECT updateId FROM logs WHERE level = 50 AND time > $periodStart
    )
    SELECT
      SUM(CASE WHEN errors.updateId IS NULL THEN 1 ELSE 0 END) AS successful,
      COUNT (*) total
    FROM starts
    LEFT JOIN errors
    ON starts.updateId = errors.updateId
    `),
);
