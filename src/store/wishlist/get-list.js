import { db } from 'wishlist-bot/store';
import descriptionEntitiesReducer from 'wishlist-bot/store/helpers/description-entities-reducer';
import participantsMapper from 'wishlist-bot/store/helpers/participants-mapper';

const getList = async () => {
  return (await db.all(`
    SELECT id, priority, name, description, state, participants, type, offset, length, additional
    FROM list
    LEFT JOIN (
      SELECT list_item_id, GROUP_CONCAT(username) as participants
      FROM participants
      GROUP BY list_item_id
    ) as participants ON list.id = participants.list_item_id
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
  `))
  .reduce(descriptionEntitiesReducer, [])
  .map(participantsMapper)
  .sort((a, b) => a.priority - b.priority);
};

export default getList;
