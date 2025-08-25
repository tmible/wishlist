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
  statement = inject(InjectionToken.Database).prepare('SELECT group_link FROM list WHERE id = ?');
};

/**
 * Получение ссылки на группу подарка
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @returns {void}
 */
const eventHandler = (itemId) => statement.get(itemId).group_link;

export default { eventHandler, prepare };
