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
    'UPDATE list SET group_link = ? WHERE id = ?',
  );
};

/**
 * Добавление подарку ссылки на группу
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {string} groupLink Ссылка на группу
 * @returns {void}
 */
const eventHandler = (itemId, groupLink) => statement.run(groupLink, itemId);

export default { eventHandler, prepare };
