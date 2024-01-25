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
const prepare = () => statement = db.prepare('INSERT INTO usernames VALUES (?, ?)');

/**
 * Сохранение идентификатора и имени пользователя в БД
 * @function eventHandler
 * @param {string} userid Идентификатор пользователя
 * @param {string} username Имя пользователя
 */
const eventHandler = (userid, username) => statement.run(userid, username);

export default { eventHandler, prepare };
