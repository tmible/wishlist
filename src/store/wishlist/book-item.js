import ListItemState from 'wishlist-bot/constants/list-item-state';
import { db } from 'wishlist-bot/store';

let statements;

const prepare = () => statements = [
  `INSERT INTO participants SELECT id, ? FROM list WHERE id = ? AND state = ${ListItemState.FREE}`,
  `UPDATE list SET state = ${ListItemState.BOOKED} WHERE id = ? AND state = ${ListItemState.FREE}`,
].map((statement) => db.prepare(statement));

const eventHandler = (itemId, userid) => {
  const parameters = [[ userid, itemId ], itemId ];
  db.transaction(() => statements.forEach((statement, i) => statement.run(parameters[i])))();
};

export default { eventHandler, prepare };
