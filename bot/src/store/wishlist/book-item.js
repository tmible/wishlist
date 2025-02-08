import ListItemState from '@tmible/wishlist-common/constants/list-item-state';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';

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
const prepare = () => {
  const db = inject(InjectionToken.Database);
  statements = [`
    INSERT INTO participants
    SELECT id, ? FROM list WHERE id = ? AND state = ${ListItemState.FREE}
  `, `
    UPDATE list
    SET state = ${ListItemState.BOOKED}
    WHERE id = ? AND state = ${ListItemState.FREE}
  `].map((statement) => db.prepare(statement));
};

/**
 * Бронирование подарка за пользователем
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {number} userid Идентификатор пользователя
 * @returns {void}
 */
const eventHandler = (itemId, userid) => {
  const parameters = [[ userid, itemId ], itemId ];
  inject(InjectionToken.Database).transaction(
    () => statements.forEach((statement, i) => statement.run(parameters[i])),
  )();
};

export default { eventHandler, prepare };
