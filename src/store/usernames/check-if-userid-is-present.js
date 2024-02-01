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
const prepare = () => statement = db.prepare('SELECT userid FROM usernames WHERE userid = ?');

/**
 * Проверка наличия идентификатора пользователя в БД
 * @function eventHandler
 * @param {string} userid Идентификатор пользователя
 * @returns {boolean} Признак наличия идентификатора пользователя в БД
 */
const eventHandler = (userid) => !!statement.get(userid)?.userid;

export default { eventHandler, prepare };
