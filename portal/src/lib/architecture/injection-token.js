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
  AddUserStatement: 'add user statement',
  GetUserWishlistStatement: 'get user wishlist statement',
  AddItemStatement: 'add item statement',
  ThemeService: 'theme service',
  IPCHub: 'IPC hub',
  GetUserCategoriesStatement: 'get user categories statement',
  AddCategoryStatement: 'add category statement',
  ChangesStatement: 'Changes statement',
  UpdateCategoryStatement: 'update category statement',
  DeleteCategoryStatement: 'delete category statement',
  GetUserHashStatement: 'get user hash statement',
  SetUserHashStatement: 'set user hash statement',
  LogsDatabase: 'logs database',
  AddActionStatement: 'add action statement',
  Logger: 'logger',
});
