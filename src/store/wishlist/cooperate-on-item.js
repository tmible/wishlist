/* eslint-disable import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import { db } from '@tmible/wishlist-bot/store';

/* eslint-enable import/no-cycle */

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 */

/**
 * Подготовленные выражения запроса БД
 * @type {Statement[]}
 */
let statements;

/**
 * Подготовка [выражений]{@link statements}
 * @function prepare
 * @returns {void}
 */
const prepare = () => statements = [
  `
    INSERT INTO participants
    SELECT id, ? FROM list WHERE id = ? AND state != ${ListItemState.BOOKED}
  `,
  `
    UPDATE list
    SET state = ${ListItemState.COOPERATIVE}
    WHERE id = ? AND state != ${ListItemState.BOOKED}
  `,
].map((statement) => db.prepare(statement));

/**
 * Добавление пользователя в кооперацию по подарку
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {number} userid Идентификатор пользователя
 * @returns {void}
 */
const eventHandler = (itemId, userid) => {
  /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
    Пробел нужен для консистентности с другими элементами массива
  */
  const parameters = [ [ userid, itemId ], itemId ];
  db.transaction(() => statements.forEach((statement, i) => statement.run(parameters[i])))();
};

export default { eventHandler, prepare };
