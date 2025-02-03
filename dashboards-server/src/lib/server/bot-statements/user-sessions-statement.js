import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами всех полученных ботом обновлений
 * @function initBotUserSessionsStatement
 * @returns {void}
 */
export const initBotUserSessionsStatement = () => provide(
  InjectionToken.BotUserSessionsStatement,
  inject(InjectionToken.Database).prepare(`
    SELECT time, chatId, userid, updateType, updatePayload
    FROM 'bot.logs'
    WHERE level = 30 AND msg = 'start processing update'
    ORDER BY time DESC
  `),
);
