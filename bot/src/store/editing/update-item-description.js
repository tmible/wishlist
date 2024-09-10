import { inject } from '@tmible/wishlist-common/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
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
const prepare = () => {
  const db = inject(InjectionToken.Database);
  statements = [
    'UPDATE list SET description = ? WHERE id = ?',
    'DELETE FROM description_entities WHERE list_item_id = ?',
  ].map((statement) => db.prepare(statement));
};

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
  inject(InjectionToken.Database).transaction(() => {
    statements.forEach((statement, i) => statement.run(parameters[i]));
    saveItemDescriptionEntities(itemId, entities, 0);
  })();
};

export default { eventHandler, prepare };
