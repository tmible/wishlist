/**
 * Перечисление токенов внедрения для
 * [ассоциации их со значениями]{@link import('./dependency-injector.js').provide}
 * и [
 *   предоставления ассоциированных значений по токену
 * ]{@link import('./dependency-injector.js').inject}
 * с помощью модуля внедрения зависимостей
 * @enum {string}
 */
const InjectionToken = Object.freeze({
  EventBus: 'event bus',
  Database: 'database',
  LocalDatabase: 'local database',
});

export default InjectionToken;
