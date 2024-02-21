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
const prepare = () => statement = db.prepare('SELECT username FROM usernames WHERE userid = ?');

/**
 * Получение имени пользователя по идентификатору пользователя
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя
 * @returns {string} Имя пользователя
 */
const eventHandler = (userid) => statement.get(userid)?.username;

export default { eventHandler, prepare };
