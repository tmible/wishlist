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
const prepare = () => statement = db.prepare('SELECT username FROM usernames WHERE userid = ?');

/**
 * Получение имени пользователя по идентификатору пользователя
 * @function eventHandler
 * @param {string} userid Идентификатор пользователя
 * @returns {string} Имя пользователя
 */
const eventHandler = (userid) => statement.get(userid)?.username;

export default { eventHandler, prepare };
