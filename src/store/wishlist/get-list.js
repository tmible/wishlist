/* eslint-disable import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { db } from '@tmible/wishlist-bot/store';
import descriptionEntitiesReducer from '@tmible/wishlist-bot/store/helpers/description-entities-reducer';
import participantsMapper from '@tmible/wishlist-bot/store/helpers/participants-mapper';

/* eslint-enable import/no-cycle */

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 * @typedef {import('@tmible/wishlist-bot/constants/list-item-state').default} ListItemState
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
 */
/**
 * Элемент списка желаний пользователя
 * во варианте отображения для других пользователей
 * @typedef {object} ListItem
 * @property {number} id Идентификатор элемента
 * @property {number} priority Приоритет элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
 * @property {ListItemState} state Состояние подарка
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
const prepare = () => statement = db.prepare(`
  SELECT
    id,
    priority,
    name,
    description,
    state,
    participants,
    participants_ids,
    type,
    offset,
    length,
    additional
  FROM (SELECT id, priority, name, description, state FROM list WHERE userid = ?) AS list
  LEFT JOIN (
    SELECT
      list_item_id,
      group_concat(CASE WHEN username IS NULL THEN '' ELSE username END) as participants,
      group_concat(participants.userid) as participants_ids
    FROM participants
    JOIN usernames ON usernames.userid = participants.userid
    GROUP BY list_item_id
  ) as participants ON list.id = participants.list_item_id
  LEFT JOIN description_entities ON list.id = description_entities.list_item_id
`);

/**
 * Получение списка желаний пользователя для других пользователей
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {ListItem[]} Список желаний пользователя, отсортированный по убыванию приоритета
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
  .sort((a, b) => a.priority - b.priority);

export default { eventHandler, prepare };
