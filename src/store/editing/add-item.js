import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';

const addItem = (item) => {
  return db.run(
    `INSERT INTO list (username, priority, name, description, state) VALUES (?, ?, ?, ?, ${ListItemState.FREE})`,
    item,
  );
};

export default addItem;
