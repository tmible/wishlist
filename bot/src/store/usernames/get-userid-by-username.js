import { inject } from '@tmible/wishlist-common/dependency-injector';
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
    'SELECT userid FROM usernames WHERE username = ?',
  );
};

/**
 * Получение идентификатора пользователя по имени пользователя
 * @function eventHandler
 * @param {string} username Имя пользователя
 * @returns {number | undefined} Идентификатор пользователя
 */
const eventHandler = (username) => statement.get(username)?.userid;

export default { eventHandler, prepare };
