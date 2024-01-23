import { db } from 'wishlist-bot/store';

let statement;

const prepare = () => statement = db.prepare('UPDATE list SET priority = ? WHERE id = ?');

const eventHandler = (itemId, priority) => statement.run(priority, itemId);

export default { eventHandler, prepare };
