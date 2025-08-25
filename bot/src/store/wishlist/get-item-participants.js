import { inject } from '@tmible/wishlist-common/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import participantsMapper from './helpers/participants-mapper.js';

/** @typedef {import('better-sqlite3').Statement} Statement */
/** @typedef {import('./get-list.js').ListItem} ListItem */

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
const prepare = () => statement = inject(InjectionToken.Database).prepare(`
  SELECT participants, participants_ids
  FROM (SELECT id FROM list WHERE id = ?) AS list
  LEFT JOIN (
    SELECT
      list_item_id,
      group_concat(CASE WHEN username IS NULL THEN '' ELSE username END) AS participants,
      group_concat(participants.userid) AS participants_ids
    FROM participants
    JOIN usernames ON usernames.userid = participants.userid
    GROUP BY list_item_id
  ) AS participants ON list.id = participants.list_item_id
`);

/**
 * Получение списка участников кооперации по подарку
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @returns {ListItem['participantsIds']} Список участников кооперации
 */
const eventHandler = (itemId) => participantsMapper(statement.get(itemId)).participantsIds;

export default { eventHandler, prepare };
