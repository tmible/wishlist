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
    'SELECT userid, username FROM usernames WHERE hash = ?',
  );
};

/**
 * Проверка наличия хэша пользователя в БД и возврат
 * соответствующих идентификатора и имени пользователя при успехе
 * @function eventHandler
 * @param {string} hash Хэш пользователя
 * @returns {[ number | null, string | null ]} Идентификатор пользователя и имя пользователя из БД
 */
const eventHandler = (hash) => {
  const user = statement.get(hash);
  return [ user?.userid ?? null, user?.username ?? null ];
};

export default { eventHandler, prepare };
