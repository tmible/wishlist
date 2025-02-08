import { inject } from '@tmible/wishlist-common/dependency-injector';
import sha256 from '@tmible/wishlist-common/sha-256';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 */

/**
 * Подготовленные выражения запроса БД
 * @type {Record<string, Statement>}
 */
const statements = {};

/**
 * Подготовка [выражений]{@link statements}
 * @function prepare
 * @returns {void}
 */
const prepare = () => {
  const db = inject(InjectionToken.Database);
  statements.get = db.prepare('SELECT hash FROM usernames WHERE userid = ?');
  statements.set = db.prepare('UPDATE usernames SET hash = ? WHERE userid = ?');
};

/**
 * Получение хэша от идентификатора пользователя с предварительной
 * генерацией и записью при отсутствии в БД
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя
 * @returns {string} Хэш от идентификатора пользователя
 * @async
 */
const eventHandler = async (userid) => {
  let hash = statements.get.get(userid)?.hash;

  /* eslint-disable-next-line
    security/detect-possible-timing-attacks,
    security-node/detect-possible-timing-attacks --
    Сравнение с null */
  if (hash === null) {
    hash = await sha256(userid);
    hash = hash.slice(0, 7);
    statements.set.run(hash, userid);
  }

  return hash;
};

export default { eventHandler, prepare };
