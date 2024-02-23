import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 */

/**
 * Подготовленное выражение запроса БД
 * @type {Statement}
 */
let statement;

/**
 * Подготовка [выражения]{@link statement}
 * @function prepare
 * @returns {void}
 */
const prepare = () => {
  statement = inject(InjectionToken.Database).prepare(
    'SELECT username FROM usernames WHERE userid = ?',
  );
};

/**
 * Получение имени пользователя по идентификатору пользователя
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя
 * @returns {string} Имя пользователя
 */
const eventHandler = (userid) => statement.get(userid)?.username;

export default { eventHandler, prepare };
