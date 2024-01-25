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
const prepare = () => statement = db.prepare('SELECT userid FROM usernames WHERE username = ?');

/**
 * Получение идентификатора пользователя по имени пользователя
 * @function eventHandler
 * @param {string} username Имя пользователя
 * @returns {string} Идентификатор пользователя
 */
const eventHandler = (username) => statement.get(username)?.userid;

export default { eventHandler, prepare };
