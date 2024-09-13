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
  ResponseTimeStatement: 'response time statement',
  ProcessTimeStatement: 'process time statement',
  StartupTimeStatement: 'startup time statement',
  DAUStatement: 'DAU statement',
  MAUStatement: 'MAU statement',
  YAUStatement: 'YAU statement',
  SuccessRateStatement: 'success rate statement',
  UserSessionsStatement: 'user sessions statement',
  ThemeService: 'theme service',
});
