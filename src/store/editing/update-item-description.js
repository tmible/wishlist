import { db } from 'wishlist-bot/store';

const updateItemDescription = async (itemId, description) => {
  await Promise.all([
    db.run('UPDATE list SET description = ? WHERE id = ?', [ description, itemId ]),
    db.run('DELETE FROM description_entities WHERE list_item_id = ?', itemId),
  ]);
};

export default updateItemDescription;
