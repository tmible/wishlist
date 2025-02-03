import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами метрики времени, потраченного ботом с получения
 * обновления до отправки ответа пользователю, для каждого обновления в пределах указанного периода
 * @function initBotResponseTimeStatement
 * @returns {void}
 */
export const initBotResponseTimeStatement = () => provide(
  InjectionToken.BotResponseTimeStatement,
  inject(InjectionToken.Database).prepare(`
    SELECT time, responseTime
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS responseTime
      FROM 'bot.logs'
      WHERE (msg = 'starting up' OR msg = 'update processed') AND time > ?
    )
    WHERE responseTime IS NOT NULL
  `),
);
