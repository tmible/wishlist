import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами всех полученных ботом обновлений
 * @function initUserSessionsStatement
 * @returns {void}
 */
export const initUserSessionsStatement = () => provide(
  InjectionToken.UserSessionsStatement,
  inject(InjectionToken.Database).prepare(`
    SELECT time, chatId, userid, updateType, updatePayload
    FROM logs
    WHERE level = 30 AND msg = 'start processing update'
    ORDER BY time DESC
    `),
);
