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
    'UPDATE list SET group_link = NULL WHERE group_link = ?',
  );
};

/**
 * Удаление ссылки на группу подарка
 * @function eventHandler
 * @param {string} link Ссылка на группу
 * @returns {void}
 */
const eventHandler = (link) => statement.run(link);

export default { eventHandler, prepare };
