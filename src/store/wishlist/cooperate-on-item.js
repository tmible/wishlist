import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';

const cooperateOnItem = (itemId, username) => {
  return Promise.all([
    db.run('INSERT INTO participants VALUES (?, ?)', [ itemId, username ]),
    db.run('UPDATE list SET state = ? WHERE id = ?', [ ListItemState.COOPERATIVE, itemId ]),
  ]);
};

export default cooperateOnItem;
