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
  `INSERT INTO participants SELECT id, ? FROM list WHERE id = ? AND state != ${ListItemState.BOOKED}`,
  `UPDATE list SET state = ${ListItemState.COOPERATIVE} WHERE id = ? AND state != ${ListItemState.BOOKED}`,
].map((statement) => db.prepare(statement));

/**
 * Добавление пользователя в кооперацию по подарку
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {number} userid Идентификатор пользователя
 */
const eventHandler = (itemId, userid) => {
  const parameters = [[ userid, itemId ], itemId];
  db.transaction(() => statements.forEach((statement, i) => statement.run(parameters[i])))();
};

export default { eventHandler, prepare };
