import { db } from 'wishlist-bot/store';
import descriptionEntitiesReducer from 'wishlist-bot/store/helpers/description-entities-reducer';
import participantsMapper from 'wishlist-bot/store/helpers/participants-mapper';

let statement;

const prepare = () => statement = db.prepare(`
  SELECT
    id,
    priority,
    name,
    description,
    state,
    participants,
    participants_ids,
    type,
    offset,
    length,
    additional
  FROM list
  LEFT JOIN (
    SELECT
      list_item_id,
      group_concat(CASE WHEN username IS NULL THEN '' ELSE username END) as participants,
      group_concat(participants.userid) as participants_ids
    FROM participants
    JOIN usernames ON usernames.userid = participants.userid
    GROUP BY list_item_id
  ) as participants ON list.id = participants.list_item_id
  LEFT JOIN description_entities ON list.id = description_entities.list_item_id
  WHERE userid = ?
`);

const eventHandler = (userid) => {
  return statement.all(userid)
  .reduce(descriptionEntitiesReducer, [])
  .map(participantsMapper)
  .sort((a, b) => a.priority - b.priority);
};

export default { eventHandler, prepare };
