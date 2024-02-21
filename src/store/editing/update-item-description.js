/* eslint-disable-next-line import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { db } from '@tmible/wishlist-bot/store';
import saveItemDescriptionEntities from './helpers/save-item-description-entities.js';

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
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
 * @returns {void}
 */
const eventHandler = (itemId, description, entities) => {
  const parameters = [[ description, itemId ], itemId ];
  db.transaction(() => {
    statements.forEach((statement, i) => statement.run(parameters[i]));
    saveItemDescriptionEntities(itemId, entities, 0);
  })();
};

export default { eventHandler, prepare };
