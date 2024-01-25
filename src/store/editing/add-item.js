import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';
import saveItemDescriptionEntities from './helpers/save-item-description-entities.js';

/**
 * Подготовленное выражение запроса БД
 * @type {Statement}
 */
let statement;

/**
 * Подготовка [выражения]{@link statement}
 * @function prepare
 */
const prepare = () => statement = db.prepare(
  `INSERT INTO list (userid, priority, name, description, state) VALUES (?, ?, ?, ?, ${ListItemState.FREE}) RETURNING id`,
);

/**
 * Сохранение подарка в БД
 * @function eventHandler
 * @param {[ string, string, string, string ]} item Подарок:
 * идентификатор пользователя -- владельца списка, приоритет подарка, название подарка, описание подарка
 * @param {Entity[]} entities Элементы разметки текста описания подарка
 * @param {number} descriptionOffset Отступ начала описания подарка от начала текста сообщения
 */
const eventHandler = (item, entities, descriptionOffset) => {
  db.transaction(() =>
    saveItemDescriptionEntities(statement.get(item).id, entities, descriptionOffset)
  )();
};

export default { eventHandler, prepare };
