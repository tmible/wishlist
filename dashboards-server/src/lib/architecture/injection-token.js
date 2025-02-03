/**
 * Перечисление токенов внедрения для
 * [
 *   ассоциации их со значениями
 * ]{@link import('@tmible/wishlist-common/dependency-injector').provide}
 * и [
 *   предоставления ассоциированных значений по токену
 * ]{@link import('@tmible/wishlist-common/dependency-injector.js').inject}
 * с помощью модуля внедрения зависимостей
 * @enum {string}
 */
export const InjectionToken = Object.freeze({
  Database: 'database',
  BotResponseTimeStatement: 'bot response time statement',
  BotProcessTimeStatement: 'bot process time statement',
  BotStartupTimeStatement: 'bot startup time statement',
  BotDAUStatement: 'bot DAU statement',
  BotMAUStatement: 'bot MAU statement',
  BotYAUStatement: 'bot YAU statement',
  BotSuccessRateStatement: 'bot success rate statement',
  BotUserSessionsStatement: 'bot user sessions statement',
  PortalResponseTimeStatement: 'portal response time statement',
  PortalDAUStatement: 'portal DAU statement',
  PortalMAUStatement: 'portal MAU statement',
  PortalYAUStatement: 'portal YAU statement',
  PortalSuccessRateStatement: 'portal success rate statement',
  PortalAuthenticationFunnelStatement: 'portal authentication funnel statement',
  ThemeService: 'theme service',
});
