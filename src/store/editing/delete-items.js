import { db } from 'wishlist-bot/store';

const deleteItems = async (itemsIds) => {
  const idsPlaceholders = new Array(itemsIds.length).fill('?').join(', ');
  await Promise.all([
    db.run(`DELETE FROM description_entities WHERE list_item_id IN (${idsPlaceholders})`, itemsIds),
    db.run(`DELETE FROM participants WHERE list_item_id IN (${idsPlaceholders})`, itemsIds),
  ]);
  await db.run(`DELETE FROM list WHERE id IN (${idsPlaceholders})`, itemsIds);
};

export default deleteItems;
