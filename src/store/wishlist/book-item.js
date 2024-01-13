import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';

const bookItem = (itemId, username) => {
  return Promise.all([
    db.run('INSERT INTO participants VALUES (?, ?)', [ itemId, username ]),
    db.run('UPDATE list SET state = ? WHERE id = ?', [ ListItemState.BOOKED, itemId ]),
  ]);
};

export default bookItem;
