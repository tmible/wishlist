/**
 * Перечисление токенов внедрения для [
 *   ассоциации их со значениями
 * ]{@link import('@tmible/wishlist-common/dependency-injector').provide}
 * и [
 *   предоставления ассоциированных значений по токену
 * ]{@link import('@tmible/wishlist-common/dependency-injector.js').inject}
 * с помощью модуля внедрения зависимостей
 * @enum {string}
 */
const InjectionToken = Object.freeze({
  EventBus: 'event bus',
  Database: 'database',
  LocalDatabase: 'local database',
  Logger: 'logger',
});

export default InjectionToken;
