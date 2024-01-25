import { db } from 'wishlist-bot/store';
import descriptionEntitiesReducer from 'wishlist-bot/store/helpers/description-entities-reducer';

/**
 * Элемент списка желаний пользователя
 * во варианте отображения для владельца
 * @typedef {Object} OwnListItem
 * @property {number} id Идентификатор элемента
 * @property {number} priority Приоритет элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
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
  SELECT id, priority, name, description, type, offset, length, additional
  FROM list
  LEFT JOIN description_entities ON list.id = description_entities.list_item_id
  WHERE userid = ?
`);

/**
 * Получение пользователем своего списка желаний
 * @function eventHandler
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @returns {OwnListItem[]} Список желаний пользователя, отсортированный по возрастанию идентификаторов
 */
const eventHandler = (userid) => {
  return statement.all(userid)
  .reduce(descriptionEntitiesReducer, [])
  .sort((a, b) => a.id - b.id);
};

export default { eventHandler, prepare };
