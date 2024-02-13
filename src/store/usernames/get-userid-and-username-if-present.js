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
const prepare = () => statement = db.prepare(
  'SELECT userid, username FROM usernames WHERE userid = ?',
);

/**
 * Проверка наличия идентификатора пользователя в БД
 * и возврат его и соответствующего имени пользователя при успехе
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя
 * @returns {[ number | null, string | null ]} Идентификатор пользователя и имя пользователя из БД
 */
const eventHandler = (userid) => {
  const user = statement.get(userid);
  return [ user?.userid ?? null, user?.username ?? null ];
}

export default { eventHandler, prepare };
