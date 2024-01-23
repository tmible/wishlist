import { db } from 'wishlist-bot/store';
import saveItemDescriptionEntities from './helpers/save-item-description-entities.js';

let statements;

const prepare = () => statements = [
  'UPDATE list SET description = ? WHERE id = ?',
  'DELETE FROM description_entities WHERE list_item_id = ?',
].map((statement) => db.prepare(statement));

const eventHandler = (itemId, description, entities) => {
  const parameters = [[ description, itemId ], itemId ];
  db.transaction(() => {
    statements.forEach((statement, i) => statement.run(parameters[i]));
    saveItemDescriptionEntities(itemId, entities, 0);
  })();
};

export default { eventHandler, prepare };
