import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetSuccessRate } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами метрики доли успешно
 * обработанных серверной частью портала запросов в пределах указанного периода.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initSuccessRateStatement
 * @returns {void}
 */
export const initSuccessRateStatement = () => {
  const statement = inject(Database).prepare(`
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
  `);
  subscribe(GetSuccessRate, (...args) => statement.get(...args));
};
