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
  statement = inject(InjectionToken.Database).prepare(`
    INSERT INTO usernames (userid, username) VALUES ($userid, $username)
    ON CONFLICT DO UPDATE SET username = $username WHERE userid = $userid
  `);
};

/**
 * Сохранение идентификатора и имени пользователя в БД
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя
 * @param {string} username Имя пользователя
 * @returns {void}
 */
const eventHandler = (userid, username) => {
  statement.run({ userid, username });
};

export default { eventHandler, prepare };
