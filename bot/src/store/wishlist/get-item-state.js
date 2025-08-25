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
  statement = inject(InjectionToken.Database).prepare('SELECT state from list WHERE id = ?');
};

/**
 * Получение состояния подарка
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @returns {void}
 */
const eventHandler = (itemId) => statement.get(itemId).state;

export default { eventHandler, prepare };
