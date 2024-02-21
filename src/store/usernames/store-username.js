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
const prepare = () => statement = db.prepare('INSERT INTO usernames VALUES (?, ?)');

/**
 * Сохранение идентификатора и имени пользователя в БД
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя
 * @param {string} username Имя пользователя
 * @returns {void}
 */
const eventHandler = (userid, username) => {
  statement.run(userid, username);
};

export default { eventHandler, prepare };
