import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import saveItemDescriptionEntities from './helpers/save-item-description-entities.js';

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
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
const prepare = () => {
  statement = inject(InjectionToken.Database).prepare(`
    INSERT INTO list (userid, priority, name, description, state)
    VALUES (?, ?, ?, ?, ${ListItemState.FREE})
    RETURNING id
  `);
};

/**
 * Сохранение подарка в БД
 * @function eventHandler
 * @param {[ number, number, string, string ]} item Подарок:
 *   идентификатор пользователя -- владельца списка,
 *   приоритет подарка,
 *   название подарка,
 *   описание подарка
 * @param {Entity[]} entities Элементы разметки текста описания подарка
 * @param {number} descriptionOffset Отступ начала описания подарка от начала текста сообщения
 * @returns {void}
 */
const eventHandler = (item, entities, descriptionOffset) => {
  inject(InjectionToken.Database).transaction(
    () => saveItemDescriptionEntities(statement.get(item).id, entities, descriptionOffset),
  )();
};

export default { eventHandler, prepare };
