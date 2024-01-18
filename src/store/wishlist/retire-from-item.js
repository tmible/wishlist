import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';

const retireFromItem = (itemId, userid) => {
  return Promise.all([
    db.run(
      'DELETE FROM participants WHERE list_item_id = ? AND userid = ?',
      [ itemId, userid ],
    ),
    db.run(`
      WITH participants_list AS (
        SELECT id, participants
        FROM
        (SELECT id FROM list WHERE id = ?1) as list
        LEFT JOIN (
          SELECT list_item_id, GROUP_CONCAT(userid) as participants
          FROM participants
          GROUP BY list_item_id
        ) as participants ON list.id = participants.list_item_id
      )
      UPDATE list
      SET state = CASE WHEN EXISTS (
        SELECT *
        FROM participants_list
        WHERE participants_list.id = ?1 AND participants_list.participants IS NOT NULL
      ) THEN ?2 ELSE ?3 END
      WHERE id = ?1
    `, [ itemId, ListItemState.COOPERATIVE, ListItemState.FREE ]),
  ]);
};

export default retireFromItem;
