import { db } from 'wishlist-bot/store';

/**
 * Подготовленное выражение запроса БД
 * @type {Statement}
 */
let statement;

/**
 * Подготовка [выражения]{@link statement}
 * @function prepare
 */
const prepare = () => statement = db.prepare('UPDATE list SET name = ? WHERE id = ?');

/**
 * Обновление названия подарка в БД
 * @function eventHandler
 * @param {string} itemId Идентификатор подарка
 * @param {string} name Название подарка
 */
const eventHandler = (itemId, name) => statement.run(name, itemId);

export default { eventHandler, prepare };
