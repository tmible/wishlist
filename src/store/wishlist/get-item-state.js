import { db } from 'wishlist-bot/store';

const getItemState = async (itemId) => {
  return (await db.get('SELECT state FROM list WHERE id = ?', [ itemId ])).state;
};

export default getItemState;
