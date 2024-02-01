import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import { db } from '@tmible/wishlist-bot/store';

/**
 * Подготовленные выражения запроса БД
 * @type {Statement[]}
 */
let statements;

/**
 * Подготовка [выражений]{@link statements}
 * @function prepare
 */
const prepare = () => statements = [
  `INSERT INTO participants SELECT id, ? FROM list WHERE id = ? AND state = ${ListItemState.FREE}`,
  `UPDATE list SET state = ${ListItemState.BOOKED} WHERE id = ? AND state = ${ListItemState.FREE}`,
].map((statement) => db.prepare(statement));

/**
 * Бронирование подарка за пользователем
 * @function eventHandler
 * @param {string} itemId Идентификатор подарка
 * @param {string} userid Идентификатор пользователя
 */
const eventHandler = (itemId, userid) => {
  const parameters = [[ userid, itemId ], itemId ];
  db.transaction(() => statements.forEach((statement, i) => statement.run(parameters[i])))();
};

export default { eventHandler, prepare };
