import { db } from 'wishlist-bot/store';
import descriptionEntitiesReducer from 'wishlist-bot/store/helpers/description-entities-reducer';

const getList = async (userid) => {
  return (await db.all(
    `SELECT id, priority, name, description, type, offset, length, additional
    FROM list
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
    WHERE userid = ?`,
    userid,
  ))
  .reduce(descriptionEntitiesReducer, [])
  .sort((a, b) => a.id - b.id);
};

export default getList;
