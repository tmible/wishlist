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
  statement = inject(InjectionToken.Database).prepare('SELECT name from list WHERE id = ?');
};

/**
 * Получение названия подарка
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @returns {void}
 */
const eventHandler = (itemId) => statement.get(itemId).name;

export default { eventHandler, prepare };
