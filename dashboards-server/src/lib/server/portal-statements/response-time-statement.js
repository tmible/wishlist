import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики времени,
 * потраченного серверной частью портала с получения запроса
 * до отправки ответа на него, для каждого запроса в пределах указанного периода
 * @function initPortalResponseTimeStatement
 * @returns {void}
 */
export const initPortalResponseTimeStatement = () => provide(
  InjectionToken.PortalResponseTimeStatement,
  inject(InjectionToken.Database).prepare(`
    SELECT time, responseTime
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY requestUuid ORDER BY time) AS responseTime
      FROM 'portal.logs'
      WHERE (msg LIKE 'request%' OR msg LIKE 'response%') AND time > ?
    )
    WHERE responseTime IS NOT NULL
    ORDER BY time
  `),
);
