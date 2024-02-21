/* eslint-disable-next-line import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { db } from '@tmible/wishlist-bot/store';

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
const prepare = () => statement = db.prepare('UPDATE list SET priority = ? WHERE id = ?');

/**
 * Обновление приоритета подарка в БД
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {string} priority Приоритет подарка
 * @returns {void}
 */
const eventHandler = (itemId, priority) => {
  statement.run(priority, itemId);
};

export default { eventHandler, prepare };
