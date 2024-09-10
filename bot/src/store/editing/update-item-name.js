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
  statement = inject(InjectionToken.Database).prepare('UPDATE list SET name = ? WHERE id = ?');
};

/**
 * Обновление названия подарка в БД
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {string} name Название подарка
 * @returns {void}
 */
const eventHandler = (itemId, name) => {
  statement.run(name, itemId);
};

export default { eventHandler, prepare };
