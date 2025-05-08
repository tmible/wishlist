import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import participantsMapper from './helpers/participants-mapper.js';

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 * @typedef {import('@tmible/wishlist-common/constants/list-item-state').default} ListItemState
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
 */
/**
 * Элемент списка желаний пользователя
 * во варианте отображения для других пользователей
 * @typedef {object} ListItem
 * @property {number} id Идентификатор элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
 * @property {ListItemState} state Состояние подарка
 * @property {number} order Порядковый номер элемента
 * @property {string | null} category Категория элемента
 * @property {string[]} participants Имена пользователей -- участников кооперации по подарку
 *   или имя забронировавшего пользователя
 * @property {number[]} participantsIds Идентификаторы пользователей -- участников кооперации
 *   по подарку или идентификатор забронировавшего пользователя
 * @property {Entity[]} descriptionEntities Элементы разметки текста описания подарка
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
const prepare = () => statement = inject(InjectionToken.Database).prepare(`
  SELECT
    list.id,
    list.name,
    description,
    state,
    "order",
    categories.name AS category,
    participants,
    participants_ids,
    type,
    offset,
    length,
    additional,
    added_by.id AS addedById,
    added_by.name AS addedBy
  FROM (
    SELECT id, name, description, state, "order", category_id, added_by
    FROM list
    WHERE userid = ?
  ) AS list
  LEFT JOIN (
    SELECT
      list_item_id,
      group_concat(CASE WHEN username IS NULL THEN '' ELSE username END) AS participants,
      group_concat(participants.userid) AS participants_ids
    FROM participants
    JOIN usernames ON usernames.userid = participants.userid
    GROUP BY list_item_id
  ) AS participants ON list.id = participants.list_item_id
  LEFT JOIN (
    SELECT userid as id, username as name FROM usernames
  ) AS added_by ON list.added_by = added_by.id
  LEFT JOIN description_entities ON list.id = description_entities.list_item_id
  LEFT JOIN categories ON list.category_id = categories.id
`);

/**
 * Получение списка желаний пользователя для других пользователей
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {ListItem[]} Список желаний пользователя, отсортированный в заданном владельцем порядке
 */
const eventHandler = (userid) => statement
  .all(userid)
  /* eslint-disable-next-line unicorn/no-array-callback-reference --
    descriptionEntitiesReducer -- специально написанная для использования в reduce() функция
  */
  .reduce(descriptionEntitiesReducer, [])
  /* eslint-disable-next-line unicorn/no-array-callback-reference --
    participantsMapper -- специально написанная для использования в map() функция
  */
  .map(participantsMapper)
  .sort((a, b) => a.order - b.order);

export default { eventHandler, prepare };
