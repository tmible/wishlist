import { db } from 'wishlist-bot/store';

/**
 * Удаление подарков из БД
 * @function eventHandler
 * @param {string[]} itemsIds Идентификаторы удаляемых подарков
 */
const eventHandler = (itemsIds) => {
  const idsPlaceholders = new Array(itemsIds.length).fill('?').join(', ');
  db.transaction(() =>
    [
      `DELETE FROM description_entities WHERE list_item_id IN (${idsPlaceholders})`,
      `DELETE FROM participants WHERE list_item_id IN (${idsPlaceholders})`,
      `DELETE FROM list WHERE id IN (${idsPlaceholders})`,
    ].forEach((statement) => db.prepare(statement).run(itemsIds))
  )();
};

export default { eventHandler };
