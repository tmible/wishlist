import { inject } from '@tmible/wishlist-common/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';

/**
 * Удаление подарков из БД
 * @function eventHandler
 * @param {number[]} itemsIds Идентификаторы удаляемых подарков
 */
const eventHandler = (itemsIds) => {
  const db = inject(InjectionToken.Database);
  const idsPlaceholders = itemsIds.map(() => '?').join(', ');

  db.transaction(() => [
    `DELETE FROM description_entities WHERE list_item_id IN (${idsPlaceholders})`,
    `DELETE FROM participants WHERE list_item_id IN (${idsPlaceholders})`,
    `DELETE FROM list WHERE id IN (${idsPlaceholders})`,
  ].forEach((statement) => db.prepare(statement).run(itemsIds)))();
};

export default { eventHandler };
