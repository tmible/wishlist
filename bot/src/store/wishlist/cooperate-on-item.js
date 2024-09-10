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
  /* eslint-disable @stylistic/js/array-bracket-spacing -- Форматирование по аналогии с {} */
  statements = [`
    INSERT INTO participants
    SELECT id, ? FROM list WHERE id = ? AND state != ${ListItemState.BOOKED}
  `, `
    UPDATE list
    SET state = ${ListItemState.COOPERATIVE}
    WHERE id = ? AND state != ${ListItemState.BOOKED}
  `].map((statement) => db.prepare(statement));
  /* eslint-enable @stylistic/js/array-bracket-spacing */
};

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
  const parameters = [[userid, itemId], itemId];
  inject(InjectionToken.Database).transaction(
    () => statements.forEach((statement, i) => statement.run(parameters[i])),
  )();
};

export default { eventHandler, prepare };
