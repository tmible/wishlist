/* eslint-disable-next-line import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { db } from '@tmible/wishlist-bot/store';

/**
 * Удаление подарков из БД
 * @function eventHandler
 * @param {number[]} itemsIds Идентификаторы удаляемых подарков
 */
const eventHandler = (itemsIds) => {
  const idsPlaceholders = itemsIds.reduce(
    (placeholders) => (placeholders.length > 0 ? `${placeholders},?` : '?'),
    '',
  );
  db.transaction(() => [
    `DELETE FROM description_entities WHERE list_item_id IN (${idsPlaceholders})`,
    `DELETE FROM participants WHERE list_item_id IN (${idsPlaceholders})`,
    `DELETE FROM list WHERE id IN (${idsPlaceholders})`,
  ].forEach((statement) => db.prepare(statement).run(itemsIds)))();
};

export default { eventHandler };
