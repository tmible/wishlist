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
export const InjectionToken = Object.freeze({ ThemeService: 'theme service' });
