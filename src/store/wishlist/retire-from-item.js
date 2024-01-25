import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';

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
  'DELETE FROM participants WHERE list_item_id = ? AND userid = ?',
  `
    WITH participants_list AS (
      SELECT id, participants
      FROM
      (SELECT id FROM list WHERE id = $itemId) as list
      LEFT JOIN (
        SELECT list_item_id, GROUP_CONCAT(userid) as participants
        FROM participants
        GROUP BY list_item_id
      ) as participants ON list.id = participants.list_item_id
    )
    UPDATE list
    SET state = CASE WHEN EXISTS (
      SELECT *
      FROM participants_list
      WHERE participants_list.id = $itemId AND participants_list.participants IS NOT NULL
    ) THEN ? ELSE ? END
    WHERE id = $itemId
  `,
].map((statement) => db.prepare(statement));

/**
 * Удаление пользователя из кооперации по подарку или отмена бронирования подарка пользователем
 * @function eventHandler
 * @param {string} itemId Идентификатор подарка
 * @param {string} userid Идентификатор пользователя
 */
const eventHandler = (itemId, userid) => {
  const parameters = [
    [ itemId, userid ],
    [{ itemId }, [ ListItemState.COOPERATIVE, ListItemState.FREE ]],
  ];
  db.transaction(() => statements.forEach((statement, i) => statement.run(...parameters[i])))();
};

export default { eventHandler, prepare };
