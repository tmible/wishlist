import { db } from '@tmible/wishlist-bot/store';
import descriptionEntitiesReducer from '@tmible/wishlist-bot/store/helpers/description-entities-reducer';
import participantsMapper from '@tmible/wishlist-bot/store/helpers/participants-mapper';

/**
 * Обязательная часть элемента разметки текста
 * @typedef {Object} EntityBase
 * @property {string} type Тип элемента
 * @property {number} offset Отступ от начала строки
 * @property {number} length Длина
 *
 * Элемент разметки текста
 * @typedef {EntityBase & Record<string, unknown>} Entity
 *
 * Элемент списка желаний пользователя
 * во варианте отображения для других пользователей
 * @typedef {Object} ListItem
 * @property {number} id Идентификатор элемента
 * @property {number} priority Приоритет элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
 * @property {ListItemState} state Состояние подарка
 * @property {string[]} participants Имена пользователей -- участников кооперации по подарку или имя забронировавшего пользователя
 * @property {number[]} participantsIds Идентификаторы пользователей -- участников кооперации по подарку или идентификатор забронировавшего пользователя
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
const eventHandler = (userid) => {
  return statement.all(userid)
  .reduce(descriptionEntitiesReducer, [])
  .map(participantsMapper)
  .sort((a, b) => a.priority - b.priority);
};

export default { eventHandler, prepare };
