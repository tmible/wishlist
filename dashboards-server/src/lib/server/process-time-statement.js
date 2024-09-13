import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики времени, потраченного ботом с получения
 * обновления до завершения его обработки, для каждого обновления в пределах указанного периода
 * @function initProcessTimeStatement
 * @returns {void}
 */
export const initProcessTimeStatement = () => provide(
  InjectionToken.ProcessTimeStatement,
  inject(InjectionToken.Database).prepare(`
    SELECT time, processTime
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS processTime
      FROM logs
      WHERE (msg = 'starting up' OR msg = 'finished clean up') AND time > ?
    )
    WHERE processTime IS NOT NULL
    `),
);
