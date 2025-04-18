import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '../../injection-tokens.js';
import { GetAuthenticationFunnel } from '../events.js';

/**
 * Создание SQL выражения для получения из БД с логами доли пользователей,
 * прошедших аутентификацию после посещения лендинга портала в пределах указанного периода.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initAuthenticationFunnelStatement
 * @returns {void}
 */
export const initAuthenticationFunnelStatement = () => {
  const statement = inject(Database).prepare(`
    WITH
    landingVisits AS (
      SELECT unknownUserUuid
      FROM 'portal.actions'
      WHERE action = 'landing visit' AND timestamp > $periodStart
    ),
    authentications AS (
      SELECT unknownUserUuid
      FROM 'portal.actions'
      WHERE action = 'authentication' AND timestamp > $periodStart
    )
    SELECT
      SUM(CASE WHEN authentications.unknownUserUuid IS NULL THEN 0 ELSE 1 END) AS authentications,
      COUNT (*) landingVisits
    FROM landingVisits
    LEFT JOIN authentications
    ON landingVisits.unknownUserUuid = authentications.unknownUserUuid
  `);
  subscribe(GetAuthenticationFunnel, (...args) => statement.get(...args));
};
