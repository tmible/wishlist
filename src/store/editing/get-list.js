import { db } from 'wishlist-bot/store';
import descriptionEntitiesReducer from 'wishlist-bot/store/helpers/description-entities-reducer';

let statement;

const prepare = () => statement = db.prepare(`
  SELECT id, priority, name, description, type, offset, length, additional
  FROM list
  LEFT JOIN description_entities ON list.id = description_entities.list_item_id
  WHERE userid = ?
  GROUP BY id
`);

const eventHandler = (userid) => {
  return statement.all(userid)
  .reduce(descriptionEntitiesReducer, [])
  .sort((a, b) => a.id - b.id);
};

export default { eventHandler, prepare };
