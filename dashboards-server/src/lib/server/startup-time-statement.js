import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики времени, потраченного ботом с получения
 * обновления до начала его обработки, для каждого обновления в пределах указанного периода
 * @function initStartupTimeStatement
 * @returns {void}
 */
export const initStartupTimeStatement = () => provide(
  InjectionToken.StartupTimeStatement,
  inject(InjectionToken.Database).prepare(`
    SELECT time, startupTime
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS startupTime
      FROM logs
      WHERE (msg = 'starting up' OR msg = 'start processing update') AND time > ?
    )
    WHERE startupTime IS NOT NULL
    `),
);
