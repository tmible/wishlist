import { db } from 'wishlist-bot/store';

let statement;

const prepare = () => statement = db.prepare('INSERT INTO usernames VALUES (?, ?)');

const eventHandler = (userid, username) => statement.get(userid, username);

export default { eventHandler, prepare };
