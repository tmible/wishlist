import { db } from '@tmible/wishlist-bot/store';

/**
 * Подготовленное выражение запроса БД
 * @type {Statement}
 */
let statement;

/**
 * Подготовка [выражения]{@link statement}
 * @function prepare
 */
const prepare = () => statement = db.prepare('UPDATE list SET priority = ? WHERE id = ?');

/**
 * Обновление приоритета подарка в БД
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {string} priority Приоритет подарка
 */
const eventHandler = (itemId, priority) => statement.run(priority, itemId);

export default { eventHandler, prepare };
