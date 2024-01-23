import { db } from 'wishlist-bot/store';

let statement;

export const prepare = () => statement = db.prepare('UPDATE list SET name = ? WHERE id = ?');

const eventHandler = (itemId, name) => statement.run(name, itemId);

export default { eventHandler, prepare };
