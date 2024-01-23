import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';
import saveItemDescriptionEntities from './helpers/save-item-description-entities.js';

let statement;

const prepare = () => statement = db.prepare(
  `INSERT INTO list (userid, priority, name, description, state) VALUES (?, ?, ?, ?, ${ListItemState.FREE}) RETURNING id`,
);

const eventHandler = (item, entities, descriptionOffset) => {
  db.transaction(() =>
    saveItemDescriptionEntities(statement.get(item).id, entities, descriptionOffset)
  )();
};

export default { eventHandler, prepare };
