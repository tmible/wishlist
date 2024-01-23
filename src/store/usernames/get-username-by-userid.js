import { db } from 'wishlist-bot/store';

let statement;

const prepare = () => statement = db.prepare('SELECT username FROM usernames WHERE userid = ?');

const eventHandler = (userid) => statement.get(userid)?.username;

export default { eventHandler, prepare };
