import { db } from '@tmible/wishlist-bot/store';
import saveItemDescriptionEntities from './helpers/save-item-description-entities.js';

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
  'UPDATE list SET description = ? WHERE id = ?',
  'DELETE FROM description_entities WHERE list_item_id = ?',
].map((statement) => db.prepare(statement));

/**
 * Обновление описания подарка в БД
 * @function eventHandler
 * @param {number} itemId Идентификатор подарка
 * @param {string} description Описание подарка
 * @param {Entity[]} entities Элементы разметки текста описания подарка
 */
const eventHandler = (itemId, description, entities) => {
  const parameters = [[ description, itemId ], itemId ];
  db.transaction(() => {
    statements.forEach((statement, i) => statement.run(parameters[i]));
    saveItemDescriptionEntities(itemId, entities, 0);
  })();
};

export default { eventHandler, prepare };
