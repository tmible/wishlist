import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения из БД с логами доли пользователей,
 * прошедших аутентификацию после посещения лендинга портала
 * в пределах указанного периода
 * @function initPortalAuthenticationFunnelStatement
 * @returns {void}
 */
export const initPortalAuthenticationFunnelStatement = () => provide(
  InjectionToken.PortalAuthenticationFunnelStatement,
  inject(InjectionToken.Database).prepare(`
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
  `),
);
