import { db } from 'wishlist-bot/store';

const updateItemName = async (itemId, name) => {
  await db.run('UPDATE list SET name = ? WHERE id = ?', [ name, itemId ]);
};

export default updateItemName;
