import { db } from 'wishlist-bot/store';

const updateItemPriority = async (itemId, priority) => {
  await db.run('UPDATE list SET priority = ? WHERE id = ?', [ priority, itemId ]);
};

export default updateItemPriority;
