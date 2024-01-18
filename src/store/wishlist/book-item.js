import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';

const bookItem = (itemId, userid) => {
  return Promise.all([
    db.run('INSERT INTO participants VALUES (?, ?)', [ itemId, userid ]),
    db.run('UPDATE list SET state = ? WHERE id = ?', [ ListItemState.BOOKED, itemId ]),
  ]);
};

export default bookItem;
